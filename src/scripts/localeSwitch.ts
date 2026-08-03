export function initLocaleSwitch(): void {
  let lastScrollY = window.scrollY;
  const localeSwitch = document.getElementById("locale-switch");
  let isVisible = true;

  if (!localeSwitch) return;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (window.innerWidth < 768) {
      if (currentScrollY > lastScrollY && isVisible) {
        localeSwitch.style.transform = "translateY(-100%)";
        isVisible = false;
      } else if (currentScrollY < lastScrollY && !isVisible) {
        localeSwitch.style.transform = "translateY(0)";
        isVisible = true;
      }
    }

    lastScrollY = currentScrollY;
  });
}
