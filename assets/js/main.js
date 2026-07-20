/* =============================================
   CEMPAICRAFT - MAIN JS
   General page utilities & interactivity
   ============================================= */

(function () {
  'use strict';

  /* ---- Toast notification ---- */
  function showToast(message, duration = 3000) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  /* ---- Tutorial: Copy command ---- */
  function initCopyButtons() {
    document.querySelectorAll('.command-item__copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.closest('.command-item')?.querySelector('.command-item__code')?.textContent?.trim();
        if (!code) return;

        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = '✓ Copiado';
          btn.classList.add('copied');
          showToast(`Comando copiado: ${code}`);

          setTimeout(() => {
            btn.textContent = 'Copiar';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(() => {
          showToast('Error al copiar. Copia manualmente.');
        });
      });
    });
  }

  /* ---- Tutorial: Accordion categories ---- */
  function initAccordion() {
    document.querySelectorAll('.command-category__header').forEach(header => {
      header.addEventListener('click', () => {
        const category = header.closest('.command-category');
        const body = category.querySelector('.command-category__body');
        const toggle = header.querySelector('.command-category__toggle');
        const isOpen = body.classList.contains('open');

        // Close all
        document.querySelectorAll('.command-category__body.open').forEach(b => b.classList.remove('open'));
        document.querySelectorAll('.command-category__toggle.open').forEach(t => t.classList.remove('open'));

        // Open if was closed
        if (!isOpen) {
          body.classList.add('open');
          toggle && toggle.classList.add('open');
        }
      });
    });

    // Open first by default
    const firstBody = document.querySelector('.command-category__body');
    const firstToggle = document.querySelector('.command-category__toggle');
    if (firstBody) {
      firstBody.classList.add('open');
      firstToggle && firstToggle.classList.add('open');
    }
  }

  /* ---- Tutorial: Search filter ---- */
  function initCommandSearch() {
    const searchInput = document.getElementById('command-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.command-item');

      items.forEach(item => {
        const code = item.querySelector('.command-item__code')?.textContent?.toLowerCase() || '';
        const desc = item.querySelector('.command-item__desc')?.textContent?.toLowerCase() || '';
        const matches = code.includes(query) || desc.includes(query);
        item.style.display = matches ? '' : 'none';
      });

      // Show/hide categories based on visible items
      document.querySelectorAll('.command-category').forEach(cat => {
        const visibleItems = cat.querySelectorAll('.command-item:not([style*="display: none"])');
        cat.style.display = visibleItems.length === 0 ? 'none' : '';

        if (query && visibleItems.length > 0) {
          cat.querySelector('.command-category__body')?.classList.add('open');
          cat.querySelector('.command-category__toggle')?.classList.add('open');
        }
      });
    });
  }

  /* ---- Contact Form Handling ---- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('.form-submit');
      btn.textContent = '⏳ Enviando...';
      btn.disabled = true;

      // Simulate form submission
      setTimeout(() => {
        btn.textContent = '✅ Mensaje enviado';
        btn.style.background = 'linear-gradient(135deg, #3CB371, #56D68A)';
        showToast('¡Mensaje enviado correctamente! Te responderemos pronto.', 5000);
        form.reset();

        setTimeout(() => {
          btn.textContent = 'Enviar mensaje';
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }

  /* ---- Tienda: Pack de llaves ---- */
  function initPackButtons() {
    document.querySelectorAll('.pack-card__buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const packName = btn.closest('.pack-card')?.querySelector('.pack-card__name')?.textContent || 'Pack';
        const packPrice = btn.closest('.pack-card')?.querySelector('.pack-card__price-amount')?.textContent || '?';
        const packKeys = btn.closest('.pack-card')?.querySelector('.pack-card__keys-badge')?.textContent?.trim() || '';
        showToast(`🔑 Has seleccionado el ${packName} (${packKeys}) por ${packPrice}. ¡Contáctanos en Discord para completar tu compra!`, 5000);
      });
    });
  }

  /* ---- Micropagos: Plan selector (legacy) ---- */
  function initPlanButtons() {
    document.querySelectorAll('.plan-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        const planName = btn.closest('.plan-card')?.querySelector('.plan-name')?.textContent || 'Desconocido';
        const planPrice = btn.closest('.plan-card')?.querySelector('.plan-price__amount')?.textContent || '?';
        showToast(`🛍️ Seleccionaste el plan ${planName} por $${planPrice}. ¡Próximamente disponible!`, 4000);
      });
    });
  }

  /* ---- Init all ---- */
  function init() {
    initCopyButtons();
    initAccordion();
    initCommandSearch();
    initContactForm();
    initPlanButtons();
    initPackButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export showToast for use in other scripts
  window.CempaiCraft = { showToast };
})();
