(function () {
  const toggle = document.querySelector(".nav__toggle");
  const list = document.querySelector(".nav__list");

  if (!toggle || !list) return;

  toggle.addEventListener("click", () => {
    const isOpen = list.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // A2: Escape closes the open menu and hands focus back to the toggle button (WCAG 2.1.1 / ARIA menu-button pattern)
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && list.classList.contains("is-open")) {
      list.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });

  list.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      list.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();
