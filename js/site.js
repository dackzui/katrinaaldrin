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

  // Expose tiny API for pages.
  window.__KA_SITE__ = {
    requireAuth,
    setAuthed,
    clearAuthed,
    getNextUrl,
  };
})();

