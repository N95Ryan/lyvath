export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("form");
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");
  const submitButton = form?.querySelector<HTMLButtonElement>("button[type='submit']");

  const API_URL = import.meta.env.VITE_API_URL || "https://code-by-nayru-back-production.up.railway.app/api/contact";
  const currentLocale = document.documentElement.lang || "fr";
  const formLoadedAt = Date.now();

  const defaultSendLabel =
    submitButton?.dataset.sendLabel || submitButton?.textContent || "Envoyer le message";
  const sendingLabel = submitButton?.dataset.sendingLabel || "Envoi en cours...";

  if (form && successMessage && errorMessage && submitButton) {
    form.addEventListener("submit", async (e: Event) => {
      e.preventDefault();

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
            Origin: window.location.origin,
          },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          form.reset();
          successMessage.textContent = result.message;
          successMessage.classList.remove("hidden");
          errorMessage.classList.add("hidden");
        } else {
          errorMessage.textContent = result.message || "Une erreur est survenue. Veuillez réessayer.";
          errorMessage.classList.remove("hidden");
          successMessage.classList.add("hidden");
        }

        setTimeout(() => {
          successMessage.classList.add("hidden");
          errorMessage.classList.add("hidden");
        }, 5000);
      } catch {
        errorMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
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
}
