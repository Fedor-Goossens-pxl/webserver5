// ===== INK CURSOR EFFECT (gebaseerd op Ricardo Mendieta / CodePen WgvENJ) =====
// Witte blob-dots die de muis volgen met een vloeibaar "inkt" goo-filter

(function () {

  // ── 1. SVG goo-filter injecteren ─────────────────────────────────────────
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('version', '1.1');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  svg.innerHTML = `
    <defs>
      <filter id="ink-goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feColorMatrix in="blur" mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
          result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
      </filter>
    </defs>`;
  document.body.appendChild(svg);

  // ── 2. Cursor container aanmaken ─────────────────────────────────────────
  const cursorEl = document.createElement('div');
  cursorEl.id = 'ink-cursor';
  cursorEl.style.cssText = `
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 99999;
    filter: url("#ink-goo");
    opacity: 0.35;
  `;
  document.body.appendChild(cursorEl);

  // ── 3. Configuratie ───────────────────────────────────────────────────────
  const AMOUNT     = 20;
  const SINE_DOTS  = Math.floor(AMOUNT * 0.3);
  const DOT_SIZE   = 24;
  const IDLE_DELAY = 150;
  const LERP       = 0.35;

  let mouseX    = 0;
  let mouseY    = 0;
  let idle      = false;
  let timeoutID = null;
  const dots    = [];

  // ── 4. Dot klasse ─────────────────────────────────────────────────────────
  class Dot {
    constructor(index) {
      this.index      = index;
      this.x          = 0;
      this.y          = 0;
      this.scale      = 1 - 0.05 * index;
      this.range      = DOT_SIZE / 2 - (DOT_SIZE / 2) * this.scale + 2;
      this.angleSpeed = 0.05;
      this.angleX     = 0;
      this.angleY     = 0;
      this.lockX      = 0;
      this.lockY      = 0;

      this.el = document.createElement('span');
      this.el.style.cssText = `
        position: absolute;
        display: block;
        width: ${DOT_SIZE}px;
        height: ${DOT_SIZE}px;
        border-radius: 50%;
        background-color: white;
        transform-origin: center center;
        top: 0;
        left: 0;
        will-change: transform;
      `;
      cursorEl.appendChild(this.el);
    }

    lock() {
      this.lockX  = this.x;
      this.lockY  = this.y;
      this.angleX = Math.random() * Math.PI * 2;
      this.angleY = Math.random() * Math.PI * 2;
    }

    draw() {
      const tx = this.x - DOT_SIZE / 2;
      const ty = this.y - DOT_SIZE / 2;
      if (!idle || this.index <= SINE_DOTS) {
        this.el.style.transform = `translate(${tx}px, ${ty}px) scale(${this.scale})`;
      } else {
        this.angleX += this.angleSpeed;
        this.angleY += this.angleSpeed;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        this.el.style.transform = `translate(${this.x - DOT_SIZE / 2}px, ${this.y - DOT_SIZE / 2}px) scale(${this.scale})`;
      }
    }
  }

  // ── 5. Dots bouwen ────────────────────────────────────────────────────────
  for (let i = 0; i < AMOUNT; i++) {
    dots.push(new Dot(i));
  }

  // ── 6. Idle timer ─────────────────────────────────────────────────────────
  function startIdleTimer() {
    timeoutID = setTimeout(() => {
      idle = true;
      dots.forEach(d => d.lock());
    }, IDLE_DELAY);
  }

  function resetIdleTimer() {
    clearTimeout(timeoutID);
    idle = false;
    startIdleTimer();
  }

  // ── 7. Muis events ────────────────────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    resetIdleTimer();
  });

  // ── 8. Render loop ────────────────────────────────────────────────────────
  function render() {
    let x = mouseX;
    let y = mouseY;

    dots.forEach((dot, i) => {
      const next = dots[i + 1] || dots[0];
      dot.x = x;
      dot.y = y;
      dot.draw();

      if (!idle || i <= SINE_DOTS) {
        x += (next.x - dot.x) * LERP;
        y += (next.y - dot.y) * LERP;
      }
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

})();
