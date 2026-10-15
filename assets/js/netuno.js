/* =====================================================================
   NETUNO — motor de movimento ("Descida")
   GSAP 3.13: ScrollTrigger, ScrollSmoother, SplitText, DrawSVG,
   ScrollTo, CustomEase. Tudo degrada para conteúdo visível sem JS.
   ===================================================================== */
(() => {
  "use strict";

  const html = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || "";

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* modo privado */ } },
  };
  const local = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem storage */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* sem storage */ } },
  };

  const releaseCover = () => {
    html.classList.remove("is-first", "is-diving");
    const t = document.querySelector(".tide");
    if (t) t.classList.remove("is-active", "is-dive");
  };

  if (!window.gsap) { releaseCover(); return; }

  const plugins = ["ScrollTrigger", "ScrollSmoother", "SplitText", "DrawSVGPlugin", "ScrollToPlugin", "CustomEase"]
    .filter((n) => typeof window[n] !== "undefined")
    .map((n) => window[n]);
  gsap.registerPlugin(...plugins);

  const ST = window.ScrollTrigger || null;
  const HAS_SPLIT = typeof window.SplitText !== "undefined";
  const HAS_DRAW = typeof window.DrawSVGPlugin !== "undefined";
  if (window.CustomEase) CustomEase.create("tide", "0.16,1,0.3,1");
  const EASE = window.CustomEase ? "tide" : "expo.out";
  gsap.defaults({ ease: EASE, duration: 0.8 });
  if (ST) ST.config({ ignoreMobileResize: true });

  // Preferência do sistema, mas o visitante pode trocar no rodapé (salvo no navegador)
  const savedMotion = local.get("netuno:motion");
  const reduce = savedMotion ? savedMotion === "reduced" : matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const TAU = Math.PI * 2;
  const fmt = (n, dec = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const header = $(".site-header");
  const gauge = $(".gauge");
  const tide = $(".tide");
  const ranges = new Map(); // seção → { st, keys } para o medidor de profundidade
  let smoother = null;
  let menuOpen = false;
  let diving = false;

  /* ---------------------------------------------------------------
     Superfície da água: soma de senoides = ondulação orgânica
     --------------------------------------------------------------- */
  function surfaceY(u, t, amp, k) {
    return amp * (
      0.6 * Math.sin(u * TAU * k + t) +
      0.28 * Math.sin(u * TAU * k * 2.27 - t * 1.37 + 1.3) +
      0.32 * Math.sin(u * TAU * 0.45 + t * 0.42 + 0.7)
    );
  }

  class Water {
    constructor(host, layers, o = {}) {
      this.host = host;
      this.layers = layers;
      this.level = o.level ?? 0.5; // 0 = topo do host, 1 = base
      this.lift = 0;               // 0..1: cobre tudo (usado na drenagem de entrada)
      this.amp = o.amp ?? 13;
      this.k = o.k ?? 1.05;
      this.speed = o.speed ?? 0.85;
      this.n = o.points ?? 56;
      this.t = Math.random() * 20;
      this.onDraw = o.onDraw || null;
      this.rest = this.level;
      this.on = false;
      this.wake = { x: 0.5, a: 0 };  // ondulação local deixada pelo cursor
      this.onTick = null;
      this.tick = (time, dt) => {
        const s = Math.min(dt, 50);
        this.t += (s / 1000) * this.speed;
        this.wake.a *= Math.pow(0.93, s / 16.7);
        this.draw();
        if (this.onTick) this.onTick(time, s / 1000);
      };
      this.measure = this.measure.bind(this);
      this.measure();
      window.addEventListener("resize", this.measure);
    }
    get surface() { return this.level + (-0.16 - this.level) * this.lift; }
    measure() {
      this.w = this.host.clientWidth;
      this.h = this.host.clientHeight;
      this.layers.forEach((L) => L.crest && L.crest.ownerSVGElement.setAttribute("viewBox", `0 0 ${this.w} ${this.h}`));
      this.draw();
    }
    start() { if (!this.on && !reduce) { this.on = true; gsap.ticker.add(this.tick); } return this; }
    stop() { if (this.on) { this.on = false; gsap.ticker.remove(this.tick); } return this; }
    wakeAt(u) {
      if (this.wake.a < 0.15) return 0;
      const d = u - this.wake.x;
      return this.wake.a * Math.exp(-(d * d) / 0.0045) * Math.sin(d * 82 - this.t * 9);
    }
    yAt(u) {
      const L = this.layers[this.layers.length - 1];
      return (this.surface + (L.offset || 0)) * this.h
        + surfaceY(u, this.t * (L.speed || 1) + (L.phase || 0), L.amp ?? this.amp, this.k) + this.wakeAt(u);
    }
    draw() {
      const { w, h } = this;
      if (!w || !h) return;
      const n = this.wake.a > 0.15 ? this.n * 2 : this.n; // mais pontos quando há rastro
      const lvl = this.surface;
      for (const L of this.layers) {
        const base = (lvl + (L.offset || 0)) * h;
        const amp = L.amp ?? this.amp;
        const t = this.t * (L.speed || 1) + (L.phase || 0);
        let d = "";
        for (let i = 0; i <= n; i++) {
          const u = i / n;
          d += (i ? " L" : "") + (u * w).toFixed(1) + " " + (base + surfaceY(u, t, amp, this.k) + this.wakeAt(u)).toFixed(1);
        }
        const clip = `path("M0 ${h + 6} L${d} L${w} ${h + 6} Z")`;
        L.el.style.clipPath = clip;
        L.el.style.webkitClipPath = clip;
        if (L.crest) L.crest.setAttribute("d", "M" + d);
      }
      if (this.onDraw) this.onDraw(lvl);
    }
  }

  function setTone(el, tone) {
    if (el && el.dataset.tone !== tone) el.dataset.tone = tone;
  }

  /* ---------------------------------------------------------------
     Hero com linha d'água: título seco (navy) e molhado (branco)
     --------------------------------------------------------------- */
  function initHero() {
    const hero = $(".hero");
    if (!hero) return null;
    const water = $(".hero__water", hero);
    const swell = $(".hero__swell", hero);
    const crest = $(".hero__crest path", hero);
    const titles = $$(".hero__title", hero);
    const dryTitle = $(".hero__dry .hero__title", hero);
    const foot = $(".hero__foot", hero);

    let lines = [];
    let masks = [];
    if (HAS_SPLIT) {
      titles.forEach((t) => {
        const s = SplitText.create(t, { type: "lines", mask: "lines", linesClass: "hero-line" });
        lines = lines.concat(s.lines);
        if (t === dryTitle) masks = s.masks && s.masks.length ? s.masks : s.lines;
      });
    }

    const W = new Water(hero, [
      { el: swell, offset: -0.026, amp: 9, phase: 2.4, speed: 0.72 },
      { el: water, crest },
    ], {
      amp: 13,
      onDraw(lvl) {
        if (menuOpen) return;
        const top = hero.getBoundingClientRect().top;
        const y = top + lvl * this.h; // this = instância da Water (chamado no construtor também)
        const hh = header ? header.offsetHeight : 70;
        setTone(header, y > hh * 0.6 ? "light" : "dark");
        if (gauge) {
          const g = gauge.getBoundingClientRect();
          const p = parseFloat(gauge.style.getPropertyValue("--p")) || 0;
          setTone(gauge, y > g.top + p * g.height + 10 ? "light" : "dark");
        }
      },
    });

    // soma offsetTop até o hero: ignora transforms (o título se move no mergulho)
    const offsetIn = (el) => {
      let y = 0;
      while (el && el !== hero) { y += el.offsetTop; el = el.offsetParent; }
      return y;
    };
    const measureRest = () => {
      const last = masks[masks.length - 1];
      const y = last ? offsetIn(last) + last.offsetHeight * 0.58 : offsetIn(dryTitle) + dryTitle.offsetHeight * 0.75;
      W.rest = gsap.utils.clamp(0.26, 0.84, y / hero.clientHeight);
    };
    measureRest();
    W.level = W.rest;
    W.draw();
    if (ST) ST.addEventListener("refreshInit", () => { measureRest(); W.measure(); });

    const info = { hero, W, titles, lines, foot, refract: null, bubbles: null };
    heroLife(info);

    // Criado depois dos pins (boot chama watch), para o fim considerar o espaço do pin
    info.watch = () => {
      const active = (on) => {
        if (on) { W.start(); if (info.refract) info.refract.play(); }
        else { W.stop(); if (info.refract) info.refract.pause(); }
      };
      if (!ST) { active(true); return; }
      ST.create({
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => active(self.isActive),
        onUpdate: () => W.draw(),
      });
    };

    return info;
  }

  /* Vida na linha d'água: régua de maré com leitura ao vivo, refração do
     que está submerso, rastro do cursor e bolhas */
  function heroLife(info) {
    const { hero, W } = info;
    const water = $(".hero__water", hero);
    const staff = $(".hero__dry .hero__staff", hero);
    const level = $(".hero__level", hero);
    const levelVal = level && $("[data-level]", level);
    const rich = !reduce && finePointer && innerWidth >= 900;

    let box = null;
    let labelW = 0, labelH = 0, lastTxt = "";
    const measure = () => {
      if (!staff || !staff.getClientRects().length) { box = null; return; }
      const hr = hero.getBoundingClientRect();
      const r = staff.getBoundingClientRect();
      box = { x: r.left - hr.left, y: r.top - hr.top, w: r.width, h: r.height };
      if (level) { labelW = level.offsetWidth; labelH = level.offsetHeight; }
    };
    measure();
    window.addEventListener("resize", measure);
    if (ST) ST.addEventListener("refresh", measure);

    const prevDraw = W.onDraw;
    W.onDraw = function (lvl) {
      if (prevDraw) prevDraw.call(this, lvl);
      if (!box || !level) return;
      const y = this.yAt((box.x + box.w / 2) / this.w);
      const reading = Math.min(2, Math.max(0, ((box.y + box.h - y) / box.h) * 2));
      level.style.transform = `translate(${(box.x - labelW - 14).toFixed(1)}px, ${(y - labelH / 2).toFixed(1)}px)`;
      level.style.opacity = y > box.y + 8 && y < box.y + box.h - 8 ? "1" : "0";
      const txt = reading.toFixed(2).replace(".", ",");
      if (txt !== lastTxt) { lastTxt = txt; levelVal.textContent = txt; }
    };
    W.draw();

    if (!rich) return;

    // refração: o que está debaixo d'água ondula, o que está seco fica nítido
    const turb = document.querySelector("#refract feTurbulence");
    if (turb) {
      hero.classList.add("has-refract");
      info.refract = gsap.to(turb, { attr: { baseFrequency: "0.017 0.09" }, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true });
    }

    // bolhas (canvas dentro da água, recortado pela própria superfície)
    const c = document.createElement("canvas");
    c.className = "hero__bubbles";
    c.setAttribute("aria-hidden", "true");
    water.insertBefore(c, $(".hero__layout", water));
    const ctx = c.getContext("2d");
    const list = [];
    let w = 0, h = 0, idle = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const spawn = (x, y, r) => {
      if (list.length > 80) return;
      list.push({ x0: x, x, y, r, vy: 36 + r * 13 + Math.random() * 22, ph: Math.random() * TAU });
    };
    info.bubbles = {
      spawn,
      burst(n) { for (let i = 0; i < n; i++) spawn(Math.random() * w, h * (0.78 + Math.random() * 0.26), 1 + Math.random() * 3); },
    };
    W.onTick = (time, s) => {
      idle += s;
      if (box && idle > 0.9) { idle = 0; spawn(box.x + box.w * (0.25 + Math.random() * 0.5), h + 4, 1.2 + Math.random() * 2); }
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (let i = list.length - 1; i >= 0; i--) {
        const b = list[i];
        b.y -= b.vy * s;
        b.r *= 1 + s * 0.08;
        b.x = b.x0 + Math.sin(time * 2.6 + b.ph) * (3 + b.r);
        if (b.y < W.yAt(b.x / w) + b.r || b.y < -12) { list.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fillStyle = "rgba(244,250,253,0.07)";
        ctx.fill();
        ctx.strokeStyle = "rgba(244,250,253,0.55)";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, Math.max(0.6, b.r * 0.22), 0, TAU);
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fill();
      }
    };

    // rastro do cursor perto da superfície
    let lastX = null;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const u = x / r.width;
      const wy = W.yAt(u);
      const dx = lastX == null ? 0 : Math.abs(x - lastX);
      lastX = x;
      const near = Math.exp(-((y - wy) ** 2) / (2 * 190 * 190));
      W.wake.x += (u - W.wake.x) * 0.35;
      W.wake.a = Math.min(22, W.wake.a + dx * 0.24 * near);
      if (y > wy + 14 && dx > 2 && Math.random() < 0.55) spawn(x + (Math.random() - 0.5) * 14, y + 6, 1 + Math.random() * 2.4);
    });
    hero.addEventListener("pointerleave", () => { lastX = null; });
  }

  /* ---------------------------------------------------------------
     Smooth scroll
     --------------------------------------------------------------- */
  function initSmoother() {
    if (reduce || !window.ScrollSmoother || !$("#smooth-wrapper")) return null;
    return ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.15,
      effects: true,
      smoothTouch: false,
    });
  }

  function scrollToY(target, duration = 1.4) {
    if (smoother) {
      const y = typeof target === "number" ? target : smoother.offset(target, "top top");
      gsap.to(smoother, { scrollTop: y, duration, ease: "power3.inOut" });
    } else if (window.ScrollToPlugin) {
      gsap.to(window, { scrollTo: { y: target, autoKill: true }, duration: reduce ? 0 : duration, ease: "power3.inOut" });
    } else {
      window.scrollTo(0, typeof target === "number" ? target : target.offsetTop);
    }
  }

  function lockScroll(on) {
    if (smoother) smoother.paused(on);
    else html.style.overflow = on ? "hidden" : "";
  }

  /* ---------------------------------------------------------------
     Profundidade: medidor, cor do oceano, luz e neve marinha
     --------------------------------------------------------------- */
  const OCEAN = ["#1a6cab", "#165f9b", "#114f87", "#0d3f71", "#0a305b", "#072447", "#051934", "#030e22"];
  const ZONES = [
    [200, "Epipelágica", "Zona epipelágica · onde a luz chega"],
    [1000, "Mesopelágica", "Zona mesopelágica · a penumbra"],
    [4000, "Batipelágica", "Zona batipelágica · escuridão total"],
    [Infinity, "Abissal", "Zona abissal · o fundo"],
  ];

  function initSnow() {
    const c = $(".snow");
    if (!c || reduce) return { set() {}, push() {} };
    const ctx = c.getContext("2d");
    let w = 0, h = 0, on = false, vel = 0;
    const parts = [];
    const count = innerWidth < 760 ? 36 : 78;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (p, anywhere) => {
      p.x = Math.random() * w;
      p.y = anywhere ? Math.random() * h : -8;
      p.r = Math.random() * 1.5 + 0.35;
      p.vy = Math.random() * 12 + 5;
      p.vx = (Math.random() - 0.5) * 5;
      p.a = Math.random() * 0.45 + 0.2;
      p.ph = Math.random() * TAU;
      return p;
    };
    resize();
    for (let i = 0; i < count; i++) parts.push(spawn({}, true));
    window.addEventListener("resize", resize);
    const tick = (time, dt) => {
      const s = Math.min(dt, 50) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#d6ecf8";
      for (const p of parts) {
        p.y += (p.vy - vel * 0.07) * s;
        p.x += (p.vx + Math.sin(time * 0.5 + p.ph) * 3) * s;
        if (p.y > h + 10) spawn(p);
        else if (p.y < -12) { spawn(p); p.y = h + 8; }
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, TAU);
        ctx.fill();
      }
      vel *= 0.9;
    };
    return {
      set(a) {
        c.style.opacity = a.toFixed(3);
        if (a > 0.01 && !on) { on = true; gsap.ticker.add(tick); }
        else if (a <= 0.01 && on) { on = false; gsap.ticker.remove(tick); ctx.clearRect(0, 0, w, h); }
      },
      push(v) { vel = gsap.utils.clamp(-2600, 2600, v); },
    };
  }

  function initDepth() {
    const stops = $$("[data-depth]");
    if (!stops.length || !ST) return;
    const snow = initSnow();
    const raysFixed = $(".rays--fixed");
    const mix = gsap.utils.interpolate(OCEAN);
    const anchors = stops.map((el) => ST.create({ trigger: el, start: "top 55%" }));
    const readShort = $$('[data-depth-readout]:not([data-depth-readout="value"])');
    const readValue = $$('[data-depth-readout="value"]');
    const zoneShort = $$('[data-zone-readout]:not([data-zone-readout="long"])');
    const zoneLong = $$('[data-zone-readout="long"]');
    const maxLabels = $$("[data-depth-max]");
    let keys = [];
    let maxD = 1;
    let lastInt = -1;
    let lastZone = -1;

    const build = () => {
      keys = [];
      stops.forEach((el, i) => {
        const d0 = +el.dataset.depth;
        keys.push([i === 0 ? 0 : anchors[i].start, d0]);
        const r = ranges.get(el);
        if (r && r.st) {
          const a = r.st.start, b = r.st.end;
          keys.push([a, d0]);
          const custom = r.keys || [[1, +(el.dataset.depthEnd || d0)]];
          custom.forEach(([p, d]) => keys.push([a + (b - a) * p, d]));
        }
      });
      const last = stops[stops.length - 1];
      maxD = Math.max(...stops.map((el) => +(el.dataset.depthEnd || el.dataset.depth)));
      keys.push([Math.max(ST.maxScroll(window), keys[keys.length - 1][0] + 1), +(last.dataset.depthEnd || last.dataset.depth)]);
      keys.sort((a, b) => a[0] - b[0]);
      maxLabels.forEach((el) => (el.textContent = fmt(maxD) + " m"));
    };

    const depthAt = (y) => {
      if (!keys.length) return 0;
      if (y <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) {
        const [y1, d1] = keys[i];
        if (y <= y1) {
          const [y0, d0] = keys[i - 1];
          return d0 + (d1 - d0) * clamp01((y - y0) / ((y1 - y0) || 1));
        }
      }
      return keys[keys.length - 1][1];
    };

    const update = (y) => {
      const d = depthAt(y);
      const t = (1 - Math.exp(-d / 1100)) / (1 - Math.exp(-4000 / 1100));
      html.style.setProperty("--ocean", mix(clamp01(t)));
      snow.set(clamp01((d - 140) / 1300));
      if (raysFixed) raysFixed.style.opacity = (0.9 * (1 - clamp01((d - 20) / 320))).toFixed(3);
      if (gauge) gauge.style.setProperty("--p", clamp01(d / maxD).toFixed(4));
      const di = Math.round(d);
      if (di !== lastInt) {
        lastInt = di;
        const s = fmt(di);
        readShort.forEach((el) => (el.textContent = s + " m"));
        readValue.forEach((el) => (el.textContent = s));
      }
      const z = ZONES.findIndex((zz) => d <= zz[0]);
      if (z !== lastZone) {
        lastZone = z;
        zoneShort.forEach((el) => (el.textContent = ZONES[z][1]));
        zoneLong.forEach((el) => (el.textContent = ZONES[z][2]));
      }
    };

    ST.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        update(self.scroll());
        snow.push(self.getVelocity());
      },
      onRefresh(self) {
        build();
        update(self.scroll());
      },
    });
  }

  /* ---------------------------------------------------------------
     Cabeçalho, menu, links internos com transição de maré
     --------------------------------------------------------------- */
  function initHeader(heroInfo) {
    if (!header || !ST) return;
    if (!heroInfo) setTone(header, "dark");
    ST.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const y = self.scroll();
        const vh = innerHeight;
        const solidAt = heroInfo ? (page === "home" ? vh * 2 : heroInfo.hero.offsetHeight * 0.85) : 40;
        header.classList.toggle("is-solid", y > solidAt);
        if (menuOpen) return;
        if (y > solidAt + 80 && self.direction === 1) header.classList.add("is-hidden");
        else if (self.direction === -1 || y < solidAt) header.classList.remove("is-hidden");
      },
    });
  }

  function initMenu() {
    const btn = $(".menu-toggle");
    const menu = $(".menu");
    if (!btn || !menu) return;
    const items = $$(".menu__links li, .menu__foot > *", menu);
    let saved = "dark";
    const setOpen = (v) => {
      menuOpen = v;
      btn.setAttribute("aria-expanded", String(v));
      btn.setAttribute("aria-label", v ? "Fechar menu" : "Abrir menu");
      $("use", btn).setAttribute("href", v ? "#i-x" : "#i-menu");
      header.classList.remove("is-hidden");
      if (v) {
        saved = header.dataset.tone;
        setTone(header, "dark");
        menu.classList.add("is-open");
        lockScroll(true);
        gsap.fromTo(menu, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: reduce ? 0 : 0.75, ease: "power3.inOut" });
        gsap.fromTo(items, { yPercent: 50, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: reduce ? 0 : 0.8, stagger: 0.05, delay: reduce ? 0 : 0.3 });
        const first = $("a", menu);
        if (first) setTimeout(() => first.focus({ preventScroll: true }), reduce ? 0 : 400);
      } else {
        setTone(header, saved);
        lockScroll(false);
        gsap.to(menu, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: reduce ? 0 : 0.5,
          ease: "power3.in",
          onComplete: () => menu.classList.remove("is-open"),
        });
      }
    };
    btn.addEventListener("click", () => setOpen(!menuOpen));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuOpen) { setOpen(false); btn.focus(); }
    });
    matchMedia("(min-width: 861px)").addEventListener("change", (e) => { if (e.matches && menuOpen) setOpen(false); });
  }

  function dive(go) {
    if (diving) return;
    diving = true;
    if (reduce || !tide) { go(); return; }
    tide.classList.add("is-active", "is-dive");
    const W = new Water(tide, [{ el: $(".tide__water", tide) }], { level: 1.16, amp: 18, k: 0.9, speed: 1.6 }).start();
    gsap.to(W, {
      level: -0.18,
      duration: 0.85,
      ease: "power2.in",
      onComplete() {
        store.set("netuno:dive", String(Date.now()));
        go();
      },
    });
  }

  function initLinks() {
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-no-dive")) return;
      const raw = a.getAttribute("href");
      if (/^(mailto|tel|javascript):/i.test(raw)) return;
      if (raw.startsWith("#")) {
        const target = raw.length > 1 && document.querySelector(raw);
        if (target) {
          e.preventDefault();
          scrollToY(target, 1.2);
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
        return;
      }
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (!/\.(html?|php)$/i.test(url.pathname) && !url.pathname.endsWith("/")) return;
      e.preventDefault();
      if (menuOpen) $(".menu-toggle").click();
      if (url.pathname === location.pathname && !url.search && !url.hash) { scrollToY(0, 1.8); return; }
      dive(() => { location.href = a.href; });
    });
    window.addEventListener("pageshow", (e) => {
      if (!e.persisted) return;
      diving = false;
      releaseCover();
      const water = tide && $(".tide__water", tide);
      if (water) water.style.clipPath = water.style.webkitClipPath = "";
    });
    $$("[data-surface]").forEach((b) => b.addEventListener("click", () => scrollToY(0, 2.4)));
    $$("[data-motion-toggle]").forEach((b) => {
      b.setAttribute("aria-pressed", String(!reduce));
      const label = $("span", b);
      if (label) label.textContent = reduce ? "reduzidas" : "completas";
      b.addEventListener("click", () => {
        local.set("netuno:motion", reduce ? "full" : "reduced");
        location.reload();
      });
    });
  }

  function initMagnetic() {
    if (!finePointer || reduce) return;
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.2);
        yTo((e.clientY - r.top - r.height / 2) * 0.32);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  function initRays() {
    if (reduce) return;
    $$(".rays i").forEach((r, i) => {
      gsap.to(r, {
        rotation: i % 2 ? "+=4" : "-=4",
        xPercent: i % 2 ? 14 : -14,
        opacity: () => 0.45 + Math.random() * 0.5,
        duration: 4.5 + i * 0.85,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }

  /* ---------------------------------------------------------------
     Revelações ao rolar (criadas depois da entrada)
     --------------------------------------------------------------- */
  function initReveals() {
    if (!ST) return;
    if (reduce) {
      // versão gentil: só opacidade, sem deslocamento
      $$("[data-split], [data-rise]").forEach((el) => {
        gsap.from(el, { autoAlpha: 0, duration: 0.6, ease: "power1.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });
      $$("[data-stagger]").forEach((list) => {
        gsap.from(list.children, { autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: "power1.out", scrollTrigger: { trigger: list, start: "top 90%", once: true } });
      });
      return;
    }
    if (HAS_SPLIT) {
      $$("[data-split]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 108,
              duration: 1.1,
              stagger: 0.085,
              scrollTrigger: { trigger: el, start: "top 87%", once: true },
            });
          },
        });
      });
      $$("[data-scrub-words]").forEach((el) => {
        const split = SplitText.create(el, { type: "words", wordsClass: "word" });
        gsap.fromTo(split.words, { opacity: 0.16 }, {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
        });
      });
    }
    $$("[data-rise]").forEach((el) => {
      gsap.from(el, {
        y: 40,
        autoAlpha: 0,
        duration: 1.1,
        delay: +(el.dataset.rise || 0),
        scrollTrigger: { trigger: el, start: "top 89%", once: true },
      });
    });
    $$("[data-stagger]").forEach((list) => {
      gsap.from(list.children, {
        y: 34,
        autoAlpha: 0,
        duration: 0.95,
        stagger: 0.085,
        scrollTrigger: { trigger: list, start: "top 86%", once: true },
      });
    });
    if (HAS_DRAW) {
      $$("[data-draw]").forEach((svg) => {
        gsap.from(svg.querySelectorAll("path, circle, rect, ellipse, line, polyline"), {
          drawSVG: 0,
          duration: 1.5,
          stagger: 0.12,
          ease: "power2.inOut",
          scrollTrigger: { trigger: svg, start: "top 88%", once: true },
        });
      });
    }
  }

  /* ---------------------------------------------------------------
     Utilitários visuais
     --------------------------------------------------------------- */
  function countUp(el, dur = 1.5) {
    const to = parseFloat(el.dataset.count);
    if (Number.isNaN(to)) return null;
    const dec = +(el.dataset.dec || 0);
    const pre = el.dataset.prefix || "";
    const suf = el.dataset.suffix || "";
    const o = { v: 0 };
    return gsap.to(o, {
      v: to,
      duration: reduce ? 0 : dur,
      ease: "power2.out",
      onUpdate: () => (el.textContent = pre + fmt(o.v, dec) + suf),
    });
  }

  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Curvas batimétricas (isóbatas) procedurais, nunca se cruzam */
  function isobaths(svg, o = {}) {
    if (!svg) return null;
    const NS = "http://www.w3.org/2000/svg";
    const W = o.w || 1200, H = o.h || 800;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", o.par || "xMidYMid slice");
    const rings = o.rings || 16, gap = o.gap || 34, base = o.base || 24, n = o.points || 120;
    const rnd = mulberry32(o.seed || 7);
    const harm = [2, 3, 4, 5, 7].map((k) => ({ k, a: (0.16 / k) * (0.6 + rnd() * 0.8), p: rnd() * TAU, w: (rnd() - 0.5) * 0.5 }));
    const ringH = Array.from({ length: rings }, () => ({ p: rnd() * TAU, a: 0.16 + rnd() * 0.12 }));
    const paths = ringH.map((_, i) => {
      const p = document.createElementNS(NS, "path");
      if (i % 4 === 3) p.classList.add("is-major");
      svg.appendChild(p);
      return p;
    });
    const state = { cx: o.cx ?? 0.6, cy: o.cy ?? 0.5, t: 0, sx: o.sx || 1.4, sy: o.sy || 0.86 };
    const radius = (i, th) => {
      let f = 1;
      for (const hh of harm) f += hh.a * Math.sin(hh.k * th + hh.p + state.t * hh.w);
      return (base + i * gap) * f + Math.sin(3 * th + ringH[i].p + state.t * 0.3) * gap * ringH[i].a;
    };
    function draw() {
      const cx = state.cx * W, cy = state.cy * H;
      paths.forEach((path, i) => {
        let d = "";
        for (let j = 0; j <= n; j++) {
          const th = (j / n) * TAU;
          const r = radius(i, th);
          d += (j ? "L" : "M") + (cx + Math.cos(th) * r * state.sx).toFixed(1) + " " + (cy + Math.sin(th) * r * state.sy).toFixed(1);
        }
        path.setAttribute("d", d + "Z");
      });
    }
    draw();
    if (o.soundings) {
      const cx = state.cx * W, cy = state.cy * H;
      for (let s = 0; s < o.soundings; s++) {
        const i = 1 + Math.floor(rnd() * (rings - 2));
        const th = rnd() * TAU;
        const r = radius(i, th) + gap * 0.5;
        const x = cx + Math.cos(th) * r * state.sx, y = cy + Math.sin(th) * r * state.sy;
        if (x < 20 || x > W - 40 || y < 20 || y > H - 20) continue;
        const depth = Math.round((o.deepCenter ? 4200 * Math.pow(1 - i / rings, 1.6) : 30 + i * i * 9) / 5) * 5;
        const tx = document.createElementNS(NS, "text");
        tx.setAttribute("x", x.toFixed(0));
        tx.setAttribute("y", y.toFixed(0));
        tx.textContent = fmt(depth);
        svg.appendChild(tx);
      }
    }
    return { state, draw, paths };
  }

  /* Linha d'água isolada (SVG) animada enquanto visível */
  function lineWave(svg, o = {}) {
    if (!svg) return;
    const path = $("path", svg);
    const st = { t: Math.random() * 10 };
    const draw = () => {
      const w = svg.clientWidth || 1200, h = svg.clientHeight || 60;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      let d = "";
      for (let i = 0; i <= 64; i++) {
        const u = i / 64;
        d += (i ? " L" : "M") + (u * w).toFixed(1) + " " + (h / 2 + surfaceY(u, st.t, o.amp || 9, o.k || 1.2)).toFixed(1);
      }
      path.setAttribute("d", d);
    };
    const tick = (time, dt) => { st.t += (dt / 1000) * 0.9; draw(); };
    draw();
    window.addEventListener("resize", draw);
    if (reduce || !ST) return;
    ST.create({
      trigger: svg,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
    });
  }

  /* ---------------------------------------------------------------
     Páginas
     --------------------------------------------------------------- */
  function heroScroll(heroInfo, pinned) {
    if (!heroInfo || !ST || reduce) return;
    const { hero, W, titles, foot } = heroInfo;
    if (pinned) {
      // a régua de maré faz o papel do medidor enquanto estamos na superfície
      const gaugeOff = (self) => { if (gauge) gauge.classList.toggle("is-off", self.progress < 0.97); };
      gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: () => W.draw(),
        scrollTrigger: {
          trigger: hero, start: "top top", end: "+=110%", pin: true, scrub: true, invalidateOnRefresh: true,
          onRefresh: (self) => { ranges.set(hero, { st: self, keys: [[1, 0]] }); gaugeOff(self); }, // profundidade 0 até o fim do mergulho
          onUpdate: (self) => {
            gaugeOff(self);
            const v = self.getVelocity();
            if (v > 180 && heroInfo.bubbles) heroInfo.bubbles.burst(Math.min(4, v / 650)); // mergulhar solta bolhas
          },
        },
      })
        .fromTo(W, { level: () => W.rest }, { level: -0.18, ease: "power1.in", duration: 1 }, 0)
        .to(titles, { yPercent: -16, duration: 1 }, 0)
        .to(foot, { y: -70, autoAlpha: 0, duration: 0.42 }, 0.36);
    } else {
      gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: () => W.draw(),
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      })
        .fromTo(W, { level: () => W.rest }, { level: -0.12, duration: 1 }, 0)
        .to(titles, { yPercent: 22, duration: 1 }, 0)
        .to(foot, { y: -40, autoAlpha: 0, duration: 0.5 }, 0);
    }
  }

  function mockAnim(scope) {
    const bars = $$(".mock__chart i", scope);
    const nums = $$("[data-count]", scope);
    if (!bars.length && !nums.length) return;
    gsap.set(bars, { scaleY: 0 });
    const run = () => {
      gsap.to(bars, { scaleY: 1, duration: 1.1, stagger: 0.045, ease: "power3.out" });
      nums.forEach((n) => countUp(n, 1.6));
    };
    if (!ST || reduce) { gsap.set(bars, { scaleY: 1 }); return; }
    return run;
  }

  function linkER(er) {
    if (!er) return;
    const svg = $(".er__link", er);
    const from = $('[data-key="id"]', er);
    const to = $("[data-fk]", er);
    if (!svg || !from || !to) return;
    const path = $("path", svg);
    const [c1, c2] = $$("circle", svg);
    const draw = () => {
      const b = er.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const z = to.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
      const x1 = a.right - b.left, y1 = a.top + a.height / 2 - b.top;
      const x2 = z.left - b.left, y2 = z.top + z.height / 2 - b.top;
      const mx = (x1 + x2) / 2;
      path.setAttribute("d", `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`);
      c1.setAttribute("cx", x1); c1.setAttribute("cy", y1);
      c2.setAttribute("cx", x2); c2.setAttribute("cy", y2);
    };
    draw();
    window.addEventListener("resize", draw);
    if (ST) ST.addEventListener("refresh", draw);
  }

  function pageHome(heroInfo) {
    heroScroll(heroInfo, true);

    const sec = $(".layers");
    if (!sec) return;
    const layers = $$(".layer", sec);
    const strata = $$(".strata li", sec);
    const map = $(".layers__map", sec);
    isobaths(map, { w: 1400, h: 900, rings: 17, gap: 36, base: 20, cx: 0.7, cy: 0.55, seed: 4, soundings: 16, deepCenter: true });
    linkER($(".er", sec));

    const runMock = mockAnim($(".mock", sec));
    if (runMock && ST) ST.create({ trigger: sec, start: "top 65%", once: true, onEnter: runMock });

    if (!ST) return;
    const mm = gsap.matchMedia();
    mm.add({ big: "(min-width: 900px)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { big, still } = ctx.conditions;
      if (big && !still) {
        sec.classList.add("is-pinned");
        // anima o artefato em si (não a figure), para a legenda não ser cortada pelo clip arredondado
        const arts = layers.map((L) => $(".layer__artifact > :first-child", L));
        gsap.set(arts, { filter: "blur(0px)" });
        gsap.set(layers.slice(1), { autoAlpha: 0 });
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        const switches = [];
        tl.to({}, { duration: 0.4 });
        layers.forEach((L, i) => {
          if (!i) return;
          const P = layers[i - 1];
          const at = tl.duration();
          switches.push(at + 0.45);
          tl.to($(".layer__text", P), { y: -50, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, at)
            .to(arts[i - 1], { y: -90, autoAlpha: 0, filter: "blur(10px)", duration: 0.55, ease: "power2.in" }, at)
            .to($(".layer__caption", P), { autoAlpha: 0, duration: 0.3 }, at)
            .set(P, { autoAlpha: 0 }, at + 0.56)
            .set(L, { autoAlpha: 1 }, at + 0.4)
            .from($(".layer__caption", L), { autoAlpha: 0, duration: 0.4 }, at + 0.9)
            .from($(".layer__text", L), { y: 64, autoAlpha: 0, duration: 0.6 }, at + 0.42)
            .fromTo(arts[i],
              { clipPath: "inset(100% 0% 0% 0% round 28px)", y: 50 },
              { clipPath: "inset(0% 0% 0% 0% round 28px)", y: 0, duration: 0.85, ease: "power3.out" }, at + 0.48);
          const code = $$(".code-line", L);
          if (code.length) tl.from(code, { autoAlpha: 0, x: -14, stagger: 0.045, duration: 0.3 }, at + 0.8);
          const link = $(".er__link path", L);
          if (link && HAS_DRAW) tl.from(link, { drawSVG: 0, duration: 0.7, ease: "power2.inOut" }, at + 0.95);
          const rows = $$(".er__table li", L);
          if (rows.length) tl.from(rows, { autoAlpha: 0, x: -10, stagger: 0.025, duration: 0.25 }, at + 0.7);
          tl.to({}, { duration: 0.55 });
        });
        if (map) tl.fromTo(map, { yPercent: 0 }, { yPercent: -24, ease: "none", duration: tl.duration() }, 0);
        const total = tl.duration();
        const marks = switches.map((s) => s / total);
        const setStratum = (p) => {
          const idx = marks.filter((m) => p >= m).length;
          strata.forEach((li, i) => li.classList.toggle("is-active", i === idx));
        };
        ST.create({
          animation: tl,
          trigger: sec,
          start: "top top",
          end: () => "+=" + innerHeight * 3,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => setStratum(self.progress),
          onRefresh: (self) => {
            // o contador acelera nas trocas de camada e fica dentro da faixa de cada zona
            const m0 = marks[0] || 0.38, m1 = marks[1] || 0.7;
            ranges.set(sec, { st: self, keys: [[m0 - 0.06, 260], [m0, 650], [m1 - 0.06, 960], [m1, 2100], [1, 3200]] });
          },
        });
        setStratum(0);
        return () => { sec.classList.remove("is-pinned"); ranges.delete(sec); };
      }
      // empilhado: cada camada surge no seu tempo
      layers.forEach((L) => {
        if (still) return;
        gsap.from([$(".layer__text", L), $(".layer__artifact", L)], {
          y: 50, autoAlpha: 0, duration: 1, stagger: 0.12,
          scrollTrigger: { trigger: L, start: "top 82%", once: true },
        });
        const code = $$(".code-line", L);
        if (code.length) gsap.from(code, { autoAlpha: 0, x: -12, stagger: 0.05, duration: 0.35, scrollTrigger: { trigger: L, start: "top 70%", once: true } });
      });
      return undefined;
    });
  }

  function pageServices() {
    if (!ST) return;
    $$(".service").forEach((s) => {
      const rule = $(".service__rule path", s);
      if (rule && HAS_DRAW && !reduce) {
        gsap.from(rule, { drawSVG: 0, ease: "none", scrollTrigger: { trigger: s, start: "top 95%", end: "top 40%", scrub: true } });
      }
      const icon = $$(".service__icon > *", s);
      if (icon.length && HAS_DRAW && !reduce) {
        gsap.from(icon, { drawSVG: 0, duration: 1.4, stagger: 0.15, ease: "power2.inOut", scrollTrigger: { trigger: s, start: "top 75%", once: true } });
      }
    });
    lineWave($(".split__line"), { amp: 10, k: 1.1 });
  }

  function vizAnim(scope) {
    const tracks = $$(".oee__track i", scope);
    const curve = $(".energy .curve", scope);
    const area = $(".energy .area", scope);
    const nums = $$("[data-count]", scope);
    const bars = $$(".mock__chart i", scope);
    if (reduce) return () => {};
    gsap.set(tracks, { scaleX: 0 });
    gsap.set(bars, { scaleY: 0 });
    if (area) gsap.set(area, { autoAlpha: 0 });
    if (curve && HAS_DRAW) gsap.set(curve, { drawSVG: 0 });
    return () => {
      gsap.to(tracks, { scaleX: 1, duration: 1.3, stagger: 0.12, ease: "power3.out" });
      gsap.to(bars, { scaleY: 1, duration: 1.1, stagger: 0.045, ease: "power3.out" });
      if (curve && HAS_DRAW) gsap.to(curve, { drawSVG: "100%", duration: 1.8, ease: "power2.inOut" });
      if (area) gsap.to(area, { autoAlpha: 1, duration: 1.2, delay: 0.6 });
      nums.forEach((n) => countUp(n, 1.6));
    };
  }

  function pageProjects() {
    const sec = $(".projects");
    if (!sec || !ST) return;
    const track = $(".projects__track", sec);
    const pinEl = $(".projects__pin", sec);
    const bar = $(".projects__bar i", sec);
    const count = $(".projects__count", sec);
    const items = $$(".project", sec);
    const runs = items.map((it) => vizAnim(it));
    const mm = gsap.matchMedia();
    mm.add({ big: "(min-width: 1024px)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { big, still } = ctx.conditions;
      if (big && !still) {
        sec.classList.add("is-horizontal");
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: pinEl,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate(self) {
              if (bar) gsap.set(bar, { scaleX: self.progress });
              if (count) count.textContent = Math.min(items.length, 1 + Math.floor(self.progress * items.length * 0.999)) + " / " + items.length;
            },
            onRefresh(self) { ranges.set(sec, { st: self }); },
            onToggle(self) { if (gauge) gauge.classList.toggle("is-off", self.isActive); }, // não cobre os painéis
          },
        });
        items.forEach((it, i) => {
          const v = $(".project__visual", it);
          if (v) {
            gsap.fromTo(v, { x: 70 }, {
              x: -70, ease: "none",
              scrollTrigger: { trigger: it, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            });
          }
          ST.create({ trigger: it, containerAnimation: tween, start: "left 70%", once: true, onEnter: runs[i] });
        });
        return () => { sec.classList.remove("is-horizontal"); ranges.delete(sec); };
      }
      items.forEach((it, i) => {
        if (!still) gsap.from(it, { y: 60, autoAlpha: 0, duration: 1.1, scrollTrigger: { trigger: it, start: "top 86%", once: true } });
        ST.create({ trigger: it, start: "top 70%", once: true, onEnter: runs[i] });
      });
      return undefined;
    });
  }

  function pageSobre() {
    if (!ST || reduce) return;
    const photos = $$(".member__photo");
    photos.forEach((ph) => {
      const img = $("img", ph);
      gsap.timeline({ scrollTrigger: { trigger: ph, start: "top 90%", once: true } })
        .fromTo(ph,
          { clipPath: "inset(100% 0% 0% 0% round 18px)" },
          { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.3, ease: "power3.inOut", clearProps: "clipPath" })
        .from(img, { scale: 1.35, duration: 1.6, ease: "power3.out", clearProps: "transform" }, 0.1);
    });
  }

  /* Área do cliente */
  function pageAuth() {
    const map = $(".auth__map");
    const iso = isobaths(map, { w: 1600, h: 1000, rings: 20, gap: 30, base: 18, cx: 0.68, cy: 0.52, seed: 11, soundings: 18, deepCenter: false });
    if (iso && !reduce) {
      gsap.ticker.add((t, dt) => { iso.state.t += (Math.min(dt, 50) / 1000) * 0.32; iso.draw(); });
      if (finePointer) {
        const cx = gsap.quickTo(iso.state, "cx", { duration: 2.4, ease: "power3" });
        const cy = gsap.quickTo(iso.state, "cy", { duration: 2.4, ease: "power3" });
        window.addEventListener("pointermove", (e) => {
          cx(0.68 + (e.clientX / innerWidth - 0.5) * 0.14);
          cy(0.52 + (e.clientY / innerHeight - 0.5) * 0.12);
        });
      }
    }

    $$("[data-toggle-pass]").forEach((btn) => {
      const input = btn.parentElement.querySelector("input");
      btn.addEventListener("click", () => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-pressed", String(show));
        btn.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
        $("use", btn).setAttribute("href", show ? "#i-eye-off" : "#i-eye");
      });
    });

    const form = $("form[data-auth]");
    if (!form) return;
    const kind = form.dataset.auth;
    const field = (name) => form.elements[name];
    const setErr = (input, msg) => {
      const f = input.closest(".field");
      if (!f) return;
      f.classList.toggle("has-error", !!msg);
      const e = $(".field__error", f);
      if (e) e.textContent = msg || "";
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    };

    if (kind === "login") {
      const email = field("email");
      const remember = $("#lembrar");
      const saved = local.get("netuno:email");
      if (saved && email && !email.value) { email.value = saved; if (remember) remember.checked = true; }
    }

    if (kind === "cadastro") {
      const tel = field("telefone");
      if (tel) {
        tel.addEventListener("input", () => {
          const d = tel.value.replace(/\D/g, "").slice(0, 11);
          let v = d;
          if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
          if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
          tel.value = v;
        });
      }
    }

    const validate = () => {
      const errs = [];
      const check = (input, msg) => { setErr(input, msg); if (msg) errs.push(input); };
      const email = field("email");
      if (email) check(email, !email.value.trim() ? "Informe seu e-mail." : (!email.checkValidity() ? "Este e-mail não parece válido." : ""));
      if (kind === "login") {
        const s = field("senha");
        check(s, s.value ? "" : "Informe sua senha.");
      } else {
        const nome = field("nome");
        check(nome, nome.value.trim() ? "" : "Informe seu nome completo.");
        const tel = field("telefone");
        check(tel, tel.value.replace(/\D/g, "").length >= 10 ? "" : "Informe um telefone com DDD.");
        const s = field("senha");
        check(s, s.value.length >= 6 ? "" : "A senha precisa ter pelo menos 6 caracteres.");
        const c = field("confirmar_senha");
        check(c, c.value && c.value === s.value ? "" : "As senhas não são iguais.");
      }
      if (errs.length) {
        errs[0].focus();
        const panel = form.closest(".panel");
        if (panel && !reduce) gsap.fromTo(panel, { x: 0 }, { keyframes: { x: [-10, 9, -6, 4, 0] }, duration: 0.5, ease: "power2.out" });
      }
      return !errs.length;
    };

    form.addEventListener("input", (e) => {
      const f = e.target.closest(".field");
      if (f && f.classList.contains("has-error")) setErr(e.target, "");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;
      if (kind === "login") {
        const remember = $("#lembrar");
        if (remember && remember.checked) local.set("netuno:email", field("email").value.trim());
        else local.del("netuno:email");
      }
      const btn = $('button[type="submit"]', form);
      if (btn) {
        btn.classList.add("is-busy");
        btn.setAttribute("aria-busy", "true");
        const label = $(".btn__label", btn);
        if (label) label.textContent = kind === "login" ? "Entrando…" : "Criando conta…";
      }
      dive(() => HTMLFormElement.prototype.submit.call(form));
    });
  }

  /* ---------------------------------------------------------------
     Entrada: loader (primeira visita), drenagem (vindo de outra
     página) ou entrada simples
     --------------------------------------------------------------- */
  function entryAnim(tl, at) {
    const intro = $$("[data-enter]");
    if (intro.length) tl.from(intro, reduce ? { autoAlpha: 0, duration: 0.6, stagger: 0.06 } : { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08 }, at);
    const marks = $$("[data-enter-draw] .ring, [data-enter-draw] .trident path, [data-enter-draw] .waves path");
    if (marks.length && HAS_DRAW && !reduce) tl.from(marks, { drawSVG: 0, duration: 1.2, stagger: 0.06, ease: "power2.inOut" }, at);
    const shake = $("[data-shake]");
    if (shake && !reduce) tl.to(shake, { keyframes: { x: [-12, 10, -7, 4, 0] }, duration: 0.55, ease: "power2.out" }, at + 0.85);
  }

  function uncover(heroInfo, W, fromWater, done) {
    const tl = gsap.timeline({ onComplete: done });
    if (heroInfo) {
      if (W) { W.stop(); }
      if (tide) tide.classList.remove("is-active", "is-dive");
      releaseCover();
      if (fromWater) {
        heroInfo.W.lift = 1;
        heroInfo.W.draw();
        tl.to(heroInfo.W, { lift: 0, duration: 1.4, ease: "power3.inOut", onUpdate: () => reduce && heroInfo.W.draw() }, 0);
        tl.from(heroInfo.foot, { y: 40, autoAlpha: 0, duration: 1.1 }, 0.75);
      } else if (reduce) {
        tl.from([...heroInfo.titles, heroInfo.foot], { autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: "power1.out" }, 0);
      } else {
        if (heroInfo.lines.length) tl.from(heroInfo.lines, { yPercent: 108, duration: 1.15, stagger: 0.08 }, 0.05);
        tl.from(heroInfo.foot, { y: 30, autoAlpha: 0, duration: 1 }, 0.35);
      }
      const chrome = [header, gauge].filter(Boolean);
      if (chrome.length) tl.from(chrome, { autoAlpha: 0, y: -14, duration: 0.9, clearProps: "opacity,visibility,transform" }, fromWater ? 0.7 : 0.15);
    } else {
      if (fromWater && tide) {
        tide.classList.add("is-active", "is-dive"); // esconde céu e marca: só a água escoa
        const water = $(".tide__water", tide);
        const T = W || new Water(tide, [{ el: water }], { level: -0.18, amp: 18, k: 0.9, speed: 1.4 });
        T.level = -0.18;
        T.start();
        tl.to(T, { level: 1.2, duration: 1.05, ease: "power2.inOut" }, 0)
          .add(() => { T.stop(); tide.classList.remove("is-active", "is-dive"); releaseCover(); });
      } else {
        releaseCover();
      }
      const chrome = [header].filter(Boolean);
      if (chrome.length) tl.from(chrome, { autoAlpha: 0, y: -14, duration: 0.9, clearProps: "opacity,visibility,transform" }, 0.2);
    }
    entryAnim(tl, fromWater ? (heroInfo ? 0.8 : 0.45) : 0.1);
    return tl;
  }

  function runLoader(heroInfo, done) {
    tide.classList.add("is-active");
    const W = new Water(tide, [{ el: $(".tide__water", tide) }], { level: 1.16, amp: 16, k: 0.95, speed: 1.1 }).start();
    const splits = HAS_SPLIT ? $$(".tide__word", tide).map((el) => SplitText.create(el, { type: "chars", mask: "chars" })) : [];
    const chars = splits.flatMap((s) => s.chars);
    const tl = gsap.timeline();
    tl.set($$(".tide__brand", tide), { opacity: 1 }, 0);
    if (HAS_DRAW) {
      tl.from($$(".tide .ring", tide), { drawSVG: 0, rotation: -90, transformOrigin: "50% 50%", duration: 1.15, ease: "power2.inOut" }, 0)
        .from($$(".tide .trident path", tide), { drawSVG: 0, duration: 0.9, stagger: 0.08, ease: "power2.inOut" }, 0.25)
        .from($$(".tide .waves path", tide), { drawSVG: 0, duration: 0.85, stagger: 0.1, ease: "power2.out" }, 0.6);
    }
    if (chars.length) tl.from(chars, { yPercent: 115, duration: 0.85, stagger: 0.05 }, 0.5);
    tl.from($$(".tide__tag", tide), { autoAlpha: 0, y: 10, duration: 0.7 }, 0.95)
      .to(W, { level: -0.18, duration: 1.25, ease: "power2.inOut" }, 1.6)
      .add(() => {
        store.set("netuno:visited", "1");
        if (heroInfo) {
          uncover(heroInfo, W, true, done);
        } else {
          uncover(null, W, true, done);
        }
        splits.forEach((s) => s.revert());
      });
  }

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  async function boot() {
    window.__netunoReady = true;
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    await Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]);

    const first = html.classList.contains("is-first") && !!tide;
    const fromDive = html.classList.contains("is-diving") && !!tide;

    smoother = initSmoother();
    const heroInfo = initHero();

    if (page === "home") pageHome(heroInfo);
    else if (heroInfo) heroScroll(heroInfo, false);
    if (page === "servicos") pageServices();
    if (page === "projetos") pageProjects();
    if (page === "sobre") pageSobre();
    if (body.classList.contains("auth")) pageAuth();

    if (heroInfo) heroInfo.watch();
    initDepth();
    initHeader(heroInfo);
    initMenu();
    initLinks();
    initMagnetic();
    initRays();

    if (first || fromDive) lockScroll(true);

    const done = () => {
      lockScroll(false);
      initReveals();
      if (ST) ST.refresh();
    };

    if (first) runLoader(heroInfo, done);
    else uncover(heroInfo, null, fromDive, done);
  }

  boot().catch((err) => {
    releaseCover();
    lockScroll(false);
    console.error("[netuno]", err);
  });
})();
