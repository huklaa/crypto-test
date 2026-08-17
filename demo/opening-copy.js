(() => {
  const apply = () => {
    const landing = document.querySelector('.chainling-landing');
    if (!landing || landing.dataset.openingCopyV2 === 'true') return false;
    landing.dataset.openingCopyV2 = 'true';

    const style = document.createElement('style');
    style.textContent = `
      .chainling-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:24px 0 26px}
      .chainling-step{padding:18px;border:1px solid #21443a;border-radius:14px;background:linear-gradient(180deg,rgba(120,255,34,.045),rgba(4,12,10,.82));min-height:205px}
      .chainling-step .step-no{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid rgba(120,255,34,.45);border-radius:50%;color:var(--green);font-weight:900;font-size:.82rem;margin-bottom:13px}
      .chainling-step h3{margin:0 0 9px;font-size:1.08rem;color:#f4faf7}
      .chainling-step p{margin:0;color:#9fb0aa;line-height:1.58;font-size:.92rem}
      .chainling-step:nth-child(2){border-color:rgba(120,255,34,.42);box-shadow:0 0 30px rgba(120,255,34,.055)}
      .chainling-step:nth-child(2) h3{color:var(--green)}
      .chainling-landing{grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr)}
      .landing-copy{max-width:900px}
      @media(max-width:1050px){.chainling-steps{grid-template-columns:1fr}.chainling-step{min-height:0}.chainling-landing{grid-template-columns:1fr}.landing-visual{min-height:320px}}
      @media(max-width:760px){.chainling-steps{margin:20px 0 22px}.chainling-step{padding:16px}.chainling-step p{font-size:.9rem}}
    `;
    document.head.appendChild(style);

    const lead = landing.querySelector('.landing-lead');
    if (lead) lead.textContent = 'Seven Chainlings. One Flock. Your Nest and future Feathers begin here.';

    if (!landing.querySelector('.chainling-steps')) {
      const steps = document.createElement('div');
      steps.className = 'chainling-steps';
      steps.innerHTML = `
        <article class="chainling-step">
          <span class="step-no">01</span>
          <h3>Collect a Chainling</h3>
          <p>Mint one of seven different Chainlings. Each design represents a different fledgling character and a distinct identity within the Flock.</p>
        </article>
        <article class="chainling-step">
          <span class="step-no">02</span>
          <h3>Join the Flock</h3>
          <p>Connect your wallet to create your own Nest profile. Your Chainlings, mint history, badges, number of unique Chainlings collected and future mission level can live here.</p>
        </article>
        <article class="chainling-step">
          <span class="step-no">03</span>
          <h3>Earn your Feathers</h3>
          <p>Future Chainling missions, events and explorations may earn Feathers. Feathers can support NFT upgrades, special visuals, badges, new features and community activities.</p>
        </article>`;
      lead?.after(steps);
    }
    return true;
  };

  const boot = () => {
    if (apply()) return;
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(() => observer.disconnect(),12000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
