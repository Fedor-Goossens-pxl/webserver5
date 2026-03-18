/**
 * scroll-animate.js
 * Scroll-animatie library voor webserver4 — gebaseerd op het concept van josh.js
 * Gebruikt IntersectionObserver + animate.css
 *
 * Gebruik in HTML:
 *   <div class="sa-js" data-sa-anim="fadeInUp">Inhoud</div>
 *
 * Data-attributen:
 *   data-sa-anim="fadeInUp"        → Animatienaam van animate.css (verplicht)
 *   data-sa-duration="800ms"       → Duur van de animatie (optioneel, default: 600ms)
 *   data-sa-delay="200ms"          → Vertraging voor de animatie (optioneel, default: 0ms)
 *   data-sa-iteration="1"          → Aantal herhalingen (optioneel, default: 1)
 *   data-sa-once="true"            → Animeer slechts één keer (optioneel, default: true)
 *
 * Initialisatie:
 *   const sa = new ScrollAnimate();
 *
 *   Of met opties:
 *   const sa = new ScrollAnimate({
 *     initClass: 'sa-js',
 *     animClass: 'animate__animated',
 *     offset: 0.15,
 *     animateInMobile: true,
 *     once: true,
 *   });
 */

class ScrollAnimate {
  constructor(options = {}) {
    this.config = {
      initClass:        options.initClass        ?? 'sa-js',
      animClass:        options.animClass        ?? 'animate__animated',
      offset:           options.offset           ?? 0.15,
      animateInMobile:  options.animateInMobile  ?? true,
      once:             options.once             ?? true,
      onDOMChange:      options.onDOMChange      ?? false,
    };

    // Mobiel check
    this._isMobile = window.innerWidth < 768;
    if (this._isMobile && !this.config.animateInMobile) return;

    this._init();
  }

  // ── Initialiseer alle elementen ──────────────────────────────────────────
  _init() {
    const elements = document.querySelectorAll(`.${this.config.initClass}`);
    if (!elements.length) return;

    // Verberg alle elementen vóór ze in beeld komen
    elements.forEach(el => {
      el.style.opacity = '0';
    });

    this._observer = new IntersectionObserver(
      (entries) => this._handleEntries(entries),
      { threshold: this.config.offset }
    );

    elements.forEach(el => this._observer.observe(el));

    // DOM-mutaties volgen (optioneel)
    if (this.config.onDOMChange) {
      this._mutationObserver = new MutationObserver(() => {
        const newEls = document.querySelectorAll(
          `.${this.config.initClass}:not([data-sa-observed])`
        );
        newEls.forEach(el => {
          el.style.opacity = '0';
          this._observer.observe(el);
        });
      });
      this._mutationObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  // ── Verwerk IntersectionObserver entries ─────────────────────────────────
  _handleEntries(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this._animate(entry.target);
        if (this.config.once) {
          this._observer.unobserve(entry.target);
        }
      } else if (!this.config.once) {
        this._reset(entry.target);
      }
    });
  }

  // ── Animeer één element ───────────────────────────────────────────────────
  _animate(el) {
    const animName  = el.dataset.saAnim      || 'fadeInUp';
    const duration  = el.dataset.saDuration  || '600ms';
    const delay     = el.dataset.saDelay     || '0ms';
    const iteration = el.dataset.saIteration || '1';

    el.style.opacity                  = '';
    el.style.animationDuration        = duration;
    el.style.animationDelay           = delay;
    el.style.animationIterationCount  = iteration;

    el.classList.add(this.config.animClass, `animate__${animName}`);
    el.setAttribute('data-sa-observed', 'true');

    // Na afloop klassen opruimen (enkel als once = true)
    if (this.config.once) {
      const durationMs = this._toMs(duration) + this._toMs(delay);
      setTimeout(() => {
        el.classList.remove(this.config.animClass, `animate__${animName}`);
        el.style.animationDuration       = '';
        el.style.animationDelay          = '';
        el.style.animationIterationCount = '';
      }, durationMs + 50);
    }
  }

  // ── Reset element (voor herhaalde animaties bij opnieuw in/uit beeld) ─────
  _reset(el) {
    const animName = el.dataset.saAnim || 'fadeInUp';
    el.classList.remove(this.config.animClass, `animate__${animName}`);
    el.style.opacity = '0';
  }

  // ── Helper: zet "600ms" of "0.6s" om naar milliseconden ──────────────────
  _toMs(value) {
    if (!value) return 0;
    if (value.endsWith('ms')) return parseFloat(value);
    if (value.endsWith('s'))  return parseFloat(value) * 1000;
    return parseFloat(value);
  }

  // ── Publieke methode: hervat observatie van alle elementen ────────────────
  refresh() {
    this._observer.disconnect();
    this._init();
  }
}
