"use client";

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { RefreshCw } from "lucide-react";
import { getCaptchaChallenge } from "@/app/captcha-action";

export interface CaptchaFieldHandle {
  refresh: () => void;
}

interface Props {
  answer: string;
  onAnswerChange: (value: string) => void;
  token: string;
  onTokenChange: (value: string) => void;
}

const CaptchaField = forwardRef<CaptchaFieldHandle, Props>(function CaptchaField(
  { answer, onAnswerChange, token, onTokenChange },
  ref
) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchChallenge = async () => {
    setLoading(true);
    const challenge = await getCaptchaChallenge();
    setQuestion(challenge.question);
    onTokenChange(challenge.token);
    onAnswerChange("");
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({ refresh: fetchChallenge }));

  return (
    <div>
      <label className="block text-sm font-medium mb-1">যাচাই করুন — {loading ? "..." : question}</label>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          className="flex-1 border rounded-lg p-3"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="উত্তর লিখুন"
        />
        <button
          type="button"
          onClick={fetchChallenge}
          className="border rounded-lg px-3 text-gray-500 hover:text-gray-700"
          aria-label="নতুন প্রশ্ন"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <input type="hidden" value={token} readOnly />
    </div>
  );
});

export default CaptchaField;
