(() => {
  const apply = () => {
    const landing = document.querySelector('.chainling-landing');
    if (!landing || landing.dataset.featherReferenceApplied === 'true') return false;
    landing.dataset.featherReferenceApplied = 'true';

    const style = document.createElement('style');
    style.textContent = `
      .landing-copy h1 .feather-title-line{display:flex;align-items:flex-end;gap:.16em;flex-wrap:wrap;color:inherit}
      .landing-copy h1 .feather-title-line img{width:.72em;height:.82em;object-fit:cover;object-position:50% 42%;border-radius:.12em;box-shadow:0 0 .24em rgba(183,255,0,.4);transform:translateY(-.02em)}
      .landing-orbit.reference-feather{width:min(520px,42vw);aspect-ratio:auto;border:1px solid rgba(120,255,34,.22);border-radius:26px;overflow:hidden;background:#030807;box-shadow:0 0 70px rgba(120,255,34,.12),inset 0 0 50px rgba(120,255,34,.04)}
      .landing-orbit.reference-feather::before,.landing-orbit.reference-feather::after{display:none!important}
      .landing-orbit.reference-feather img{display:block;width:100%;height:auto;object-fit:cover}
      .landing-orbit.reference-feather .landing-mantra{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);padding:7px 12px;border-radius:999px;background:rgba(0,0,0,.48);backdrop-filter:blur(4px);color:#dce7df;white-space:nowrap}
      @media(max-width:760px){.landing-orbit.reference-feather{width:min(560px,100%);border-radius:20px}.landing-copy h1 .feather-title-line img{width:.8em;height:.9em}}
    `;
    document.head.appendChild(style);

    const title = landing.querySelector('.landing-copy h1');
    if (title) title.innerHTML = 'Collect a Chainling.<span>Join the Flock.</span><span class="feather-title-line">Earn your Feathers.<img src="/assets/flock-feather-small.jpg" alt="" aria-hidden="true"></span>';

    const orbit = landing.querySelector('.landing-orbit');
    if (orbit) {
      orbit.classList.add('reference-feather');
      orbit.innerHTML = '<img src="/assets/flock-feather.jpg" alt="Chainling neon feather"><div class="landing-mantra">Built for the journey</div>';
    }
    return true;
  };

  const tryApply = () => {
    if (apply()) return;
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList:true,subtree:true});
    setTimeout(() => observer.disconnect(), 10000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryApply, {once:true});
  else tryApply();
})();
