// components/whatsapp-button.tsx
// Renders nothing if NEXT_PUBLIC_WHATSAPP_NUMBER isn't configured.
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  const digits = number.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${digits}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমার একটা প্রশ্ন আছে।")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 bg-[#25D366] text-white rounded-full p-4 shadow-lg hover:scale-105 transition"
      aria-label="WhatsApp এ যোগাযোগ করুন"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
