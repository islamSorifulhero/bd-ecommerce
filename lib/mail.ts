// lib/mail.ts
// Minimal email sender using Resend (https://resend.com). Swap this out for
// any other provider (Nodemailer + SMTP, SES, etc.) — only this file needs
// to change.

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendEmail(to: string, subject: string, html: string, logFallback: string) {
  if (!process.env.RESEND_API_KEY) {
    // No email provider configured — log so devs can still test locally.
    console.warn(`[mail] RESEND_API_KEY not set. ${logFallback}`);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "BD Shop <no-reply@yourdomain.com>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Failed to send email:", await res.text());
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: {
    orderNumber: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    orderUrl: string;
  }
) {
  const itemsHtml = data.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.name} x${i.quantity}</td><td style="padding:6px 0;text-align:right;">৳${(
          i.price * i.quantity
        ).toLocaleString()}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>অর্ডার নিশ্চিত হয়েছে ✅</h2>
      <p>আপনার অর্ডার <strong>#${data.orderNumber}</strong> সফলভাবে গ্রহণ করা হয়েছে।</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsHtml}
        <tr><td style="padding-top:10px;font-weight:bold;">সর্বমোট</td><td style="padding-top:10px;font-weight:bold;text-align:right;">৳${data.totalAmount.toLocaleString()}</td></tr>
      </table>
      <p><a href="${data.orderUrl}" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">অর্ডার দেখুন</a></p>
    </div>
  `;

  await sendEmail(
    to,
    `অর্ডার কনফার্মেশন — #${data.orderNumber}`,
    html,
    `Order confirmation for ${to}, order ${data.orderNumber}.`
  );
}

const STATUS_LABELS_BN: Record<string, string> = {
  CONFIRMED: "কনফার্মড",
  PROCESSING: "প্রসেসিং",
  SHIPPED: "শিপড — আপনার পণ্য কুরিয়ারে দেওয়া হয়েছে",
  DELIVERED: "ডেলিভারড",
  CANCELLED: "বাতিল করা হয়েছে",
  RETURNED: "রিটার্ন করা হয়েছে",
};

export async function sendOrderStatusEmail(
  to: string,
  data: { orderNumber: string; status: string; orderUrl: string }
) {
  const label = STATUS_LABELS_BN[data.status];
  if (!label) return; // don't email for PENDING or unrecognized statuses

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>অর্ডার স্ট্যাটাস আপডেট</h2>
      <p>আপনার অর্ডার <strong>#${data.orderNumber}</strong> এখন: <strong>${label}</strong></p>
      <p><a href="${data.orderUrl}" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">অর্ডার দেখুন</a></p>
    </div>
  `;

  await sendEmail(
    to,
    `অর্ডার #${data.orderNumber} — ${label}`,
    html,
    `Status update for order ${data.orderNumber}: ${data.status}`
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>পাসওয়ার্ড রিসেট অনুরোধ</h2>
      <p>আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য নিচের বাটনে ক্লিক করুন। এই লিংকটি ৩০ মিনিটের জন্য কার্যকর থাকবে।</p>
      <p><a href="${resetUrl}" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">পাসওয়ার্ড রিসেট করুন</a></p>
      <p>আপনি যদি এই অনুরোধ না করে থাকেন, এই ইমেইলটি উপেক্ষা করুন।</p>
    </div>
  `;

  await sendEmail(
    to,
    "আপনার পাসওয়ার্ড রিসেট করুন",
    html,
    `Password reset link for ${to}: ${resetUrl}`
  );
}
