"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { sendNewsletterCampaign } from "./actions";

export default function CampaignForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ totalRecipients: number; sent: number; failed: number } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!confirm("এই ইমেইলটি সব সক্রিয় সাবস্ক্রাইবারকে পাঠানো হবে। নিশ্চিত?")) return;

    setLoading(true);
    try {
      const bodyHtml = `<div style="font-family: sans-serif; max-width: 480px; margin: auto; white-space: pre-line;">${body}</div>`;
      const res = await sendNewsletterCampaign(subject, bodyHtml);
      setResult(res);
      setSubject("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "পাঠানো যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">বিষয় (Subject)</label>
        <input
          className="w-full border rounded-lg p-3"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="যেমন: ঈদ স্পেশাল অফার — ৩০% পর্যন্ত ছাড়!"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">বার্তা</label>
        <textarea
          rows={8}
          className="w-full border rounded-lg p-3"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="আপনার প্রোমোশনাল বার্তা এখানে লিখুন..."
        />
        <p className="text-xs text-gray-400 mt-1">
          সাধারণ টেক্সট — লাইন ব্রেক ঠিক থাকবে। HTML ট্যাগ ব্যবহার করলে সেভাবেই রেন্ডার হবে।
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {result && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          {result.totalRecipients} জনের মধ্যে {result.sent} জনকে পাঠানো হয়েছে
          {result.failed > 0 && `, ${result.failed} জনকে পাঠানো যায়নি`}।
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? "পাঠানো হচ্ছে..." : "সবাইকে পাঠান"}
      </button>
    </form>
  );
}
