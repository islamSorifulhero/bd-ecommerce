"use client";

import { Download } from "lucide-react";

export default function ExportCsvButton({
  rows,
}: {
  rows: { email: string; subscribedAt: string }[];
}) {
  const handleExport = () => {
    const header = "email,subscribedAt\n";
    const body = rows.map((r) => `${r.email},${r.subscribedAt}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={rows.length === 0}
      className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
    >
      <Download className="w-4 h-4" /> CSV এক্সপোর্ট
    </button>
  );
}
