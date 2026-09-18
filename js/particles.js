(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let particles = [];
  let rafId = null;
  let isTabActive = true;

  const CONFIG = {
    linkDistance: 130,
    maxSpeed: 0.18,
    baseColor: '61, 219, 134',
  };

  function particleCountForSize(w, h) {
    const area = w * h;
    return Math.min(110, Math.max(28, Math.round(area / 15500)));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targetCount = particleCountForSize(width, height);
    if (particles.length === 0) {
      particles = Array.from({ length: targetCount }, createParticle);
    } else if (particles.length < targetCount) {
      while (particles.length < targetCount) particles.push(createParticle());
    } else if (particles.length > targetCount) {
      particles.length = targetCount;
    }
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.maxSpeed,
      vy: (Math.random() - 0.5) * CONFIG.maxSpeed,
      r: Math.random() * 1.8 + 0.6,
      baseOpacity: Math.random() * 0.5 + 0.15,
      twinkleOffset: Math.random() * Math.PI * 2,
    };
  }

  function step(time) {
    if (!isTabActive) {
      rafId = requestAnimationFrame(step);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      const twinkle = Math.sin(time * 0.0006 + p.twinkleOffset) * 0.25 + 0.75;
      const opacity = p.baseOpacity * twinkle;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.baseColor}, ${opacity})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.linkDistance) {
          const lineOpacity = (1 - dist / CONFIG.linkDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${CONFIG.baseColor}, ${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (rafId) return;
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    isTabActive = document.visibilityState === 'visible';
  });

  window.addEventListener('resize', resize);

  resize();

  if (prefersReducedMotion) {
    particles = particles.slice(0, Math.round(particles.length * 0.4));
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.baseColor}, ${p.baseOpacity})`;
      ctx.fill();
    });
  } else {
    start();
  }
})();
