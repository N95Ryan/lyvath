export interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const emailStyles = `
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

export function formatContactEmailText(form: ContactEmailData): string {
  if (form.locale === "en") {
    return `Name: ${form.name}\nEmail: ${form.email}\nMessage:\n${form.message}`;
  }
  return `Nom: ${form.name}\nEmail: ${form.email}\nMessage:\n${form.message}`;
}

export function formatContactEmailHtml(form: ContactEmailData): string {
  const safeSubject = escapeHtml(form.subject);
  const safeName = escapeHtml(form.name);
  const safeEmail = escapeHtml(form.email);
  const safeMessage = escapeHtml(form.message).replace(/\n/g, "<br>");

  if (form.locale === "en") {
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
        <div class="label">From:</div>
        <div class="value">${safeName} (${safeEmail})</div>
      </div>
      <div class="info-block">
        <div class="label">Message:</div>
        <div class="value message">${safeMessage}</div>
      </div>
      <div class="footer">
        This message was sent from the LYVATH contact form.
      </div>
    </div>
  </body>
</html>`;
  }

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
        Ce message a été envoyé depuis le formulaire de contact de LYVATH.
      </div>
    </div>
  </body>
</html>`;
}
