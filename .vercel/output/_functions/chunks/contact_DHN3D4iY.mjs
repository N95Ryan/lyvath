import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { Resend } from "resend";
//#region src/utils/contactSpam.ts
var FIELD_LIMITS = {
	nameMin: 2,
	nameMax: 100,
	emailMax: 254,
	subjectMin: 3,
	subjectMax: 200,
	messageMin: 10,
	messageMax: 2e3
};
var VOWEL_RATIO_THRESHOLD = .18;
var GIBBERISH_MIN_LENGTH = 20;
var WORD_REGEX = /\b[a-zA-ZÀ-ÿ0-9'-]+\b/g;
function countWords(text) {
	const matches = text.match(WORD_REGEX);
	return matches ? matches.length : 0;
}
function vowelRatio(text) {
	const letters = text.match(/[a-zA-ZÀ-ÿ]/g);
	if (!letters || letters.length === 0) return 0;
	return letters.filter((c) => /[aeiouyAEIOUYàâäéèêëïîôùûüœæÀÂÄÉÈÊËÏÎÔÙÛÜŒÆ]/i.test(c)).length / letters.length;
}
function isGibberish(text) {
	if (text.length < GIBBERISH_MIN_LENGTH) return false;
	return vowelRatio(text) < VOWEL_RATIO_THRESHOLD;
}
function validateContactContent(fields) {
	const { name, subject, message } = fields;
	if (name.length < FIELD_LIMITS.nameMin) return "Le nom doit contenir au moins 2 caractères";
	if (name.length > FIELD_LIMITS.nameMax) return "Le nom ne doit pas dépasser 100 caractères";
	if (subject.length < FIELD_LIMITS.subjectMin) return "L'objet doit contenir au moins 3 caractères";
	if (subject.length > FIELD_LIMITS.subjectMax) return "L'objet ne doit pas dépasser 200 caractères";
	if (message.length < FIELD_LIMITS.messageMin) return "Le message doit contenir au moins 10 caractères";
	if (message.length > FIELD_LIMITS.messageMax) return "Le message ne doit pas dépasser 2000 caractères";
	if (countWords(message) < 2) return "Le message doit contenir au moins 2 mots";
	if (isGibberish(subject)) return "L'objet semble invalide";
	if (isGibberish(message)) return "Le message semble invalide";
	return null;
}
function isHoneypotTriggered(company) {
	return company.trim().length > 0;
}
function validateSubmissionTiming(formLoadedAt) {
	if (!formLoadedAt || formLoadedAt <= 0) return "Soumission trop rapide";
	if (Date.now() - formLoadedAt < 3e3) return "Soumission trop rapide";
	return null;
}
var EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
function validateEmail(email) {
	const trimmed = email.trim();
	if (!trimmed) return "L'email est obligatoire";
	if (trimmed.length > FIELD_LIMITS.emailMax) return "L'email ne doit pas dépasser 254 caractères";
	if (!EMAIL_REGEX.test(trimmed)) return "Format d'email invalide";
	return null;
}
//#endregion
//#region src/utils/contactEmail.ts
function escapeHtml(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var emailStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  h2 {
    font-size: 24px;
    color: #222222;
    margin-bottom: 24px;
  }
  .info-block {
    margin-bottom: 24px;
  }
  .label {
    font-size: 14px;
    color: #999999;
    margin-bottom: 4px;
  }
  .value {
    font-size: 16px;
    color: #555555;
    line-height: 1.5;
  }
  .message {
    background-color: #f8f9fa;
    padding: 16px;
    border-radius: 4px;
    margin-top: 8px;
  }
  .footer {
    margin-top: 30px;
    font-size: 14px;
    color: #999999;
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
  }
`;
function formatContactEmailText(form) {
	if (form.locale === "en") return `Name: ${form.name}\nEmail: ${form.email}\nMessage:\n${form.message}`;
	return `Nom: ${form.name}\nEmail: ${form.email}\nMessage:\n${form.message}`;
}
function formatContactEmailHtml(form) {
	const safeSubject = escapeHtml(form.subject);
	const safeName = escapeHtml(form.name);
	const safeEmail = escapeHtml(form.email);
	const safeMessage = escapeHtml(form.message).replace(/\n/g, "<br>");
	if (form.locale === "en") return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeSubject}</title>
    <style>${emailStyles}</style>
  </head>
  <body>
    <div class="container">
      <h2>${safeSubject}</h2>
      <div class="info-block">
        <div class="label">From:</div>
        <div class="value">${safeName} (${safeEmail})</div>
      </div>
      <div class="info-block">
        <div class="label">Message:</div>
        <div class="value message">${safeMessage}</div>
      </div>
      <div class="footer">
        This message was sent from the Code by Nayru contact form.
      </div>
    </div>
  </body>
</html>`;
	return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeSubject}</title>
    <style>${emailStyles}</style>
  </head>
  <body>
    <div class="container">
      <h2>${safeSubject}</h2>
      <div class="info-block">
        <div class="label">De :</div>
        <div class="value">${safeName} (${safeEmail})</div>
      </div>
      <div class="info-block">
        <div class="label">Message :</div>
        <div class="value message">${safeMessage}</div>
      </div>
      <div class="footer">
        Ce message a été envoyé depuis le formulaire de contact de Code by Nayru.
      </div>
    </div>
  </body>
</html>`;
}
//#endregion
//#region src/pages/api/contact.ts
var contact_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
function jsonResponse(success, message, status) {
	return new Response(JSON.stringify({
		success,
		message
	}), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}
var POST = async ({ request }) => {
	let payload;
	try {
		payload = await request.json();
	} catch {
		return jsonResponse(false, "Erreur lors de la lecture des données", 400);
	}
	const name = String(payload.name ?? "").trim();
	const email = String(payload.email ?? "").trim();
	const subject = String(payload.subject ?? "").trim();
	const message = String(payload.message ?? "").trim();
	const locale = String(payload.locale ?? "fr");
	const company = String(payload.company ?? "");
	const formLoadedAt = Number(payload.formLoadedAt ?? 0);
	if (isHoneypotTriggered(company)) return jsonResponse(true, "Message envoyé avec succès", 200);
	const timingError = validateSubmissionTiming(formLoadedAt);
	if (timingError) return jsonResponse(false, timingError, 400);
	if (!name) return jsonResponse(false, "Le nom est obligatoire", 400);
	if (!subject) return jsonResponse(false, "L'objet est obligatoire", 400);
	if (!message) return jsonResponse(false, "Le message est obligatoire", 400);
	const contentError = validateContactContent({
		name,
		email,
		subject,
		message
	});
	if (contentError) return jsonResponse(false, contentError, 400);
	const emailError = validateEmail(email);
	if (emailError) return jsonResponse(false, emailError, 400);
	const resend = new Resend("re_4QGw7v2L_5E6e1vT2GLVWWvS1muK61gPU");
	const form = {
		name,
		email,
		subject,
		message,
		locale
	};
	try {
		const { error } = await resend.emails.send({
			from: "Code by Nayru <contact@codebynayru.com>",
			to: "rpina.pro@gmail.com",
			replyTo: email,
			subject,
			html: formatContactEmailHtml(form),
			text: formatContactEmailText(form)
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
//#endregion
//#region \0virtual:astro:page:src/pages/api/contact@_@ts
var page = () => contact_exports;
//#endregion
export { page };
