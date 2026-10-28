(() => {
  const navigationCooldown = 600;
  let queuedNavigation = 0;
  let navigationReadyAt = window.performance.now() + navigationCooldown;

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
