export function initContactForm(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>("form");
  const successMessage = root.querySelector<HTMLElement>("#success-message");
  const errorMessage = root.querySelector<HTMLElement>("#error-message");
  const submitButton = form?.querySelector<HTMLButtonElement>("button[type='submit']");

  const API_URL = "/api/contact/";
  const currentLocale = document.documentElement.lang || "en";
  const formLoadedAt = Date.now();
  const fallbackSuccessMessage = root.dataset.successMessage ?? "";
  const fallbackErrorMessage = root.dataset.errorMessage ?? "An error occurred. Please try again.";

  const defaultSendLabel =
    submitButton?.dataset.sendLabel || submitButton?.textContent || "Envoyer le message";
  const sendingLabel = submitButton?.dataset.sendingLabel || "Envoi en cours...";

  if (!form || !successMessage || !errorMessage || !submitButton) return;

  form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = sendingLabel;

    try {
      const formData = new FormData(form);
      const data = {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        subject: String(formData.get("subject") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
        company: String(formData.get("company") ?? ""),
        formLoadedAt,
        locale: currentLocale,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as { message?: string };

      if (response.ok) {
        form.reset();
        successMessage.textContent = result.message ?? fallbackSuccessMessage;
        successMessage.classList.remove("hidden");
        errorMessage.classList.add("hidden");
      } else {
        errorMessage.textContent = result.message || fallbackErrorMessage;
        errorMessage.classList.remove("hidden");
        successMessage.classList.add("hidden");
      }

      setTimeout(() => {
        successMessage.classList.add("hidden");
        errorMessage.classList.add("hidden");
      }, 5000);
    } catch {
      errorMessage.textContent = fallbackErrorMessage;
      errorMessage.classList.remove("hidden");
      successMessage.classList.add("hidden");
      setTimeout(() => {
        errorMessage.classList.add("hidden");
      }, 5000);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultSendLabel;
    }
  });
}
