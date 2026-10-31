(() => {
  const navigationCooldown = 600;
  let queuedNavigation = 0;
  let navigationReadyAt = window.performance.now() + navigationCooldown;

  const siteHeader = document.querySelector(".site-header");
  const navigationToggle = siteHeader?.querySelector(".nav-toggle");
  const navigationMenu = siteHeader?.querySelector(".nav-bar");

  const setNavigationOpen = (isOpen) => {
    if (!siteHeader || !navigationToggle) {
      return;
    }

    siteHeader.classList.toggle("nav-open", isOpen);
    navigationToggle.setAttribute("aria-expanded", String(isOpen));
    navigationToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  };

  navigationToggle?.addEventListener("click", () => {
    setNavigationOpen(!siteHeader.classList.contains("nav-open"));
  });

  navigationMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setNavigationOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavigationOpen(false);
      navigationToggle?.focus();
    }
  });

  const desktopNavigationMedia = window.matchMedia("(min-width: 981px)");
  const closeNavigationAtDesktopWidth = (event) => {
    if (event.matches) {
      setNavigationOpen(false);
    }
  };

  if (desktopNavigationMedia.addEventListener) {
    desktopNavigationMedia.addEventListener("change", closeNavigationAtDesktopWidth);
  } else {
    desktopNavigationMedia.addListener(closeNavigationAtDesktopWidth);
  }

  const lockNavigation = () => {
    navigationReadyAt = window.performance.now() + navigationCooldown;
  };

  window.addEventListener("pageshow", lockNavigation);

  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = event.target.closest?.(".site-header a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) {
      return;
    }

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) {
      return;
    }

    const current = new URL(window.location.href);
    if (
      destination.pathname === current.pathname &&
      destination.search === current.search &&
      destination.hash === current.hash
    ) {
      event.preventDefault();
      return;
    }

    const now = window.performance.now();

    if (now < navigationReadyAt) {
      event.preventDefault();
      window.clearTimeout(queuedNavigation);
      queuedNavigation = window.setTimeout(() => {
        lockNavigation();
        window.location.assign(destination.href);
      }, navigationReadyAt - now + 20);
      return;
    }

    window.clearTimeout(queuedNavigation);
    lockNavigation();
  }, true);
})();
