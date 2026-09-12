"use client";

import { useState } from "react";
import Papa from "papaparse";
import { UploadCloud, Loader2 } from "lucide-react";
import { bulkImportProducts, ImportRow, ImportResult } from "./actions";

export default function ImportForm() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setResult(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          const parsed: ImportRow[] = res.data.map((r) => ({
            name: r.name?.trim() || "",
            slug: r.slug?.trim() || "",
            description: r.description?.trim() || "",
            price: parseFloat(r.price) || 0,
            discountPrice: r.discountPrice ? parseFloat(r.discountPrice) : undefined,
            stock: r.stock ? parseInt(r.stock, 10) : 0,
            categorySlug: r.categorySlug?.trim() || "",
            images: r.images?.trim() || "",
            isFeatured: ["true", "1", "yes"].includes((r.isFeatured || "").toLowerCase()),
          }));
          setRows(parsed);
        } catch {
          setParseError("CSV পার্স করা যায়নি। ফরম্যাট চেক করুন।");
        }
      },
      error: () => setParseError("CSV পড়া যায়নি।"),
    });
  };

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await bulkImportProducts(rows);
      setResult(res);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "ইমপোর্ট ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 cursor-pointer">
        <UploadCloud className="w-8 h-8 mb-2" />
        <span className="text-sm">{fileName || "CSV ফাইল নির্বাচন করুন"}</span>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {parseError && <p className="text-red-600 text-sm">{parseError}</p>}

      {rows.length > 0 && !result && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm mb-3">
            <strong>{rows.length}</strong> টি সারি পাওয়া গেছে। এগুলো ইমপোর্ট করতে নিচের বাটনে ক্লিক করুন।
          </p>
          <button
            onClick={handleImport}
            disabled={loading}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "ইমপোর্ট হচ্ছে..." : `${rows.length}টি পণ্য ইমপোর্ট করুন`}
          </button>
        </div>
      )}

      {result && (
        <div className="border rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">
            {result.createdOrUpdated} টি পণ্য সফলভাবে তৈরি/আপডেট হয়েছে।
          </p>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-red-600 font-medium mb-1">
                {result.errors.length} টি সারিতে সমস্যা হয়েছে:
              </p>
              <ul className="text-xs text-red-600 space-y-0.5 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    সারি {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
