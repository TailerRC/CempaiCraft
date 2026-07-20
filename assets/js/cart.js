/* =============================================
   CEMPAICRAFT — CART.JS
   Sistema de carrito con localStorage
   Sin almacenamiento en servidor, sin reload
   ============================================= */

(function () {
  'use strict';

  const CART_KEY   = 'cc_cart';
  const ORDER_KEY  = 'cc_order_pending';
  const SHEET_URL  = 'https://script.google.com/macros/s/AKfycby8YgzGTNVHuh7F036DNIejX1gQrta7odssuc80JGo9-rLcw32EOdYRZec7c6xYAos/exec';

  /* ─── Helpers de storage ───────────────────── */
  const Storage = {
    get(key) {
      try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch {}
    }
  };

  /* ─── API del carrito ──────────────────────── */
  const Cart = {
    getItems()       { return Storage.get(CART_KEY); },
    save(items)      { Storage.set(CART_KEY, items); Cart.updateBadge(); },
    getTotal()       { return Cart.getItems().reduce((s, i) => s + i.price, 0); },

    add(pack) {
      const items = Cart.getItems();
      /* Solo una unidad por tipo de pack */
      if (!items.find(i => i.id === pack.id)) {
        items.push(pack);
        Cart.save(items);
        UI.showToast(`<i class="fa-solid fa-check"></i> ${pack.name} añadido al carrito`);
      } else {
        UI.showToast(`<i class="fa-solid fa-circle-info"></i> Este pack ya está en tu carrito`);
      }
      Cart.updateBadge();
    },

    remove(packId) {
      const items = Cart.getItems().filter(i => i.id !== packId);
      Cart.save(items);
      Cart.updateBadge();
      UI.renderCartItems();
    },

    clear() {
      Storage.remove(CART_KEY);
      Cart.updateBadge();
    },

    updateBadge() {
      const count = Cart.getItems().length;
      document.querySelectorAll('#cart-badge').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
      });
    }
  };

  /* ─── UI helpers ───────────────────────────── */
  const UI = {
    showToast(html, duration = 3500) {
      let toast = document.getElementById('cc-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cc-toast';
        toast.className = 'cc-toast';
        document.body.appendChild(toast);
      }
      toast.innerHTML = html;
      toast.classList.add('cc-toast--show');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => toast.classList.remove('cc-toast--show'), duration);
    },

    /* ── Render lista de items del carrito ──── */
    renderCartItems() {
      const items = Cart.getItems();
      const list  = document.getElementById('cart-items-list');
      const empty = document.getElementById('cart-empty-msg');
      const footer = document.getElementById('cart-footer');
      if (!list) return;

      if (items.length === 0) {
        list.innerHTML = '';
        if (empty) empty.style.display = 'flex';
        if (footer) footer.style.display = 'none';
        return;
      }

      if (empty) empty.style.display = 'none';
      if (footer) footer.style.display = 'flex';

      list.innerHTML = items.map(item => `
        <div class="cart-item" id="cart-item-${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item__img" />
          <div class="cart-item__info">
            <span class="cart-item__name">${item.name}</span>
            <span class="cart-item__price">S/. ${item.price.toFixed(2)}</span>
          </div>
          <button class="cart-item__remove" onclick="window.CC_Cart.remove('${item.id}')" aria-label="Quitar ${item.name}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `).join('');

      const totalEl = document.getElementById('cart-total-amount');
      if (totalEl) totalEl.textContent = `S/. ${Cart.getTotal().toFixed(2)}`;
    },

    /* ── Modal principal ──────────────────────── */
    openCartModal() {
      UI.ensureModal();
      const modal = document.getElementById('cc-cart-modal');
      modal.classList.add('cc-modal--open');
      document.body.style.overflow = 'hidden';
      UI.showView('cart');
      Cart.updateBadge();
      UI.renderCartItems();
    },

    closeCartModal() {
      const modal = document.getElementById('cc-cart-modal');
      if (modal) modal.classList.remove('cc-modal--open');
      document.body.style.overflow = '';
    },

    showView(view) {
      /* view: 'cart' | 'checkout' | 'success' */
      ['cart', 'checkout', 'success'].forEach(v => {
        const el = document.getElementById(`cc-view-${v}`);
        if (el) el.style.display = v === view ? 'flex' : 'none';
      });
    },

    /* ── Calcular min datetime para entrega ──── */
    getMinDelivery(paymentTimeVal) {
      /* paymentTimeVal = "HH:MM" (hora hoy en que se pagó con Yape) */
      const now = new Date();
      let base = new Date();

      if (paymentTimeVal) {
        const [hh, mm] = paymentTimeVal.split(':').map(Number);
        base = new Date(now);
        base.setHours(hh, mm, 0, 0);
        /* Si la hora de pago ya pasó, asumir que fue hoy */
        if (base > now) base = now; /* Si el pago es "futuro" usamos now como fallback */
      }

      const minDelivery = new Date(base.getTime() + 8 * 60 * 60 * 1000);
      /* Formato datetime-local: YYYY-MM-DDTHH:MM */
      const pad = n => String(n).padStart(2, '0');
      return `${minDelivery.getFullYear()}-${pad(minDelivery.getMonth()+1)}-${pad(minDelivery.getDate())}T${pad(minDelivery.getHours())}:${pad(minDelivery.getMinutes())}`;
    },

    /* ── Inyectar modal en el DOM ─────────────── */
    ensureModal() {
      if (document.getElementById('cc-cart-modal')) return;

      const modal = document.createElement('div');
      modal.id = 'cc-cart-modal';
      modal.className = 'cc-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Carrito de compras');

      modal.innerHTML = `
        <div class="cc-modal__overlay" id="cc-modal-overlay"></div>
        <div class="cc-modal__panel">

          <!-- Header -->
          <div class="cc-modal__header">
            <div class="cc-modal__header-left">
              <i class="fa-solid fa-cart-shopping"></i>
              <span id="cc-modal-title">Mi Carrito</span>
            </div>
            <button class="cc-modal__close" id="cc-modal-close" aria-label="Cerrar carrito">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- VIEW: carrito ─────────────────── -->
          <div id="cc-view-cart" style="display:flex; flex-direction:column; flex:1; overflow:hidden;">
            <!-- Empty state -->
            <div id="cart-empty-msg" class="cc-empty">
              <i class="fa-solid fa-box-open"></i>
              <p>Tu carrito está vacío</p>
              <span>Elige un pack de llaves en la tienda</span>
            </div>
            <!-- Items -->
            <div id="cart-items-list" class="cc-items-list"></div>
            <!-- Footer -->
            <div id="cart-footer" class="cc-cart-footer" style="display:none;">
              <div class="cc-cart-footer__total">
                <span>Total:</span>
                <strong id="cart-total-amount">S/. 0.00</strong>
              </div>
              <button class="cc-btn cc-btn--primary" id="btn-proceed-checkout">
                <i class="fa-solid fa-money-bill-wave"></i>
                Proceder con Yape
              </button>
            </div>
          </div>

          <!-- VIEW: checkout ────────────────── -->
          <div id="cc-view-checkout" style="display:none; flex-direction:column; flex:1; overflow-y:auto;">
            <!-- Instrucciones Yape -->
            <div class="cc-yape-instructions">
              <div class="cc-yape-header">
                <i class="fa-solid fa-mobile-screen-button"></i>
                <div>
                  <h4>Paga con Yape</h4>
                  <p>Envía el monto exacto al número de CempaiCraft</p>
                </div>
              </div>
              <div class="cc-yape-number">
                <span class="cc-yape-number__label">Número Yape</span>
                <span class="cc-yape-number__value" id="cc-yape-phone">+51 XXX XXX XXX</span>
                <button class="cc-yape-copy" id="cc-copy-yape" aria-label="Copiar número">
                  <i class="fa-solid fa-copy"></i>
                </button>
              </div>
              <div class="cc-yape-amount">
                <span>Monto a pagar:</span>
                <strong id="cc-yape-total">S/. 0.00</strong>
              </div>
            </div>

            <!-- Formulario -->
            <form id="checkout-form" class="cc-checkout-form" novalidate>
              <p class="cc-checkout-form__subtitle">
                <i class="fa-solid fa-circle-info"></i>
                Completa los datos <strong>después</strong> de realizar el pago con Yape.
              </p>

              <div class="cc-form-group">
                <label class="cc-form-label" for="cf-username">
                  <i class="fa-solid fa-user"></i> Usuario de Minecraft
                </label>
                <input type="text" id="cf-username" name="username" class="cc-form-input"
                  placeholder="Tu nick exacto en el servidor" required autocomplete="off" />
              </div>

              <div class="cc-form-row">
                <div class="cc-form-group">
                  <label class="cc-form-label" for="cf-yape-op">
                    <i class="fa-solid fa-hashtag"></i> N.° de operación Yape
                  </label>
                  <input type="text" id="cf-yape-op" name="yape_operation" class="cc-form-input"
                    placeholder="Ej: 123456789" required autocomplete="off" inputmode="numeric" />
                </div>
                <div class="cc-form-group">
                  <label class="cc-form-label" for="cf-payment-time">
                    <i class="fa-regular fa-clock"></i> Hora del pago
                  </label>
                  <input type="time" id="cf-payment-time" name="payment_time" class="cc-form-input" required />
                </div>
              </div>

              <div class="cc-form-group">
                <label class="cc-form-label" for="cf-delivery-dt">
                  <i class="fa-solid fa-calendar-check"></i> Fecha y hora de entrega deseada
                </label>
                <input type="datetime-local" id="cf-delivery-dt" name="delivery_datetime" class="cc-form-input" required />
                <p class="cc-form-hint">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Mínimo 8 horas después del pago. Las llaves se entregan personalmente.
                </p>
              </div>

              <!-- Resumen de pedido -->
              <div class="cc-order-summary" id="cc-order-summary"></div>

              <div class="cc-checkout-actions">
                <button type="button" class="cc-btn cc-btn--ghost" id="btn-back-cart">
                  <i class="fa-solid fa-arrow-left"></i> Volver
                </button>
                <button type="submit" class="cc-btn cc-btn--primary" id="btn-confirm-order">
                  <i class="fa-solid fa-check"></i> Confirmar pedido
                </button>
              </div>
            </form>
          </div>

          <!-- VIEW: success ─────────────────── -->
          <div id="cc-view-success" style="display:none; flex-direction:column; flex:1; align-items:center; justify-content:center; padding: 2rem; text-align:center; gap:1rem;">
            <div class="cc-success-icon">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3 class="cc-success-title">¡Pedido registrado!</h3>
            <p class="cc-success-text">Tu pedido ha sido guardado. <strong>Las llaves se entregan personalmente</strong> en el horario que indicaste. El staff de CempaiCraft se comunicará contigo.</p>
            <div class="cc-success-detail" id="cc-success-detail"></div>
            <button class="cc-btn cc-btn--primary" id="btn-close-success">
              <i class="fa-solid fa-xmark"></i> Cerrar
            </button>
          </div>

        </div><!-- /panel -->
      `;

      document.body.appendChild(modal);

      /* ─ Eventos del modal ─ */
      document.getElementById('cc-modal-close').addEventListener('click', UI.closeCartModal);
      document.getElementById('cc-modal-overlay').addEventListener('click', UI.closeCartModal);

      /* Copiar número Yape */
      document.getElementById('cc-copy-yape').addEventListener('click', () => {
        const num = document.getElementById('cc-yape-phone').textContent.trim();
        navigator.clipboard.writeText(num).then(() => UI.showToast('<i class="fa-solid fa-check"></i> Número copiado'));
      });

      /* Proceder al checkout */
      document.getElementById('btn-proceed-checkout').addEventListener('click', () => {
        if (Cart.getItems().length === 0) return;
        /* Actualizar totales en vista checkout */
        const total = Cart.getTotal();
        const totalEl = document.getElementById('cc-yape-total');
        if (totalEl) totalEl.textContent = `S/. ${total.toFixed(2)}`;

        /* Resumen del pedido */
        const summary = document.getElementById('cc-order-summary');
        if (summary) {
          summary.innerHTML = `
            <h5><i class="fa-solid fa-receipt"></i> Resumen de tu pedido</h5>
            ${Cart.getItems().map(i => `<div class="cc-summary-row"><span>${i.name}</span><span>S/. ${i.price.toFixed(2)}</span></div>`).join('')}
            <div class="cc-summary-row cc-summary-row--total"><span>Total</span><span>S/. ${total.toFixed(2)}</span></div>
          `;
        }

        /* Actualizar min del datetime de entrega basado en ahora + 8h */
        const deliveryInput = document.getElementById('cf-delivery-dt');
        if (deliveryInput) {
          const minDt = UI.getMinDelivery(null);
          deliveryInput.min = minDt;
          deliveryInput.value = '';
        }

        document.getElementById('cc-modal-title').textContent = 'Finalizar compra';
        UI.showView('checkout');
      });

      /* Volver al carrito */
      document.getElementById('btn-back-cart').addEventListener('click', () => {
        document.getElementById('cc-modal-title').textContent = 'Mi Carrito';
        UI.showView('cart');
        UI.renderCartItems();
      });

      /* Actualizar min delivery cuando cambia hora de pago */
      document.getElementById('cf-payment-time').addEventListener('change', function () {
        const deliveryInput = document.getElementById('cf-delivery-dt');
        if (deliveryInput) {
          deliveryInput.min = UI.getMinDelivery(this.value);
          deliveryInput.value = '';
        }
      });

      /* Submit del formulario — async para enviar a Google Sheets */
      document.getElementById('checkout-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!UI.validateCheckout()) return;

        const username    = document.getElementById('cf-username').value.trim();
        const yapeOp      = document.getElementById('cf-yape-op').value.trim();
        const paymentTime = document.getElementById('cf-payment-time').value;
        const deliveryDt  = document.getElementById('cf-delivery-dt').value;
        const items       = Cart.getItems();
        const total       = Cart.getTotal();

        /* ── Estado de carga en el botón ── */
        const submitBtn = document.getElementById('btn-confirm-order');
        const originalHTML = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
        }

        /* ── Armar descripción de compra ("Pack Oro | Pack Plata") ── */
        const descripcion = items.map(i => `${i.name} (S/. ${i.price.toFixed(2)})`).join(' | ');

        /* ── Payload que va a la Google Sheet ── */
        const sheetData = {
          usuario:      username,
          operacion:    yapeOp,
          total:        `S/. ${total.toFixed(2)}`,
          horaPago:     paymentTime,
          fechaEntrega: deliveryDt,
          descripcion
        };

        /* ── Envío a Google Apps Script ── */
        try {
          await fetch(SHEET_URL, {
            method: 'POST',
            mode:   'no-cors',          /* CORS no requerido para el envío */
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sheetData)
          });
        } catch (err) {
          /* Error de red: avisamos pero NO bloqueamos — el pedido igual se guarda local */
          UI.showToast('<i class="fa-solid fa-triangle-exclamation"></i> Sin conexión. Tu pedido se guardó localmente.', 5000);
          console.warn('[CempaiCraft] Error al enviar a Google Sheets:', err);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
          }
        }

        /* ── Objeto completo del pedido (localStorage) ── */
        const order = {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          username,
          yapeOperation: yapeOp,
          paymentTime,
          deliveryDatetime: deliveryDt,
          items,
          total,
          descripcion
        };

        /* Guardar pedido en localStorage */
        Storage.set(ORDER_KEY, order);
        Cart.clear();
        UI.renderCartItems();

        /* Mostrar detalle del éxito */
        const fmtDt = new Date(deliveryDt).toLocaleString('es-PE', {
          weekday: 'long', day: 'numeric', month: 'long',
          hour: '2-digit', minute: '2-digit'
        });
        const detail = document.getElementById('cc-success-detail');
        if (detail) {
          detail.innerHTML = `
            <div class="cc-success-row"><i class="fa-solid fa-user"></i><span>Usuario: <strong>${username}</strong></span></div>
            <div class="cc-success-row"><i class="fa-solid fa-calendar-check"></i><span>Entrega el: <strong>${fmtDt}</strong></span></div>
            <div class="cc-success-row"><i class="fa-solid fa-coins"></i><span>Total: <strong>S/. ${total.toFixed(2)}</strong></span></div>
            <div class="cc-success-row"><i class="fa-solid fa-receipt"></i><span>Pedido: <strong>${descripcion}</strong></span></div>
          `;
        }

        document.getElementById('cc-modal-title').textContent = '\u00a1Listo!';
        UI.showView('success');
      });

      /* Cerrar desde success */
      document.getElementById('btn-close-success').addEventListener('click', () => {
        UI.closeCartModal();
        document.getElementById('cc-modal-title').textContent = 'Mi Carrito';
      });

      /* ESC para cerrar */
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') UI.closeCartModal();
      });
    },

    validateCheckout() {
      const username    = document.getElementById('cf-username').value.trim();
      const yapeOp      = document.getElementById('cf-yape-op').value.trim();
      const paymentTime = document.getElementById('cf-payment-time').value;
      const deliveryDt  = document.getElementById('cf-delivery-dt').value;

      if (!username) {
        UI.showToast('<i class="fa-solid fa-triangle-exclamation"></i> Ingresa tu usuario de Minecraft');
        document.getElementById('cf-username').focus();
        return false;
      }
      if (!yapeOp || !/^\d{6,12}$/.test(yapeOp)) {
        UI.showToast('<i class="fa-solid fa-triangle-exclamation"></i> Ingresa un número de operación Yape válido');
        document.getElementById('cf-yape-op').focus();
        return false;
      }
      if (!paymentTime) {
        UI.showToast('<i class="fa-solid fa-triangle-exclamation"></i> Indica la hora en que realizaste el pago');
        document.getElementById('cf-payment-time').focus();
        return false;
      }
      if (!deliveryDt) {
        UI.showToast('<i class="fa-solid fa-triangle-exclamation"></i> Selecciona una fecha y hora de entrega');
        document.getElementById('cf-delivery-dt').focus();
        return false;
      }

      /* Validar: entrega >= pago + 8h */
      const minDt = UI.getMinDelivery(paymentTime);
      if (deliveryDt < minDt) {
        UI.showToast('<i class="fa-solid fa-triangle-exclamation"></i> La entrega debe ser mínimo 8 horas después del pago');
        document.getElementById('cf-delivery-dt').focus();
        return false;
      }
      return true;
    }
  };

  /* ─── API pública ──────────────────────────── */
  window.CC_Cart = {
    add:   (pack) => Cart.add(pack),
    remove:(id)   => Cart.remove(id),
    open:  ()     => UI.openCartModal(),
    update:()     => Cart.updateBadge()
  };

  /* ─── CSS del modal (inyectado dinámicamente) ─ */
  function injectCartStyles() {
    if (document.getElementById('cc-cart-styles')) return;
    const style = document.createElement('style');
    style.id = 'cc-cart-styles';
    style.textContent = `
      /* ── Toast ─────────────────────────────── */
      .cc-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 99999;
        background: #1e293b;
        color: #f8fafc;
        padding: .75rem 1.25rem;
        border-radius: 12px;
        font-family: 'Outfit', sans-serif;
        font-size: .88rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: .5rem;
        box-shadow: 0 8px 32px rgba(0,0,0,.35);
        border-left: 4px solid #F5C518;
        transform: translateY(120px);
        opacity: 0;
        transition: all .35s cubic-bezier(.34,1.56,.64,1);
        pointer-events: none;
        max-width: 340px;
      }
      .cc-toast--show { transform: translateY(0); opacity: 1; pointer-events: all; }

      /* ── Modal overlay ──────────────────────── */
      .cc-modal {
        position: fixed;
        inset: 0;
        z-index: 9000;
        display: flex;
        align-items: stretch;
        justify-content: flex-end;
        pointer-events: none;
        visibility: hidden;
      }
      .cc-modal--open { pointer-events: all; visibility: visible; }

      .cc-modal__overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,.55);
        backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity .35s ease;
      }
      .cc-modal--open .cc-modal__overlay { opacity: 1; }

      .cc-modal__panel {
        position: relative;
        z-index: 1;
        width: 480px;
        max-width: 100vw;
        height: 100dvh;
        background: #fff;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform .4s cubic-bezier(.25,.46,.45,.94);
        overflow: hidden;
        box-shadow: -8px 0 40px rgba(0,0,0,.15);
      }
      .cc-modal--open .cc-modal__panel { transform: translateX(0); }

      /* ── Header ─────────────────────────────── */
      .cc-modal__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        flex-shrink: 0;
      }
      .cc-modal__header-left {
        display: flex;
        align-items: center;
        gap: .75rem;
        font-family: 'Outfit', sans-serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: #111827;
      }
      .cc-modal__header-left i { color: #F5C518; font-size: 1.2rem; }
      .cc-modal__close {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: #f3f4f6;
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #6b7280;
        font-size: .95rem;
        transition: all .2s;
      }
      .cc-modal__close:hover { background: #fee2e2; color: #dc2626; }

      /* ── Empty state ────────────────────────── */
      .cc-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: .75rem;
        color: #9ca3af;
        padding: 2rem;
        text-align: center;
      }
      .cc-empty i { font-size: 3rem; opacity: .5; }
      .cc-empty p { font-size: 1rem; font-weight: 600; color: #6b7280; margin: 0; }
      .cc-empty span { font-size: .85rem; }

      /* ── Items list ─────────────────────────── */
      .cc-items-list {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: .75rem;
      }
      .cart-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: .85rem 1rem;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        transition: all .2s;
      }
      .cart-item:hover { border-color: rgba(245,197,24,.4); box-shadow: 0 2px 8px rgba(245,197,24,.1); }
      .cart-item__img {
        width: 56px; height: 56px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .cart-item__info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
      .cart-item__name { font-size: .9rem; font-weight: 600; color: #111827; }
      .cart-item__price { font-size: .85rem; font-weight: 700; color: #F5C518; }
      .cart-item__remove {
        width: 30px; height: 30px;
        border-radius: 50%;
        background: #fee2e2;
        border: none;
        cursor: pointer;
        color: #dc2626;
        font-size: .8rem;
        display: flex; align-items: center; justify-content: center;
        transition: all .2s;
        flex-shrink: 0;
      }
      .cart-item__remove:hover { background: #dc2626; color: #fff; }

      /* ── Cart footer ────────────────────────── */
      .cc-cart-footer {
        flex-direction: column;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        border-top: 1px solid #e5e7eb;
        flex-shrink: 0;
        background: #fff;
      }
      .cc-cart-footer__total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.05rem;
        font-weight: 600;
        color: #111827;
      }
      .cc-cart-footer__total strong { font-size: 1.25rem; color: #F5C518; }

      /* ── Buttons ─────────────────────────────── */
      .cc-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .5rem;
        padding: .75rem 1.5rem;
        border-radius: 50px;
        font-family: 'Outfit', sans-serif;
        font-size: .92rem;
        font-weight: 700;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all .3s cubic-bezier(.34,1.56,.64,1);
        width: 100%;
        letter-spacing: .01em;
      }
      .cc-btn--primary {
        background: linear-gradient(135deg, #F5C518, #FFD93D);
        color: #111;
        box-shadow: 0 4px 16px rgba(245,197,24,.35);
      }
      .cc-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,197,24,.5); }
      .cc-btn--ghost {
        background: transparent;
        border-color: #e5e7eb;
        color: #374151;
        width: auto;
      }
      .cc-btn--ghost:hover { background: #f3f4f6; }

      /* ── Yape instructions ──────────────────── */
      .cc-view-checkout-inner { padding: 1.5rem; overflow-y: auto; flex: 1; }
      .cc-yape-instructions {
        background: linear-gradient(135deg, #fef3c7, #fff7e0);
        border: 1px solid rgba(245,197,24,.4);
        border-radius: 16px;
        padding: 1.25rem;
        margin: 1.25rem 1.5rem 0;
        display: flex;
        flex-direction: column;
        gap: .85rem;
        flex-shrink: 0;
      }
      .cc-yape-header {
        display: flex;
        align-items: center;
        gap: .85rem;
      }
      .cc-yape-header i { font-size: 1.8rem; color: #9333ea; }
      .cc-yape-header h4 { margin: 0; font-size: 1rem; font-weight: 700; color: #111; }
      .cc-yape-header p  { margin: 0; font-size: .8rem; color: #6b7280; }
      .cc-yape-number {
        display: flex;
        align-items: center;
        gap: .75rem;
        background: #fff;
        border: 1px solid rgba(245,197,24,.3);
        border-radius: 10px;
        padding: .75rem 1rem;
      }
      .cc-yape-number__label { font-size: .75rem; color: #9ca3af; text-transform: uppercase; letter-spacing: .06em; flex: 0 0 auto; }
      .cc-yape-number__value { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 700; color: #111; flex: 1; }
      .cc-yape-copy {
        width: 32px; height: 32px;
        border-radius: 8px;
        background: rgba(245,197,24,.15);
        border: 1px solid rgba(245,197,24,.3);
        cursor: pointer;
        color: #b45309;
        font-size: .85rem;
        display: flex; align-items: center; justify-content: center;
        transition: all .2s;
      }
      .cc-yape-copy:hover { background: #F5C518; color: #111; }
      .cc-yape-amount {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: .9rem;
        color: #374151;
        font-weight: 500;
      }
      .cc-yape-amount strong { font-size: 1.3rem; color: #059669; font-weight: 800; }

      /* ── Checkout form ──────────────────────── */
      .cc-checkout-form {
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .cc-checkout-form__subtitle {
        font-size: .82rem;
        color: #6b7280;
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
        padding: .6rem .85rem;
        display: flex;
        align-items: flex-start;
        gap: .5rem;
        margin: 0;
      }
      .cc-checkout-form__subtitle i { color: #0284c7; flex-shrink: 0; margin-top: 2px; }
      .cc-form-group { display: flex; flex-direction: column; gap: .35rem; }
      .cc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .85rem; }
      .cc-form-label {
        font-size: .78rem;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: .06em;
        display: flex;
        align-items: center;
        gap: .4rem;
      }
      .cc-form-label i { color: #F5C518; font-size: .85em; }
      .cc-form-input {
        width: 100%;
        padding: .65rem .9rem;
        border: 1.5px solid #e5e7eb;
        border-radius: 10px;
        font-family: 'Outfit', sans-serif;
        font-size: .9rem;
        color: #111;
        background: #fff;
        outline: none;
        transition: border-color .2s, box-shadow .2s;
      }
      .cc-form-input:focus { border-color: #F5C518; box-shadow: 0 0 0 3px rgba(245,197,24,.15); }
      .cc-form-hint {
        font-size: .75rem;
        color: #9ca3af;
        display: flex;
        align-items: flex-start;
        gap: .35rem;
        margin: 0;
      }
      .cc-form-hint i { color: #f59e0b; flex-shrink: 0; margin-top: 2px; }

      /* ── Order summary ──────────────────────── */
      .cc-order-summary {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: .5rem;
      }
      .cc-order-summary h5 {
        margin: 0 0 .5rem;
        font-size: .85rem;
        font-weight: 700;
        color: #374151;
        display: flex;
        align-items: center;
        gap: .5rem;
      }
      .cc-order-summary h5 i { color: #F5C518; }
      .cc-summary-row {
        display: flex;
        justify-content: space-between;
        font-size: .85rem;
        color: #6b7280;
      }
      .cc-summary-row--total {
        border-top: 1px solid #e5e7eb;
        padding-top: .5rem;
        margin-top: .25rem;
        font-weight: 700;
        color: #111;
      }

      .cc-checkout-actions { display: flex; gap: .75rem; }
      .cc-checkout-actions .cc-btn--ghost { flex: 0 0 auto; padding: .75rem 1.25rem; }
      .cc-checkout-actions .cc-btn--primary { flex: 1; }

      /* ── Success ────────────────────────────── */
      .cc-success-icon { font-size: 4rem; color: #10b981; animation: success-pop .5s cubic-bezier(.34,1.56,.64,1); }
      @keyframes success-pop { from { transform: scale(0); opacity:0; } to { transform: scale(1); opacity:1; } }
      .cc-success-title { font-size: 1.4rem; font-weight: 800; color: #111; margin: 0; }
      .cc-success-text { font-size: .9rem; color: #6b7280; margin: 0; max-width: 320px; line-height: 1.6; }
      .cc-success-detail {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: .5rem;
        width: 100%;
        max-width: 360px;
      }
      .cc-success-row { display: flex; align-items: center; gap: .6rem; font-size: .88rem; color: #374151; }
      .cc-success-row i { color: #10b981; width: 16px; text-align: center; flex-shrink: 0; }

      /* ── Responsive ─────────────────────────── */
      @media (max-width: 520px) {
        .cc-modal__panel { width: 100vw; }
        .cc-form-row { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── Init ─────────────────────────────────── */
  function init() {
    injectCartStyles();
    Cart.updateBadge();

    /* Delegar clicks en botones "Añadir al carrito" */
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-add-to-cart]');
      if (!btn) return;
      const pack = {
        id:    btn.dataset.packId,
        name:  btn.dataset.packName,
        price: parseFloat(btn.dataset.packPrice),
        image: btn.dataset.packImage || ''
      };
      CC_Cart.add(pack);
    });

    /* Abrir modal al hacer click en el ícono del carrito */
    document.addEventListener('click', e => {
      if (e.target.closest('#navbar-cart-btn')) {
        UI.openCartModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
