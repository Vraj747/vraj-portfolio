(function () {
  const toggle = document.querySelector(".nav__toggle");
  const list = document.querySelector(".nav__list");

  if (!toggle || !list) return;

  toggle.addEventListener("click", () => {
    const isOpen = list.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  list.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      list.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();
