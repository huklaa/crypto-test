(() => {
  const init = () => {
    const main = document.querySelector('main#home');
    const hero = document.querySelector('.hero');
    const collection = document.querySelector('#collection');
    if (!main || !hero || !collection || document.querySelector('.chainling-landing')) return;

    hero.id = 'mint';

    const style = document.createElement('style');
    style.textContent = `
      .collection::before,.collection::after{display:none!important;content:none!important}
      .chainling-landing{margin-top:18px;padding:clamp(30px,6vw,72px);min-height:min(650px,78vh);display:grid;grid-template-columns:1.08fr .92fr;align-items:center;gap:34px;overflow:hidden;position:relative}
      .chainling-landing::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 76% 38%,rgba(120,255,34,.13),transparent 30rem)}
      .landing-copy{position:relative;z-index:2;max-width:760px}
      .landing-copy .eyebrow{color:var(--green);font-weight:900;letter-spacing:.16em;font-size:.82rem;margin:0 0 16px}
      .landing-copy h1{font-size:clamp(3rem,6.8vw,6.8rem);line-height:.94;letter-spacing:-.045em;margin:0 0 24px}
      .landing-copy h1 span{display:block;color:var(--green)}
      .landing-copy .landing-lead{font-size:clamp(1.05rem,1.7vw,1.35rem);line-height:1.65;color:#afbeb9;max-width:650px;margin:0 0 30px}
      .landing-actions{display:flex;gap:12px;flex-wrap:wrap}
      .landing-primary,.landing-secondary{border-radius:12px;padding:15px 22px;font-weight:900;cursor:pointer}
      .landing-primary{border:0;background:linear-gradient(90deg,#64dc16,#90ff34);color:#071006}
      .landing-secondary{border:1px solid #386a57;background:#07100f;color:#e9f2ef}
      .landing-secondary:hover{border-color:var(--green);color:var(--green)}
      .landing-visual{position:relative;z-index:1;display:grid;place-items:center;min-height:390px}
      .landing-orbit{width:min(390px,78vw);aspect-ratio:1;border:1px solid #4ab615;border-radius:50%;display:grid;place-items:center;box-shadow:0 0 70px rgba(120,255,34,.13),inset 0 0 70px rgba(120,255,34,.06);position:relative}
      .landing-orbit::before,.landing-orbit::after{content:"";position:absolute;border:1px solid rgba(120,255,34,.24);border-radius:50%;transform:rotate(-18deg)}
      .landing-orbit::before{width:124%;height:38%}.landing-orbit::after{width:92%;height:23%;transform:rotate(22deg)}
      .landing-feather{font-size:clamp(7rem,18vw,13rem);line-height:1;filter:drop-shadow(0 0 28px #65ff29);transform:rotate(-12deg)}
      .landing-mantra{position:absolute;bottom:20px;color:#7d9189;font-size:.82rem;letter-spacing:.14em;text-transform:uppercase}

      .chainling-nest{margin-top:16px;padding:28px;display:grid;grid-template-columns:.9fr 1.6fr;gap:24px;align-items:center}
      .nest-copy h2{font-size:clamp(1.8rem,3vw,2.8rem);margin:4px 0 10px}.nest-copy p{color:#9eb0aa;line-height:1.6;margin:0 0 18px}
      .nest-connect{border:1px solid #4aa90c;border-radius:10px;background:#0c1b13;color:#dff5d5;padding:13px 18px;font-weight:900;cursor:pointer}.nest-connect:hover{color:#071006;background:var(--green)}
      .nest-panel{display:grid;grid-template-columns:repeat(5,1fr);border:1px solid #21443a;border-radius:15px;overflow:hidden;background:#030807}
      .nest-stat{padding:20px 14px;min-height:104px;border-right:1px solid #17302b}.nest-stat:last-child{border-right:0}.nest-stat span{display:block;color:#82968f;font-size:.75rem;margin-bottom:10px}.nest-stat strong{font-size:1.15rem;color:#f2f8f5}.nest-address{grid-column:1/-1;padding:13px 16px;border-top:1px solid #17302b;color:#8fa29b;font-size:.82rem}

      .chainling-library{margin-top:16px;padding:20px 22px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .library-toggle{border:1px solid #204238;background:#06100e;border-radius:12px;padding:16px 18px;color:#e9f2ef;font-weight:850;text-align:left;cursor:pointer}.library-toggle span{display:block;color:#7f948d;font-size:.75rem;font-weight:600;margin-top:5px}.library-toggle:hover,.library-toggle.active{border-color:#5bd219;color:var(--green)}
      .chainling-collapsible{display:none!important}.chainling-collapsible.is-open{display:grid!important}.chainling-collapsible.panel.is-open{display:block!important}

      @media(max-width:760px){
        .chainling-landing{grid-template-columns:1fr;min-height:auto;padding:34px 24px}.landing-visual{min-height:290px}.landing-copy h1{font-size:clamp(3rem,13vw,4.8rem)}
        .landing-actions{display:grid}.landing-primary,.landing-secondary{width:100%}.landing-orbit{width:min(310px,78vw)}
        .chainling-nest{grid-template-columns:1fr;padding:22px}.nest-panel{grid-template-columns:1fr 1fr}.nest-stat{border-bottom:1px solid #17302b}.nest-stat:nth-child(even){border-right:0}.nest-stat:nth-child(5){grid-column:1/-1;border-right:0}.nest-address{grid-column:1/-1}
        .chainling-library{grid-template-columns:1fr;padding:14px}
      }
    `;
    document.head.appendChild(style);

    const landing = document.createElement('section');
    landing.className = 'chainling-landing panel';
    landing.innerHTML = `
      <div class="landing-copy">
        <p class="eyebrow">CHAINLING ECOSYSTEM</p>
        <h1>Collect a Chainling.<span>Join the Flock.</span>Earn your Feathers. 🪶</h1>
        <p class="landing-lead">Seven unique fledglings. One growing ecosystem. Collect an Early Explorer, become part of the Flock and build your on-chain journey from the beginning.</p>
        <div class="landing-actions">
          <button class="landing-primary" type="button" data-go-mint>Mint a Chainling</button>
          <button class="landing-secondary" type="button" data-go-nest>Discover Your Nest</button>
        </div>
      </div>
      <div class="landing-visual" aria-hidden="true">
        <div class="landing-orbit"><div class="landing-feather">🪶</div><div class="landing-mantra">Built for the journey</div></div>
      </div>`;
    hero.before(landing);

    const nest = document.createElement('section');
    nest.id = 'nest';
    nest.className = 'chainling-nest panel';
    nest.innerHTML = `
      <div class="nest-copy">
        <p class="kicker">YOUR NEST</p>
        <h2>Discover your place in the Flock.</h2>
        <p>Connect your wallet to reveal your Nest. Chainling balances, flock progress and future ecosystem utilities will live here.</p>
        <button class="nest-connect" type="button" data-nest-connect>Connect Wallet to Discover Your Nest</button>
      </div>
      <div class="nest-panel">
        <div class="nest-stat"><span>Chainlings</span><strong>—</strong></div>
        <div class="nest-stat"><span>Unique Flocks</span><strong>— / 7</strong></div>
        <div class="nest-stat"><span>Feathers</span><strong>Coming Soon</strong></div>
        <div class="nest-stat"><span>Badges</span><strong>Coming Soon</strong></div>
        <div class="nest-stat"><span>Full Flock</span><strong>— / 7</strong></div>
        <div class="nest-address" data-nest-address>Wallet not connected</div>
      </div>`;
    collection.after(nest);

    const aboutSections = [...document.querySelectorAll('.about-grid')];
    const blog = document.querySelector('#blog');
    const roadmap = document.querySelector('#roadmap');
    const firstLong = aboutSections[0] || blog || roadmap;
    if (firstLong) {
      const library = document.createElement('section');
      library.className = 'chainling-library panel';
      library.innerHTML = `
        <button class="library-toggle" type="button" data-section="about">About Chainling<span>Project, ownership and collection principles</span></button>
        <button class="library-toggle" type="button" data-section="blog">Blog<span>Robinhood Chain, Base and Arbitrum Orbit</span></button>
        <button class="library-toggle" type="button" data-section="roadmap">Roadmap<span>Genesis, community, utility and expansion</span></button>`;
      firstLong.before(library);
    }

    aboutSections.forEach(node => node.classList.add('chainling-collapsible'));
    blog?.classList.add('chainling-collapsible');
    roadmap?.classList.add('chainling-collapsible');

    const groups = {about: aboutSections, blog: blog ? [blog] : [], roadmap: roadmap ? [roadmap] : []};
    const setOpen = (key, shouldScroll = true) => {
      const nodes = groups[key] || [];
      const currentlyOpen = nodes.some(node => node.classList.contains('is-open'));
      Object.entries(groups).forEach(([name, items]) => {
        const open = name === key ? !currentlyOpen : false;
        items.forEach(node => node.classList.toggle('is-open', open));
        document.querySelector(`.library-toggle[data-section="${name}"]`)?.classList.toggle('active', open);
      });
      if (!currentlyOpen && shouldScroll) nodes[0]?.scrollIntoView({behavior:'smooth', block:'start'});
    };

    document.querySelectorAll('.library-toggle').forEach(button => button.addEventListener('click', () => setOpen(button.dataset.section)));

    document.querySelectorAll('.nav-links a[href="#about"],.nav-links a[href="#blog"],.nav-links a[href="#roadmap"]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        const key = link.getAttribute('href').slice(1);
        const nodes = groups[key] || [];
        nodes.forEach(node => node.classList.add('is-open'));
        document.querySelector(`.library-toggle[data-section="${key}"]`)?.classList.add('active');
        nodes[0]?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    landing.querySelector('[data-go-mint]')?.addEventListener('click', () => hero.scrollIntoView({behavior:'smooth',block:'start'}));
    landing.querySelector('[data-go-nest]')?.addEventListener('click', () => nest.scrollIntoView({behavior:'smooth',block:'start'}));
    nest.querySelector('[data-nest-connect]')?.addEventListener('click', () => document.querySelector('.wallet-btn[data-connect]')?.click());

    const walletStatus = document.querySelector('#wallet-status');
    const nestAddress = nest.querySelector('[data-nest-address]');
    const nestButton = nest.querySelector('[data-nest-connect]');
    const syncNest = () => {
      const value = walletStatus?.textContent?.trim() || 'Not connected';
      const connected = value && !/not connected/i.test(value);
      if (nestAddress) nestAddress.textContent = connected ? `${value}'s Nest` : 'Wallet not connected';
      if (nestButton) nestButton.textContent = connected ? 'Wallet Connected' : 'Connect Wallet to Discover Your Nest';
    };
    syncNest();
    if (walletStatus) new MutationObserver(syncNest).observe(walletStatus,{childList:true,subtree:true,characterData:true});
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
