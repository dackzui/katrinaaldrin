(() => {
  const AUTH_KEY = "ka_wedding_authed_v1";

  function getNextUrl() {
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next");
    if (!next) return null;
    try {
      const decoded = decodeURIComponent(next);
      // Only allow same-origin relative paths (basic safety).
      if (decoded.startsWith("/") || decoded.startsWith("http")) return null;
      if (decoded.includes("://")) return null;
      return decoded;
    } catch {
      return null;
    }
  }

  function requireAuth() {
    try {
      if (sessionStorage.getItem(AUTH_KEY) === "1") return;
    } catch {
      // If storage is blocked, fall through to gate.
    }
    const current = `${window.location.pathname.split("/").pop() || "index.html"}${window.location.search || ""}${window.location.hash || ""}`;
    const next = encodeURIComponent(current);
    window.location.replace(`gate.html?next=${next}`);
  }

  function setAuthed() {
    try {
      sessionStorage.setItem(AUTH_KEY, "1");
    } catch {
      // ignore
    }
  }

  function clearAuthed() {
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  }

  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('.navbar-nav .nav-link[href^="#"]'));
    if (!links.length) return;

    const sections = links
      .map((link) => {
        const id = link.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        return el ? { id, el, link } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    function setActive(id) {
      links.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }

    // Prefer the section nearest the top of the viewport (below sticky nav).
    function updateFromScroll() {
      const marker = window.scrollY + Math.min(160, window.innerHeight * 0.28);
      let current = sections[0].id;

      for (const section of sections) {
        const top = section.el.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = section.id;
      }

      // Near page bottom: highlight the last section.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        current = sections[sections.length - 1].id;
      }

      setActive(current);
    }

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          updateFromScroll();
          ticking = false;
        });
      },
      { passive: true }
    );

    // Initial hash or first section.
    const hash = (window.location.hash || "").replace("#", "");
    if (hash && sections.some((s) => s.id === hash)) setActive(hash);
    else updateFromScroll();

    // Close mobile menu after tapping a section link.
    const collapse = document.getElementById("nav");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        const id = link.getAttribute("href").slice(1);
        setActive(id);
        if (collapse && window.bootstrap) {
          const instance = window.bootstrap.Collapse.getInstance(collapse);
          if (instance) instance.hide();
        }
      });
    });
  }

  // Expose tiny API for pages.
  window.__KA_SITE__ = {
    requireAuth,
    setAuthed,
    clearAuthed,
    getNextUrl,
    initScrollSpy,
  };

  document.addEventListener("DOMContentLoaded", () => {
    initScrollSpy();
  });
})();

