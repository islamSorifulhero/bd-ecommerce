"use client";

import { useState } from "react";
import Image from "next/image";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);

    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadToCloudinary(file);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(
        "আপলোড ব্যর্থ হয়েছে। Cloudinary env var ও unsigned preset ঠিক আছে কিনা চেক করুন।"
      );
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">পণ্যের ছবি</label>

      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((url) => (
          <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border">
            <Image src={url} alt="product" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:border-green-500 hover:text-green-600">
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-5 h-5" />
              <span className="text-[10px] mt-1">আপলোড</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}
