// Hero entrance, header hairline, the experience line, mobile menu, copy email.
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion(root = document) {
  root.querySelectorAll('[data-enter]').forEach((el) => {
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
  });

  const top = root.querySelector('.top');
  if (top) {
    const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const line = root.getElementById ? root.getElementById('path-line') : null;
  if (line && !reduced() && 'IntersectionObserver' in window) {
    line.classList.add('is-armed');
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        line.classList.add('is-in');
        io.disconnect();
      }
    }, { threshold: 0.25 });
    io.observe(line.parentElement);
  }

  const toggle = root.getElementById ? root.getElementById('nav-toggle') : null;
  if (toggle && top) {
    const set = (open) => {
      top.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    top.querySelectorAll('.top__nav a').forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { set(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  }

  const copy = root.getElementById ? root.getElementById('copy-email') : null;
  if (copy) {
    const original = copy.textContent;
    copy.addEventListener('click', async () => {
      const text = copy.dataset.copy;
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        const target = root.getElementById('email');
        if (target) {
          const range = document.createRange();
          range.selectNodeContents(target);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
      copy.textContent = ok ? 'Copied' : 'Press Ctrl+C to copy';
      setTimeout(() => { copy.textContent = original; }, 2000);
    });
  }
}
