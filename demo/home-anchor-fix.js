(() => {
  const placeHomeOnLanding = () => {
    const landing = document.querySelector('.chainling-landing');
    const main = document.querySelector('main');
    if (!landing || !main) return false;

    if (main.id === 'home') main.removeAttribute('id');
    landing.id = 'home';

    const shouldOpenLanding = !location.hash || location.hash === '#home';
    if (shouldOpenLanding) {
      if (history.scrollRestoration) history.scrollRestoration = 'manual';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => landing.scrollIntoView({block:'start', behavior:'auto'}));
      });
      setTimeout(() => landing.scrollIntoView({block:'start', behavior:'auto'}), 120);
    }
    return true;
  };

  const boot = () => {
    if (placeHomeOnLanding()) return;
    const observer = new MutationObserver(() => {
      if (placeHomeOnLanding()) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
    setTimeout(() => observer.disconnect(), 10000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
