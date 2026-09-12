"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendCampaignEmailBatch } from "@/lib/mail";

const BATCH_SIZE = 100; // Resend's batch endpoint limit per call

export async function sendNewsletterCampaign(subject: string, bodyHtml: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");

  if (!subject.trim() || !bodyHtml.trim()) {
    throw new Error("বিষয় ও বার্তা দুটোই দিন");
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true },
  });

  const emails = subscribers.map((s) => s.email);
  let totalSent = 0;
  let totalFailed = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    const { sent, failed } = await sendCampaignEmailBatch(chunk, subject, bodyHtml);
    totalSent += sent;
    totalFailed += failed;
  }

  return { totalRecipients: emails.length, sent: totalSent, failed: totalFailed };
}
