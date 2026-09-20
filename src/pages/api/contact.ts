import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import { Resend } from "resend";
import { getTranslator, resolveContactLang } from "@/i18n";
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

function logServerError(context: string, error: unknown): void {
  if (error === undefined) {
    console.error(`[contact] ${context}`);
    return;
  }

  if (error instanceof Error) {
    console.error(`[contact] ${context}`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return;
  }

  if (error && typeof error === "object") {
    console.error(`[contact] ${context}`, error);
    return;
  }

  console.error(`[contact] ${context}`, String(error));
}

function resolveResendApiKey(): string | undefined {
  return (
    getSecret("RESEND_API_KEY") ??
    process.env.RESEND_API_KEY ??
    import.meta.env.RESEND_API_KEY
  );
}

export const POST: APIRoute = async ({ request }) => {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    const t = getTranslator("en");
    return jsonResponse(false, t("contact.errors.parse"), 400);
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const locale = String(payload.locale ?? "en");
  const company = String(payload.company ?? "");
  const formLoadedAt = Number(payload.formLoadedAt ?? 0);
  const t = getTranslator(resolveContactLang(locale));

  if (isHoneypotTriggered(company)) {
    return jsonResponse(true, t("contact.success"), 200);
  }

  const timingError = validateSubmissionTiming(formLoadedAt, locale);
  if (timingError) {
    return jsonResponse(false, timingError, 400);
  }

  if (!name) {
    return jsonResponse(false, t("contact.errors.nameRequired"), 400);
  }
  if (!subject) {
    return jsonResponse(false, t("contact.errors.subjectRequired"), 400);
  }
  if (!message) {
    return jsonResponse(false, t("contact.errors.messageRequired"), 400);
  }

  const contentError = validateContactContent({ name, email, subject, message }, locale);
  if (contentError) {
    return jsonResponse(false, contentError, 400);
  }

  const emailError = validateEmail(email, locale);
  if (emailError) {
    return jsonResponse(false, emailError, 400);
  }

  const apiKey = resolveResendApiKey();
  if (!apiKey) {
    logServerError("RESEND_API_KEY is not configured (check Vercel env for Production)", undefined);
    return jsonResponse(false, t("contact.error"), 500);
  }

  const resend = new Resend(apiKey);
  const form = { name, email, subject, message, locale };

  try {
    const { data, error } = await resend.emails.send({
      from: "LYVATH <contact@lyvath.dev>",
      to: "rpina.pro@gmail.com",
      replyTo: email,
      subject,
      html: formatContactEmailHtml(form),
      text: formatContactEmailText(form),
    });

    if (error) {
      logServerError("Resend API rejected the email", error);
      return jsonResponse(false, t("contact.error"), 500);
    }

    console.info("[contact] Email sent via Resend", { id: data?.id, to: "rpina.pro@gmail.com" });
  } catch (err) {
    logServerError("Unexpected failure while calling Resend", err);
    return jsonResponse(false, t("contact.error"), 500);
  }

  return jsonResponse(true, t("contact.success"), 200);
};
