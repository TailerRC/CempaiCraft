/* =============================================
   CEMPAICRAFT - COMPONENTS JS
   Navbar & Footer — FontAwesome 7.2 | Sin emojis
   ============================================= */

(function () {
  'use strict';

  const path   = window.location.pathname;
  const isPage = path.includes('/pages/');
  const prefix = isPage ? '../' : './';

  /* ───────────────────────────────────────────
     NAVBAR HTML
  ─────────────────────────────────────────── */
  const navbarHTML = `
  <nav class="navbar" id="navbar" role="navigation" aria-label="Navegación principal">
    <div class="navbar__inner">

      <!-- Logo -->
      <a href="${prefix}index.html" class="navbar__logo" id="nav-logo" aria-label="CempaiCraft inicio">
        <img src="${prefix}assets/img/Logo.png" alt="CempaiCraft" class="navbar__logo-img" />
        <span class="navbar__logo-text">CempaiCraft</span>
      </a>

      <!-- Links de escritorio -->
      <div class="navbar__nav" role="list">
        <a href="${prefix}index.html"             class="navbar__link" id="nav-inicio"    role="listitem">Inicio</a>
        <a href="${prefix}pages/tutorial.html"    class="navbar__link" id="nav-tutorial"  role="listitem">Tutoriales</a>
        <a href="${prefix}pages/micropagos.html"  class="navbar__link" id="nav-tienda"    role="listitem">Tienda</a>
        <a href="${prefix}pages/contacto.html"    class="navbar__link" id="nav-contacto"  role="listitem">Contacto</a>
      </div>

      <!-- Carrito + hamburguesa -->
      <div class="navbar__right">
        <button class="navbar__cart-btn" id="navbar-cart-btn" aria-label="Abrir carrito">
          <i class="fa-solid fa-cart-shopping"></i>
          <span class="navbar__cart-badge" id="cart-badge" style="display:none;">0</span>
        </button>
        <button class="navbar__hamburger" id="hamburger-btn" aria-label="Abrir menú" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <!-- Menú móvil -->
    <div class="navbar__mobile" id="mobile-menu" role="dialog" aria-label="Menú móvil">
      <a href="${prefix}index.html"            class="navbar__link" id="mobile-inicio">
        <i class="fa-solid fa-house"></i> Inicio
      </a>
      <a href="${prefix}pages/tutorial.html"   class="navbar__link" id="mobile-tutorial">
        <i class="fa-solid fa-book"></i> Tutoriales
      </a>
      <a href="${prefix}pages/micropagos.html" class="navbar__link" id="mobile-tienda">
        <i class="fa-solid fa-store"></i> Tienda
      </a>
      <a href="${prefix}pages/contacto.html"   class="navbar__link" id="mobile-contacto">
        <i class="fa-solid fa-envelope"></i> Contacto
      </a>
    </div>
  </nav>
  `;

  /* ───────────────────────────────────────────
     FOOTER HTML — Simplificado, sin sección Servidor
  ─────────────────────────────────────────── */
  const footerHTML = `
  <footer class="footer" id="footer" role="contentinfo">
    <div class="container">
      <div class="footer__grid">

        <!-- Marca -->
        <div class="footer__brand">
          <div class="footer__logo">
            <img src="${prefix}assets/img/Logo.png" alt="CempaiCraft Logo" class="footer__logo-img" />
            <span class="footer__logo-text">CempaiCraft</span>
          </div>
          <p class="footer__desc">
            Servidor de Minecraft Survival. Únete a nuestra comunidad, obtén llaves
            y vive una experiencia única en <strong>cempaicraft.olimpo.host</strong>.
          </p>
          <div class="footer__social" role="list" aria-label="Redes sociales">
            <a href="https://discord.gg/mU7axZHUDZ" class="footer__social-link" id="footer-discord" role="listitem" aria-label="Discord" target="_blank">
              <i class="fa-brands fa-discord"></i>
            </a>
            <a href="https://www.instagram.com/cempai_urp/" class="footer__social-link" id="footer-instagram" role="listitem" aria-label="Instagram" target="_blank">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="https://cempai.netlify.app" class="footer__social-link" id="footer-web" role="listitem" aria-label="Sitio Web" target="_blank">
              <i class="fa-solid fa-globe"></i>
            </a>
          </div>
        </div>

        <!-- Navegación -->
        <div class="footer__col">
          <h4>Navegación</h4>
          <ul class="footer__links">
            <li><a href="${prefix}index.html"            class="footer__link" id="footer-nav-inicio">
              <i class="fa-solid fa-chevron-right"></i> Inicio
            </a></li>
            <li><a href="${prefix}pages/tutorial.html"   class="footer__link" id="footer-nav-tutorial">
              <i class="fa-solid fa-chevron-right"></i> Tutoriales
            </a></li>
            <li><a href="${prefix}pages/micropagos.html" class="footer__link" id="footer-nav-tienda">
              <i class="fa-solid fa-chevron-right"></i> Tienda
            </a></li>
            <li><a href="${prefix}pages/contacto.html"   class="footer__link" id="footer-nav-contacto">
              <i class="fa-solid fa-chevron-right"></i> Contacto
            </a></li>
          </ul>
        </div>

        <!-- Servidor -->
        <div class="footer__col">
          <h4>Servidor</h4>
          <ul class="footer__links">
            <li>
              <span class="footer__link footer__link--info">
                <i class="fa-solid fa-server"></i>
                <span>cempaicraft.olimpo.host</span>
              </span>
            </li>
            <li>
              <span class="footer__link footer__link--info">
                <i class="fa-solid fa-gamepad"></i>
                <span>Modo: Survival</span>
              </span>
            </li>
            <li>
              <span class="footer__link footer__link--info">
                <i class="fa-solid fa-users"></i>
                <span>Hasta 35 jugadores</span>
              </span>
            </li>
            <li>
              <span class="footer__link footer__link--info">
                <i class="fa-solid fa-circle" style="color:#22c55e; font-size:.55rem;"></i>
                <span>Estado: Online</span>
              </span>
            </li>
          </ul>
        </div>

      </div><!-- /footer__grid -->

      <div class="footer__bottom">
        <span>&copy; ${new Date().getFullYear()} CempaiCraft. Todos los derechos reservados.</span>
        <div class="footer__bottom-links">
          <a href="#" id="footer-privacy">Privacidad</a>
          <a href="#" id="footer-terms">Términos</a>
        </div>
      </div>
    </div>
  </footer>
  `;

  /* ───────────────────────────────────────────
     INJECT
  ─────────────────────────────────────────── */
  function injectComponents() {
    const navP    = document.getElementById('navbar-placeholder');
    const footerP = document.getElementById('footer-placeholder');
    if (navP)    { navP.outerHTML    = navbarHTML; initNavbar(); }
    if (footerP) { footerP.outerHTML = footerHTML; }
    setActiveLink();
  }

  /* ── Navbar scroll + hamburger ──────────── */
  function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger-btn');
    const mobile    = document.getElementById('mobile-menu');

    if (!navbar) return;

    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (hamburger && mobile) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobile.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        const [s1, s2, s3] = hamburger.querySelectorAll('span');
        if (isOpen) {
          s1.style.cssText = 'transform:translateY(7px) rotate(45deg)';
          s2.style.cssText = 'opacity:0;transform:scaleX(0)';
          s3.style.cssText = 'transform:translateY(-7px) rotate(-45deg)';
        } else {
          [s1,s2,s3].forEach(s => s.style.cssText = '');
        }
      });

      mobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobile.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
        });
      });
    }
  }

  /* ── Active link ─────────────────────────── */
  function setActiveLink() {
    const cur = window.location.pathname;
    document.querySelectorAll('.navbar__link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const active =
        cur.endsWith(href) ||
        (href.includes('index.html') && (cur.endsWith('/') || cur === '')) ||
        (href !== 'index.html' && href !== './' && cur.includes(
          href.replace('../','').replace('./','').split('?')[0]
        ));
      link.classList.toggle('active', active);
    });
  }

  /* ── Run ─────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectComponents);
  } else {
    injectComponents();
  }
})();
