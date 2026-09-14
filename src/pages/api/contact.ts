import type { APIRoute } from "astro";
import { Resend } from "resend";
import {
  isHoneypotTriggered,
  validateContactContent,
  validateEmail,
  validateSubmissionTiming,
} from "@/utils/contactSpam";
import { formatContactEmailHtml, formatContactEmailText } from "@/utils/contactEmail";

export const prerender = false;

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  locale?: string;
  company?: string;
  formLoadedAt?: number;
}

function jsonResponse(success: boolean, message: string, status: number): Response {
  return new Response(JSON.stringify({ success, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(false, "Erreur lors de la lecture des données", 400);
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const locale = String(payload.locale ?? "en");
  const company = String(payload.company ?? "");
  const formLoadedAt = Number(payload.formLoadedAt ?? 0);

  if (isHoneypotTriggered(company)) {
    return jsonResponse(true, "Message envoyé avec succès", 200);
  }

  const timingError = validateSubmissionTiming(formLoadedAt);
  if (timingError) {
    return jsonResponse(false, timingError, 400);
  }

  if (!name) {
    return jsonResponse(false, "Le nom est obligatoire", 400);
  }
  if (!subject) {
    return jsonResponse(false, "L'objet est obligatoire", 400);
  }
  if (!message) {
    return jsonResponse(false, "Le message est obligatoire", 400);
  }

  const contentError = validateContactContent({ name, email, subject, message });
  if (contentError) {
    return jsonResponse(false, contentError, 400);
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return jsonResponse(false, emailError, 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    return jsonResponse(false, "Erreur lors de l'envoi du message", 500);
  }

  const resend = new Resend(apiKey);
  const form = { name, email, subject, message, locale };

  try {
    const { error } = await resend.emails.send({
      from: "Code by Nayru <contact@codebynayru.com>",
      to: "rpina.pro@gmail.com",
      replyTo: email,
      subject,
      html: formatContactEmailHtml(form),
      text: formatContactEmailText(form),
    });

    if (error) {
      console.error("[contact] Resend error:", error.name);
      return jsonResponse(false, "Erreur lors de l'envoi du message", 500);
    }
  } catch (err) {
    console.error("[contact] Unexpected send failure:", err instanceof Error ? err.name : "unknown");
    return jsonResponse(false, "Erreur lors de l'envoi du message", 500);
  }

  return jsonResponse(true, "Message envoyé avec succès", 200);
};
