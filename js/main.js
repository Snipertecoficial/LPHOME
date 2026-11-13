(function () {
  'use strict';

  var doc = document.documentElement;
  var mq = function (q) { return window.matchMedia(q).matches; };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(hover: hover) and (pointer: fine)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lenis = null;

  function scrollToTarget(target) {
    if (!target) return;
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (target.focus) target.focus({ preventScroll: true });
  }

  /* ---------- Datas do projeto ---------- */
  (function dates() {
    var P = window.LPPrazo;
    if (!P) return;
    var today = new Date();
    var start = P.nextStart(today), launch = P.launchDate(today), deadline = P.acceptDeadline(today);
    $$('[data-start-date]').forEach(function (el) { el.textContent = P.fmt(start); });
    $$('[data-launch-date]').forEach(function (el) { el.textContent = P.fmt(launch); });
    var lead = $('[data-deadline-lead]'), hero = $('[data-launch-text]');
    if (deadline) {
      lead.innerHTML = 'Aceite até <b>' + P.fmt(deadline) + '</b> e a loja entra no ar até <b>' + P.fmt(launch) + '</b>, antes do Natal.';
      hero.textContent = 'Loja no ar até ' + P.fmt(launch) + ', antes do Natal';
    } else {
      lead.innerHTML = 'Com o aceite hoje, o projeto começa em <b>' + P.fmt(start) + '</b> e a loja entra no ar em <b>' + P.fmt(launch) + '</b>.';
      hero.textContent = 'Loja no ar em ' + P.fmt(launch);
    }
  })();

  /* ---------- Prévias da loja: escala da página dentro da moldura ---------- */
  var mocks = $$('[data-mock-width]');
  function fitMocks() {
    mocks.forEach(function (box) {
      var w = Number(box.getAttribute('data-mock-width'));
      if (box.clientWidth) box.style.setProperty('--z', (box.clientWidth / w).toFixed(4));
    });
    placePins();
  }
  function placePins() {
    $$('.mock__page').forEach(placePinsIn);
  }
  function placePinsIn(page) {
    if (!page.offsetParent || !$('[data-pin]', page)) return;
    var pr = page.getBoundingClientRect();
    var ratio = pr.width / page.offsetWidth || 1;
    $$('[data-pin]', page).forEach(function (pin) {
      var t = $(pin.getAttribute('data-pin'), page);
      if (!t) return;
      var r = t.getBoundingClientRect();
      var dx = parseFloat(pin.getAttribute('data-dx')) || 0.5, dy = parseFloat(pin.getAttribute('data-dy')) || 0.5;
      pin.style.setProperty('--px', ((r.left - pr.left + r.width * dx) / ratio).toFixed(1) + 'px');
      pin.style.setProperty('--py', ((r.top - pr.top + r.height * dy) / ratio).toFixed(1) + 'px');
    });
  }
  fitMocks();
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(fitMocks); mocks.forEach(function (m) { ro.observe(m); }); }
  else window.addEventListener('resize', fitMocks);

  /* ---------- Vídeo do hero ---------- */
  (function video() {
    var v = $('.hero__video'), btn = $('[data-video-toggle]');
    if (!v) return;
    var c = navigator.connection;
    var skip = reduce || (c && (c.saveData || /2g/.test(c.effectiveType || '')));
    if (skip) return;
    v.src = mq('(max-width: 767px)') ? v.getAttribute('data-src-sm') : v.getAttribute('data-src-lg');
    v.muted = true;
    v.preload = 'auto';
    var inView = true, userPaused = false;
    var play = function () {
      if (userPaused) return;
      var p = v.play();
      if (p && p.catch) p.catch(function (err) {
        if (err && err.name === 'NotAllowedError' && !v.classList.contains('is-playing')) { v.removeAttribute('src'); v.load(); }
      });
    };
    v.addEventListener('playing', function () {
      v.classList.add('is-playing');
      btn.hidden = false;
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, { once: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; inView ? play() : v.pause(); }).observe(v);
    } else play();
    document.addEventListener('visibilitychange', function () { (document.hidden || !inView) ? v.pause() : play(); });
    btn.addEventListener('click', function () {
      userPaused = !userPaused;
      if (userPaused) v.pause(); else play();
      btn.classList.toggle('is-paused', userPaused);
      btn.setAttribute('aria-label', userPaused ? 'Reproduzir vídeo' : 'Pausar vídeo');
    });
  })();

  /* ---------- Navegação: capítulos, progresso, dock e sheet ---------- */
  var nav = $('[data-nav]'), dock = $('[data-dock]'), hero = $('.hero');
  var chapterLinks = $$('[data-chapter-list] a');
  var chapterNames = {};
  chapterLinks.forEach(function (a) { chapterNames[a.getAttribute('data-chapter')] = a.lastChild.textContent.trim(); });
  var sections = $$('main [data-chapter]');
  var marker = $('[data-nav-marker]');
  var progressEls = $$('[data-progress]');
  var sheet = $('[data-sheet]'), sheetList = $('[data-sheet-list]');
  var currentChapter = null, lastY = window.scrollY, acceptVisible = false;

  chapterLinks.forEach(function (a) {
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.setAttribute('data-chapter', a.getAttribute('data-chapter'));
    var num = document.createElement('span');
    num.textContent = a.getAttribute('data-chapter');
    link.appendChild(num);
    link.appendChild(document.createTextNode(chapterNames[a.getAttribute('data-chapter')]));
    li.appendChild(link);
    sheetList.appendChild(li);
  });

  function setChapter(ch) {
    if (ch === currentChapter) return;
    currentChapter = ch;
    $$('[data-chapter-list] a, [data-sheet-list] a').forEach(function (a) {
      if (a.getAttribute('data-chapter') === ch) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    var active = ch && $('[data-chapter-list] a[data-chapter="' + ch + '"]');
    if (active && marker) {
      var parent = marker.parentElement.getBoundingClientRect(), r = active.getBoundingClientRect();
      marker.style.transform = 'translateX(' + (r.left - parent.left + r.width / 2 - 13).toFixed(1) + 'px)';
      marker.classList.add('is-on');
    } else if (marker) marker.classList.remove('is-on');
    if (ch) {
      $('[data-dock-num]').textContent = ch;
      $('[data-dock-label]').textContent = chapterNames[ch];
    }
  }

  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    progressEls.forEach(function (el) { el.style.setProperty('--p', p.toFixed(4)); });
    var heroEnd = hero.offsetHeight - 80;
    nav.classList.toggle('is-over-hero', y < heroEnd);
    var ch = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= vh * 0.45) ch = sections[i].getAttribute('data-chapter');
    }
    setChapter(ch);
    var mobile = !mq('(min-width: 1024px)');
    if (mobile) {
      var down = y > lastY + 4, up = y < lastY - 4;
      if (down && y > heroEnd) nav.classList.add('is-hidden');
      else if (up || y < heroEnd) nav.classList.remove('is-hidden');
    } else nav.classList.remove('is-hidden');
    dock.classList.toggle('is-away', y < hero.offsetHeight * 0.55 || acceptVisible || document.body.classList.contains('has-modal'));
    lastY = y;
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); }
  }, { passive: true });
  window.addEventListener('resize', function () { currentChapter = '__'; onScroll(); });
  onScroll();

  var accept = $('[data-accept]');
  if (accept && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { acceptVisible = e[0].isIntersecting; onScroll(); }).observe(accept);
  }

  /* modal helpers */
  function trapFocus(root, e) {
    if (e.key !== 'Tab') return;
    var f = $$('a[href], button:not([disabled]), input, select', root).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function lockScroll(on) {
    document.body.classList.toggle('has-modal', on);
    if (lenis) on ? lenis.stop() : lenis.start();
    onScroll();
  }

  var sheetTrigger = null;
  function openSheet(btn) { sheetTrigger = btn; btn.setAttribute('aria-expanded', 'true'); sheet.hidden = false; lockScroll(true); var a = $('a[aria-current]', sheet) || $('a', sheet); a.focus(); }
  function closeSheet(restore) { sheet.hidden = true; lockScroll(false); if (sheetTrigger) sheetTrigger.setAttribute('aria-expanded', 'false'); if (restore !== false && sheetTrigger) sheetTrigger.focus(); }
  $('[data-open-sheet]').addEventListener('click', function () { openSheet(this); });
  $$('[data-close-sheet]').forEach(function (el) { el.addEventListener('click', closeSheet); });
  sheet.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    closeSheet(false);
    scrollToTarget($(a.getAttribute('href')));
  });

  /* ---------- B2B: roteador ---------- */
  (function router() {
    var root = $('[data-router]');
    if (!root) return;
    var nodes = $$('[data-route]', root), teams = $$('[data-team]', root), lines = $$('[data-line]', root), out = $('[data-router-out]', root);
    var profiles = ['arquiteto ou designer', 'construtora', 'revenda ou loja', 'hotel ou condomínio'];
    var teamNames = ['time de arquitetura e interiores', 'time de construtoras e incorporadoras', 'time de revendas e lojas', 'time de hotelaria e condomínios'];
    var articles = ['um', 'uma', 'uma', 'um'];
    var auto = null, current = 0;
    function select(i) {
      current = i;
      nodes.forEach(function (n, k) { n.classList.toggle('is-active', k === i); n.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      teams.forEach(function (t, k) { t.classList.toggle('is-active', k === i); });
      lines.forEach(function (l, k) { l.classList.toggle('is-active', k === i); });
      out.innerHTML = 'O pedido de ' + articles[i] + ' <b>' + profiles[i] + '</b> vai para o <b>' + teamNames[i] + '</b>, com perfil, produtos, quantidade e cidade.';
    }
    function userTook() { root.dataset.touched = '1'; out.setAttribute('aria-live', 'polite'); if (auto) { clearInterval(auto); auto = null; } }
    nodes.forEach(function (n, k) { n.addEventListener('click', function () { userTook(); select(k); }); });
    root.addEventListener('focusin', userTook);
    select(0);
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting && auto === null && !root.dataset.touched) {
          auto = setInterval(function () { select((current + 1) % 4); }, 2600);
        } else if (!e[0].isIntersecting && auto) { clearInterval(auto); auto = null; }
      }, { threshold: 0.5 }).observe(root);
      root.addEventListener('pointerdown', userTook);
    }
  })();

  /* ---------- B2B: formulário de orçamento (demo) ---------- */
  (function quote() {
    var q = $('[data-quote]'), form = $('[data-quote-form]'), done = $('[data-quote-done]');
    var trigger = null;
    function open(btn) { trigger = btn; done.hidden = true; form.hidden = false; q.hidden = false; lockScroll(true); $('input:checked', form).focus(); }
    function close() { q.hidden = true; lockScroll(false); if (trigger) trigger.focus(); }
    $$('[data-open-quote]').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
    $$('[data-close-quote]', q).forEach(function (el) { el.addEventListener('click', close); });
    form.addEventListener('change', function (e) { if (e.target.name === 'perfil') $('[data-route-text]').textContent = e.target.value; });
    function err(name, show) {
      $('[data-err="' + name + '"]', form).hidden = !show;
      form.elements[name].classList.toggle('lp-input--invalid', show);
      form.elements[name].setAttribute('aria-invalid', show ? 'true' : 'false');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.elements.nome.value.trim(), whats = form.elements.whats.value.trim();
      var okN = nome.length > 1, okW = whats.replace(/\D/g, '').length >= 10;
      err('nome', !okN); err('whats', !okW);
      if (!okN) { form.elements.nome.focus(); return; }
      if (!okW) { form.elements.whats.focus(); return; }
      var perfil = $('input[name="perfil"]:checked', form).value;
      var prods = $$('input[name="produtos"]:checked', form).map(function (i) { return i.value.toLowerCase(); });
      $('[data-done-text]', done).textContent = nome.split(' ')[0] + ', o time de ' + perfil + ' recebeu seu pedido de ' +
        (prods.length ? prods.join(', ') : 'produtos da loja') + ' (' + form.elements.qtd.value.toLowerCase() + ') para ' +
        (form.elements.cidade.value.trim() || 'sua cidade') + '. Um vendedor dessa área entra em contato pelo WhatsApp ' + whats + '.';
      form.hidden = true; done.hidden = false; $('button', done).focus();
    });
    $('[data-quote-again]', done).addEventListener('click', function () { done.hidden = true; form.hidden = false; form.elements.nome.focus(); });
    document.addEventListener('keydown', function (e) {
      if (!q.hidden) { if (e.key === 'Escape') close(); else trapFocus($('.quote__panel'), e); }
      else if (!sheet.hidden) { if (e.key === 'Escape') closeSheet(); else trapFocus($('.sheet__panel'), e); }
    });
  })();

  /* ---------- Agente de IA: demo com cenários ---------- */
  (function agent() {
    var scripts = window.LPAgentScripts, log = $('[data-chat-log]'), tabs = $$('[data-scenario]');
    if (!scripts || !log) return;
    var intro = log.innerHTML, token = 0, active = 'medida';
    var wait = reduce ? 150 : 850;
    function add(node) { log.appendChild(node); log.scrollTop = log.scrollHeight; return node; }
    function bubble(step) {
      var el = document.createElement('div');
      el.className = 'msg msg--' + (step.from === 'user' ? 'user' : step.from === 'sys' ? 'sys' : 'bot');
      el.textContent = step.text;
      if (step.product) {
        var card = document.createElement('div'); card.className = 'msg-product';
        var img = document.createElement('img'); img.src = step.product.img; img.alt = '';
        var info = document.createElement('div');
        var b = document.createElement('b'); b.textContent = step.product.name;
        var pr = document.createElement('span'); pr.textContent = step.product.price;
        var btn = document.createElement('span'); btn.className = 'lp-btn lp-btn--primary'; btn.textContent = 'Adicionar ao carrinho';
        info.appendChild(b); info.appendChild(pr); info.appendChild(btn);
        card.appendChild(img); card.appendChild(info); el.appendChild(card);
      }
      return el;
    }
    function play(key) {
      var my = ++token, steps = scripts[key] || [];
      active = key;
      log.innerHTML = intro;
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-scenario') === key ? 'true' : 'false'); });
      var i = 0;
      (function next() {
        if (my !== token || i >= steps.length) return;
        var step = steps[i++];
        if (step.from === 'user') {
          setTimeout(function () { if (my !== token) return; add(bubble(step)); next(); }, reduce ? 100 : 650);
        } else {
          var typing = document.createElement('div');
          typing.className = 'msg msg--bot';
          typing.innerHTML = '<span class="typing" aria-label="Digitando"><i></i><i></i><i></i></span>';
          if (step.from === 'bot') add(typing);
          setTimeout(function () {
            if (my !== token) return;
            if (typing.parentNode) typing.remove();
            add(bubble(step)); next();
          }, step.from === 'sys' ? wait / 2 : wait + Math.min(900, step.text.length * 6));
        }
      })();
    }
    var io = null;
    function userPick(key) { if (io) { io.disconnect(); io = null; } play(key); }
    tabs.forEach(function (t) { t.addEventListener('click', function () { userPick(t.getAttribute('data-scenario')); }); });
    $('[data-scenarios]').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var idx = tabs.indexOf(document.activeElement); if (idx < 0) return;
      var n = tabs[(idx + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); userPick(n.getAttribute('data-scenario'));
    });
    $('[data-chat-replay]').addEventListener('click', function () { userPick(active); });
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (e) { if (e[0].isIntersecting && io) { io.disconnect(); io = null; play('medida'); } }, { threshold: 0.4 });
      io.observe(log);
    }
  })();

  /* ---------- Marquee: pausa fora da tela ---------- */
  var marquee = $('.marquee');
  if (marquee && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { marquee.classList.toggle('is-paused', !e[0].isIntersecting); }).observe(marquee);
  }

  /* ---------- Entregas: acordeões fechados no celular ---------- */
  var phoneFold = mq('(max-width: 640px)');
  $$('.scope__group').forEach(function (d, i) { if (phoneFold && i > 0) d.removeAttribute('open'); });
  $$('details.fold').forEach(function (d) { if (phoneFold) d.removeAttribute('open'); });
  $$('.scope__group > summary, details.fold > summary').forEach(function (s) {
    if (!phoneFold) s.setAttribute('tabindex', '-1');
    s.addEventListener('click', function (e) { if (!mq('(max-width: 640px)')) e.preventDefault(); });
  });

  /* ---------- Movimento: Lenis + GSAP ---------- */
  function startMotion() {
    var gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) { doc.classList.remove('intro-pending'); return; }
    var plugins = [window.ScrollTrigger];
    if (window.SplitText) plugins.push(window.SplitText);
    if (window.DrawSVGPlugin) plugins.push(window.DrawSVGPlugin);
    gsap.registerPlugin.apply(gsap, plugins);
    var ST = window.ScrollTrigger;
    ST.config({ ignoreMobileResize: true });

    if (!reduce && finePointer && window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.1, anchors: true });
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    var mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)', phone: '(max-width: 640px)' }, function (ctx) {
      var c = ctx.conditions;
      if (!c.motion) { doc.classList.remove('intro-pending'); return; }
      var hasSplit = !!window.SplitText, hasDraw = !!window.DrawSVGPlugin;

      /* hero intro */
      var intro = gsap.timeline({ defaults: { ease: 'expo.out' }, onStart: function () { doc.classList.remove('intro-pending'); } });
      if (hasSplit) {
        window.SplitText.create('.hero__title', { type: 'lines', mask: 'lines', autoSplit: true, onSplit: function (s) {
          gsap.set(s.masks, { paddingBottom: '0.12em', marginBottom: '-0.12em' });
          var t = gsap.from(s.lines, { yPercent: 110, duration: 1.3, stagger: 0.09, ease: 'expo.out' });
          intro.add(t, 0.15);
          return t;
        } });
      } else intro.from('.hero__title', { y: 40, autoAlpha: 0, duration: 1.1 }, 0.15);
      intro.from('.hero__kicker', { y: 16, autoAlpha: 0, duration: 0.9 }, 0)
        .from(['.hero__lead', '.hero__actions'], { y: 24, autoAlpha: 0, duration: 1, stagger: 0.12 }, 0.55);
      if (hasDraw) intro.from('.hero__roof path', { drawSVG: 0, duration: 2, ease: 'power2.inOut', stagger: 0.25 }, 0.2);

      if (c.desktop) {
        gsap.to('.hero__content', { yPercent: -22, autoAlpha: 0.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to(['.hero__video', '.hero__poster img'], { scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      }

      /* section headlines */
      if (hasSplit) {
        $$('main [data-split]').forEach(function (el) {
          if (el.classList.contains('hero__title')) return;
          window.SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: function (s) {
            gsap.set(s.masks, { paddingBottom: '0.12em', marginBottom: '-0.12em' });
            return gsap.from(s.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
          } });
        });
      }
      $$('.chapter-no').forEach(function (el) {
        gsap.from(el, { yPercent: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });

      /* a loja: a página rola dentro da moldura */
      var page = $('[data-store-scroll]'), viewport = page && page.parentElement;
      if (c.desktop && page) {
        gsap.to(page, {
          y: function () {
            var ratio = page.getBoundingClientRect().height / page.offsetHeight;
            return -Math.max(0, (page.getBoundingClientRect().height - viewport.clientHeight) / ratio);
          },
          ease: 'none', invalidateOnRefresh: true,
          scrollTrigger: { trigger: '.showcase', start: 'top 65%', end: 'bottom 35%', scrub: 1 }
        });
        gsap.from('.phone', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.showcase', start: 'top bottom', end: 'bottom 40%', scrub: true } });
      }
      gsap.from('.pin-legend li', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.pin-legend', start: 'top 88%', once: true } });

      /* b2b: rotas desenhadas */
      if (c.desktop) {
        gsap.from(['.router__lines', '.router__hub', '.router__team'], { autoAlpha: 0, x: 16, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.router', start: 'top 75%', once: true } });
      }

      /* por dentro: a casa se constrói de baixo para cima */
      var floors = $$('[data-floor]').reverse();
      var build = gsap.timeline({ scrollTrigger: c.desktop
        ? { trigger: '.house', start: 'top 85%', end: 'center 45%', scrub: 1 }
        : { trigger: '.house', start: 'top 80%', once: true } });
      build.from(floors, { y: 70, autoAlpha: 0, duration: 1, stagger: 0.6, ease: 'power3.out' });
      if (hasDraw) build.from('.house__roof path', { drawSVG: 0, duration: 1.2, stagger: 0.3, ease: 'power2.inOut' }, '>-0.2');
      else build.from('.house__roof', { autoAlpha: 0, duration: 0.8 });

      /* entregas: números */
      var fmt = new Intl.NumberFormat('pt-BR');
      $$('[data-count]').forEach(function (el) {
        var o = { v: 0 }, end = Number(el.getAttribute('data-count'));
        el.textContent = '0';
        gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = fmt.format(Math.round(o.v)); },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });

      /* bônus: nota imprimindo */
      gsap.from('.receipt', { y: 80, rotate: c.phone ? 0 : 3, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.receipt', start: 'top 85%', once: true } });
      gsap.from('.receipt li, .receipt__total', { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', delay: 0.3, scrollTrigger: { trigger: '.receipt', start: 'top 80%', once: true } });

      /* agente: linha da jornada */
      gsap.fromTo('.journey__line', { '--j': 0 }, { '--j': 1, ease: 'none', scrollTrigger: { trigger: '.journey__line', start: 'top 85%', end: 'bottom 60%', scrub: true } });
      gsap.from('.journey__line > li', { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.journey__line', start: 'top 82%', once: true } });
      gsap.from('.flow__steps li', { x: -20, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.flow__steps', start: 'top 85%', once: true } });

      /* prazo: régua se preenche */
      if (c.desktop) {
        gsap.from('[data-seg]', { scaleX: 0, ease: 'none', stagger: 0.5, scrollTrigger: { trigger: '.ruler', start: 'top 85%', end: 'bottom 55%', scrub: 1 } });
      }
      gsap.from('.deadline', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.deadline', start: 'top 88%', once: true } });

      /* investimento: empena se abre */
      var g = c.phone ? 48 : 96;
      gsap.fromTo('[data-gable]',
        { clipPath: 'polygon(0% ' + g + 'px, 50% 0px, 100% ' + g + 'px, 100% 100%, 0% 100%)' },
        { clipPath: 'polygon(0% 0px, 50% 0px, 100% 0px, 100% 100%, 0% 100%)', ease: 'none',
          scrollTrigger: { trigger: '.invest', start: 'top bottom', end: 'top 15%', scrub: true } });
      gsap.from('.offer__price', { y: 60, autoAlpha: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.offer__price', start: 'top 88%', once: true } });
      gsap.from('.addon', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.addon', start: 'top 90%', once: true } });

      /* CTA magnético */
      if (finePointer) {
        $$('.btn--magnetic').forEach(function (b) {
          var x = gsap.quickTo(b, 'x', { duration: 0.4 }), y = gsap.quickTo(b, 'y', { duration: 0.4 });
          b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.2); y((e.clientY - r.top - r.height / 2) * 0.25); });
          b.addEventListener('pointerleave', function () { x(0); y(0); });
        });
      }
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitMocks(); ST.refresh(); });
    window.addEventListener('load', function () { fitMocks(); ST.refresh(); });
  }

  /* anchor clicks without Lenis keep native smooth scroll; with Lenis it handles anchors itself */
  startMotion();
})();
