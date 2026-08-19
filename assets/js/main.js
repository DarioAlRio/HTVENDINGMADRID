/* ============================================================
   HT Vending Madrid — comportamiento de la interfaz
   Vanilla JS, sin dependencias. Compatible Safari / Chrome / Firefox / Edge.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqDesktop = window.matchMedia ? window.matchMedia('(min-width: 981px)') : { matches: true };

  /* ---------- 1. Menú único: panel móvil + submenús ---------- */
  function initNav() {
    var nav = document.getElementById('nav');
    var toggle = document.querySelector('.nav-toggle');
    var scrim = document.querySelector('.nav-scrim');
    var closeBtn = document.querySelector('.nav__close');
    if (!nav || !toggle) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      if (scrim) scrim.classList.toggle('is-on', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-locked', open);
      if (open) {
        var first = nav.querySelector('a, button');
        if (first) first.focus();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); toggle.focus(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });

    // Cierra al pulsar un enlace real del panel
    nav.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (a && !mqDesktop.matches && a.getAttribute('href') && a.getAttribute('href').charAt(0) !== '#') {
        setOpen(false);
      }
    });

    // Submenús: hover en escritorio, acordeón accesible en móvil
    Array.prototype.forEach.call(nav.querySelectorAll('.has-sub'), function (item) {
      var btn = item.querySelector('.nav__link');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        if (mqDesktop.matches) return;         // en escritorio manda el :hover
        e.preventDefault();
        var open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    // Al volver a escritorio, restablece el estado
    function syncViewport() {
      if (mqDesktop.matches) {
        setOpen(false);
        Array.prototype.forEach.call(nav.querySelectorAll('.has-sub'), function (i) {
          i.classList.remove('is-open');
          var b = i.querySelector('.nav__link');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
      }
    }
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', syncViewport);
    else if (mqDesktop.addListener) mqDesktop.addListener(syncViewport);
  }

  /* ---------- 2. Sombra de cabecera al hacer scroll ---------- */
  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-stuck', window.pageYOffset > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- 3. Carrusel del hero ---------- */
  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = hero.querySelectorAll('.hero__slide');
    var dots = hero.querySelectorAll('.hero__dots button');
    var caption = hero.querySelector('.hero__cap');
    var prev = hero.querySelector('.hero__prev');
    var next = hero.querySelector('.hero__next');
    if (slides.length < 2) return;

    var index = 0, timer = null, DELAY = 6500;

    function show(i) {
      index = (i + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (s, n) {
        s.classList.toggle('is-active', n === index);
        s.setAttribute('aria-hidden', n === index ? 'false' : 'true');
      });
      Array.prototype.forEach.call(dots, function (d, n) {
        d.setAttribute('aria-selected', n === index ? 'true' : 'false');
      });
      if (caption) caption.textContent = slides[index].getAttribute('data-caption') || '';
    }
    function play() { if (!reduceMotion) { stop(); timer = window.setInterval(function () { show(index + 1); }, DELAY); } }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function go(i) { show(i); play(); }

    Array.prototype.forEach.call(dots, function (d, n) {
      d.addEventListener('click', function () { go(n); });
    });
    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', play);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else play();
    });

    // Gesto táctil
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 44) go(dx < 0 ? index + 1 : index - 1); else play();
      x0 = null;
    }, { passive: true });

    show(0);
    play();
  }

  /* ---------- 4. Reveal al entrar en pantalla ---------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    function showAll() {
      items.forEach(function (el) { el.classList.add('is-in'); });
      items.length = 0;
    }
    if (reduceMotion || !('IntersectionObserver' in window)) { showAll(); return; }

    // Lo que ya está en pantalla se muestra de inmediato: nunca queda contenido oculto
    function showVisible() {
      items = items.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < (window.innerHeight || 0) * 0.96 && r.bottom > 0) { el.classList.add('is-in'); return false; }
        return true;
      });
    }
    showVisible();

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });

    // Red de seguridad: si el observador no llegara a dispararse, el contenido se muestra igualmente
    window.addEventListener('scroll', showVisible, { passive: true });
    window.addEventListener('resize', showVisible, { passive: true });
    window.setTimeout(showVisible, 900);
  }

  /* ---------- 5. Contadores ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(nums, function (el) {
        el.textContent = (el.getAttribute('data-prefix') || '') + el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var pre = el.getAttribute('data-prefix') || '';
        var suf = el.getAttribute('data-suffix') || '';
        var t0 = null, DUR = 1500;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / DUR, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(target * eased).toLocaleString('es-ES') + suf;
          if (p < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(nums, function (el) { io.observe(el); });
  }

  /* ---------- 6. Lightbox de la galería de máquinas ---------- */
  function initLightbox() {
    var links = document.querySelectorAll('[data-lb]');
    if (!links.length) return;

    var box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Galería de máquinas de vending');
    box.innerHTML =
      '<button class="lb__close" type="button" aria-label="Cerrar galería">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lb__prev" type="button" aria-label="Imagen anterior">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<button class="lb__next" type="button" aria-label="Imagen siguiente">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>' +
      '<figure class="lb__fig"><img class="lb__img" src="" alt=""><figcaption class="lb__cap"></figcaption></figure>';
    document.body.appendChild(box);

    var img = box.querySelector('.lb__img');
    var cap = box.querySelector('.lb__cap');
    var i = 0, last = null;

    function render() {
      var a = links[i];
      img.src = a.getAttribute('href');
      img.alt = a.getAttribute('data-title') || '';
      cap.innerHTML = (a.getAttribute('data-title') || '') +
        '<span>' + (i + 1) + ' de ' + links.length + (a.getAttribute('data-sub') ? ' · ' + a.getAttribute('data-sub') : '') + '</span>';
    }
    function open(n) {
      i = n; last = document.activeElement; render();
      box.classList.add('is-on');
      document.body.classList.add('nav-locked');
      box.querySelector('.lb__close').focus();
    }
    function close() {
      box.classList.remove('is-on');
      document.body.classList.remove('nav-locked');
      if (last && last.focus) last.focus();
    }
    function move(d) { i = (i + d + links.length) % links.length; render(); }

    Array.prototype.forEach.call(links, function (a, n) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(n); });
    });
    box.querySelector('.lb__close').addEventListener('click', close);
    box.querySelector('.lb__prev').addEventListener('click', function () { move(-1); });
    box.querySelector('.lb__next').addEventListener('click', function () { move(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    });

    var tx = null;
    box.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
      tx = null;
    }, { passive: true });
  }

  /* ---------- 7. Formulario de contacto ---------- */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var msg = form.querySelector('.form-msg');
    var submit = form.querySelector('[type="submit"]');

    function fail(field, text) {
      var box = field.closest('.field') || field.closest('.check');
      if (!box) return;
      box.classList.add('has-err');
      var e = box.querySelector('.err');
      if (e && text) e.textContent = text;
    }
    function clearErrors() {
      Array.prototype.forEach.call(form.querySelectorAll('.has-err'), function (b) { b.classList.remove('has-err'); });
    }
    function say(kind, html) {
      if (!msg) return;
      msg.className = 'form-msg is-on form-msg--' + kind;
      msg.innerHTML = html;
      msg.setAttribute('role', 'status');
      msg.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }

    form.addEventListener('input', function (e) {
      var box = e.target.closest ? (e.target.closest('.field') || e.target.closest('.check')) : null;
      if (box) box.classList.remove('has-err');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      // Trampa antispam
      if (form.querySelector('[name="website"]') && form.querySelector('[name="website"]').value) return;

      var ok = true;
      var name = form.querySelector('#name');
      var email = form.querySelector('#email');
      var phone = form.querySelector('#phone');
      var message = form.querySelector('#message');
      var lopd = form.querySelector('#lopd');

      if (!name.value.trim() || name.value.trim().length < 2) { fail(name, 'Indícanos tu nombre.'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim())) { fail(email, 'Revisa el correo electrónico.'); ok = false; }
      if (phone.value.replace(/\D/g, '').length < 9) { fail(phone, 'Indica un teléfono de 9 dígitos.'); ok = false; }
      if (message.value.trim().length < 12) { fail(message, 'Cuéntanos brevemente qué necesitas.'); ok = false; }
      if (lopd && !lopd.checked) { fail(lopd, ''); ok = false; }

      if (!ok) {
        say('ko', 'Revisa los campos marcados para poder enviar tu solicitud.');
        var first = form.querySelector('.has-err input, .has-err textarea');
        if (first) first.focus();
        return;
      }

      var label = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'Enviando…';

      var action = form.getAttribute('action');
      fetch(action, { method: 'POST', body: new FormData(form) })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          say('ok', '<strong>¡Gracias!</strong> Hemos recibido tu solicitud. Te contactaremos en menos de 24 horas laborables.');
          form.reset();
        })
        .catch(function () {
          say('ko', 'No hemos podido enviar el formulario en este momento. Escríbenos a <a href="mailto:administracion@htvendingmadrid.es">administracion@htvendingmadrid.es</a> o llámanos al <a href="tel:+34669562410">669 562 410</a>.');
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = label;
        });
    });
  }

  /* ---------- 8. Año en curso ---------- */
  function initYear() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function boot() {
    initNav();
    initStickyHeader();
    initHero();
    initReveal();
    initCounters();
    initLightbox();
    initForm();
    initYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
