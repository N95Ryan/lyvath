export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("form");
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");
  const submitButton = form?.querySelector<HTMLButtonElement>("button[type='submit']");

  // URL de l'API depuis les variables d'environnement
  const API_URL = import.meta.env.VITE_API_URL || "https://code-by-nayru-back-production.up.railway.app/api/contact";

  // Récupération de la locale actuelle
  const currentLocale = document.documentElement.lang || "fr";

  if (form && successMessage && errorMessage && submitButton) {
    let lastSubmitTime = 0;
    const MIN_SUBMIT_INTERVAL = 30000; // 30 secondes

    form.addEventListener("submit", async (e: Event) => {
      e.preventDefault();

      // Vérification du délai minimum entre les soumissions
      const now = Date.now();
      if (now - lastSubmitTime < MIN_SUBMIT_INTERVAL) {
        errorMessage.textContent = "Veuillez attendre avant d'envoyer un nouveau message.";
        errorMessage.classList.remove("hidden");
        successMessage.classList.add("hidden");
        setTimeout(() => {
          errorMessage.classList.add("hidden");
        }, 5000);
        return;
      }

      // Désactivation du bouton pendant l'envoi
      submitButton.disabled = true;
      submitButton.textContent = "Envoi en cours...";

      try {
        const formData = new FormData(form);
        const data = {
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          locale: currentLocale
        };

        console.log("Envoi de la requête à:", API_URL);
        console.log("Données envoyées:", data);
        console.log("Origine:", window.location.origin);
        console.log("Locale:", currentLocale);

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Origin": window.location.origin,
          },
          body: JSON.stringify(data),
          credentials: "include",
        });

        console.log("Réponse reçue:", response.status);
        console.log("Headers de la réponse:", Object.fromEntries(response.headers.entries()));

        const result = await response.json();
        console.log("Données de la réponse:", result);

        if (response.ok) {
          form.reset();
          successMessage.textContent = result.message;
          successMessage.classList.remove("hidden");
          errorMessage.classList.add("hidden");
          lastSubmitTime = now;
        } else {
          errorMessage.textContent = result.message || "Une erreur est survenue. Veuillez réessayer.";
          errorMessage.classList.remove("hidden");
          successMessage.classList.add("hidden");
        }

        setTimeout(() => {
          successMessage.classList.add("hidden");
          errorMessage.classList.add("hidden");
        }, 5000);
      } catch (error) {
        console.error("Erreur détaillée:", error);
        errorMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
        errorMessage.classList.remove("hidden");
        successMessage.classList.add("hidden");
        setTimeout(() => {
          errorMessage.classList.add("hidden");
        }, 5000);
      } finally {
        // Réactivation du bouton
        submitButton.disabled = false;
        submitButton.textContent = "Envoyer le message";
      }
    });
  }
} 