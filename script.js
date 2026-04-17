(() => {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);

  // RSVP -> Google Sheets (Google Apps Script Web App)
  // Paste your deployed Web App URL here.
  const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbzFWo5LLJLdaVT7ouEUUJV1jygSq5W_Vm6nxBOqxOocUZkdo4VzAXZMcYY4YQdruT0O/exec";

  function pad2(n) {
    return String(Math.max(0, Math.floor(n))).padStart(2, "0");
  }

  function initReveal() {
    const nodes = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    nodes.forEach((n) => io.observe(n));
  }

  function initCountdown() {
    const el = $("[data-countdown]");
    if (!el) return;

    const targetRaw = el.getAttribute("data-target");
    const target = targetRaw ? new Date(targetRaw) : null;
    if (!target || Number.isNaN(target.getTime())) return;

    const parts = {
      days: $('[data-cd="days"]', el),
      hours: $('[data-cd="hours"]', el),
      minutes: $('[data-cd="minutes"]', el),
      seconds: $('[data-cd="seconds"]', el),
    };

    const tick = () => {
      const now = new Date();
      let diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        diff = 0;
      }

      const s = Math.floor(diff / 1000);
      const days = Math.floor(s / 86400);
      const hours = Math.floor((s % 86400) / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      const seconds = s % 60;

      if (parts.days) parts.days.textContent = String(days);
      if (parts.hours) parts.hours.textContent = pad2(hours);
      if (parts.minutes) parts.minutes.textContent = pad2(minutes);
      if (parts.seconds) parts.seconds.textContent = pad2(seconds);
    };

    tick();
    window.setInterval(tick, 1000);
  }

  function initParallax() {
    const img = $("[data-parallax]");
    if (!img) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const t = Math.min(40, y * 0.06);
      img.style.transform = `translate3d(0, ${t}px, 0) scale(1.06)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initPetals() {
    const layer = $("[data-petals]");
    if (!layer) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const max = 16;
    const makePetal = () => {
      const p = document.createElement("span");
      p.className = "petal";
      const left = Math.random() * 100;
      const size = 10 + Math.random() * 14;
      const dur = 7 + Math.random() * 8;
      const delay = Math.random() * 3;
      const drift = (Math.random() * 120 - 60).toFixed(1);

      p.style.left = `${left}%`;
      p.style.top = `-24px`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.animationDuration = `${dur}s`;
      p.style.animationDelay = `${delay}s`;
      p.style.setProperty("--drift", `${drift}px`);

      const hue = 320 + Math.random() * 20;
      p.style.filter = `hue-rotate(${(hue - 320).toFixed(1)}deg)`;

      const cleanup = () => p.remove();
      p.addEventListener("animationend", cleanup, { once: true });

      layer.appendChild(p);
    };

    for (let i = 0; i < 10; i++) makePetal();

    window.setInterval(() => {
      const current = layer.querySelectorAll(".petal").length;
      const spawn = current < max ? 2 : 1;
      for (let i = 0; i < spawn; i++) makePetal();
    }, 900);
  }

  function initAudio() {
    const audio = $("[data-audio]");
    const btn = $("[data-audio-toggle]");
    if (!audio || !btn) return;

    let enabled = false;
    const setUI = () => {
      btn.setAttribute("aria-pressed", enabled ? "true" : "false");
      btn.style.borderColor = enabled ? "rgba(200,164,77,.55)" : "";
      btn.style.boxShadow = enabled ? "0 0 0 6px rgba(200,164,77,.18)" : "";
    };

    const tryPlay = async () => {
      try {
        await audio.play();
        enabled = true;
        setUI();
      } catch {
        enabled = false;
        setUI();
      }
    };

    const pause = () => {
      audio.pause();
      enabled = false;
      setUI();
    };

    btn.addEventListener("click", () => {
      if (enabled) pause();
      else void tryPlay();
    });

    // Some browsers require explicit user gesture; we keep it off by default.
    setUI();
  }

  function initLightbox() {
    const box = $("[data-lightbox]");
    const img = $("[data-lightbox-img]");
    const gallery = $("[data-gallery]");
    if (!box || !img || !gallery) return;

    const items = $$("[data-src]", gallery);
    let idx = 0;

    const open = (i) => {
      idx = (i + items.length) % items.length;
      img.src = items[idx].getAttribute("data-src") || "";
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      img.removeAttribute("src");
    };

    const next = () => open(idx + 1);
    const prev = () => open(idx - 1);

    items.forEach((it, i) => {
      it.addEventListener("click", () => open(i));
      it.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") open(i);
      });
      it.setAttribute("tabindex", "0");
      it.setAttribute("role", "button");
      it.setAttribute("aria-label", "Mở ảnh");
    });

    const btnClose = $("[data-lightbox-close]", box);
    const btnNext = $("[data-lightbox-next]", box);
    const btnPrev = $("[data-lightbox-prev]", box);
    btnClose?.addEventListener("click", close);
    btnNext?.addEventListener("click", next);
    btnPrev?.addEventListener("click", prev);

    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });

    window.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
  }

  function initRSVP() {
    const form = $("[data-rsvp]");
    const modal = $("[data-modal]");
    const modalText = $("[data-modal-text]");
    const closeBtn = $("[data-modal-close]");
    if (!form || !modal) return;

    // Set true ONLY when you intentionally want to open Apps Script response in a new tab.
    // Keep it false for normal usage to avoid "văng ra ok".
    const RSVP_DEBUG = false;

    const ensureSinkFrame = () => {
      let frame = document.querySelector('iframe[name="rsvp_sink"]');
      if (frame) return frame;
      frame = document.createElement("iframe");
      frame.name = "rsvp_sink";
      frame.setAttribute("aria-hidden", "true");
      frame.tabIndex = -1;
      frame.style.display = "none";
      document.body.appendChild(frame);
      return frame;
    };

    const submitBtn = $('[type="submit"]', form);
    const setSubmitting = (v) => {
      if (!submitBtn) return;
      submitBtn.disabled = v;
      submitBtn.style.opacity = v ? "0.85" : "";
      submitBtn.textContent = v ? "Đang gửi..." : "Gửi RSVP";
    };

    const open = (text) => {
      if (modalText) modalText.textContent = text;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    closeBtn?.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    window.addEventListener("keydown", (e) => {
      if (modal.classList.contains("is-open") && e.key === "Escape") close();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim() || "bạn";
      const attend = String(fd.get("attend") || "");
      const guests = String(fd.get("guests") || "1");
      const note = String(fd.get("note") || "").trim();

      const humanAttend =
        attend === "yes" ? "Tham dự" : attend === "maybe" ? "Chưa chắc" : attend === "no" ? "Xin phép vắng mặt" : attend;

      const payload = {
        name,
        attend,
        attendText: humanAttend,
        guests,
        note,
        page: location.pathname.split("/").pop() || "detail.html",
        userAgent: navigator.userAgent,
        submittedAt: new Date().toISOString(),
      };

      if (!RSVP_ENDPOINT) {
        const msg =
          attend === "no"
            ? `Cảm ơn ${name}. (Chưa cấu hình Google Sheet) Mình đã ghi nhận RSVP trên trình duyệt.`
            : `Cảm ơn ${name}. (Chưa cấu hình Google Sheet) RSVP đã ghi nhận: ${humanAttend} • ${guests} người.`;
        open(msg);
        form.reset();
        return;
      }

      setSubmitting(true);
      // Most reliable "no-backend" approach:
      // submit via a hidden iframe (no fetch => no CORS).
      try {
        form.setAttribute("action", RSVP_ENDPOINT);
        form.setAttribute("method", "POST");
        if (RSVP_DEBUG) {
          // Debug mode: open Apps Script response in new tab
          // (Turn RSVP_DEBUG=true above)
          form.setAttribute("target", "_blank");
        } else {
          ensureSinkFrame();
          form.setAttribute("target", "rsvp_sink");
        }

        const injected = [];
        const inject = (k, v) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = String(v ?? "");
          form.appendChild(input);
          injected.push(input);
        };
        // Only inject extra fields to avoid duplicate keys with existing form inputs.
        inject("attendText", payload.attendText);
        inject("page", payload.page);
        inject("userAgent", payload.userAgent);
        inject("submittedAt", payload.submittedAt);

        form.submit();
        // Defer removal to ensure the browser has consumed the fields for submission.
        setTimeout(() => injected.forEach((n) => n.remove()), 0);

        const msg =
          attend === "no"
            ? `Cảm ơn ${name}. Chúng mình đã nhận RSVP của bạn. Hẹn dịp gần nhất nhé.`
            : `Cảm ơn ${name}. Chúng mình đã nhận RSVP: ${humanAttend} • ${guests} người.`;
        open(msg);
        form.reset();
      } catch {
        open(`Xin lỗi ${name}, hiện chưa gửi được RSVP lên Google Sheet. Bạn thử lại giúp mình sau nhé.`);
      } finally {
        setSubmitting(false);
      }
    });
  }

  function init() {
    initReveal();
    initCountdown();
    initParallax();
    initPetals();
    initAudio();
    initLightbox();
    initRSVP();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

