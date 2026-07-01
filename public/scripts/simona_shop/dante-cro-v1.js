// dante-cro-v1.js — EXP-001 CRO PDP Simona
// Producto: Sweater Acacia Negro (ID 344292868) — solo ese producto
// Trackea eventos + inyecta sección CRO en 50% del tráfico
// Rollback: borrar el script desde tn/scripts.py
(function () {
  'use strict';

  var EXPERIMENT        = 'cro_pdp_v1';
  var COOKIE_NAME       = 'dante_ab_v1';
  var COOKIE_DAYS       = 30;
  var TARGET_SLUG       = 'sweater-acacia-negro';  // solo activa en este producto

  // ── ENTRY POINT ──────────────────────────────────────────────────────────
  function init() {
    // Salir si no es la PDP del producto objetivo
    // window.__dante_preview = true lo bypasea (solo para preview local)
    if (!window.__dante_preview && window.location.href.indexOf(TARGET_SLUG) === -1) return;

    var data   = extractProductData();
    var bucket = abAssign();
    window.__danteData = data;

    track('dante_pdp_view', {
      dante_bucket:        bucket,
      dante_product_id:    data.id,
      dante_product_name:  data.name,
      dante_product_price: data.price,
    });

    setupListeners(data, bucket);

    if (bucket === 'test') {
      loadFonts();
      injectCRO(data);
    }
  }

  // ── PRODUCT DATA ─────────────────────────────────────────────────────────
  function extractProductData() {
    var data = { id: null, name: null, price: null, priceTransfer: null };

    // 1. Global LS de TN (fuente más confiable — tiene precio + descuento por método de pago)
    try {
      var variant = (window.LS && window.LS.variants && window.LS.variants[0])
                 || (window.LS && window.LS.activeVariant);
      if (variant) {
        data.id    = variant.product_id ? String(variant.product_id) : null;
        data.price = variant.price_number || null;
        // price_with_payment_discount_short = "$36.120" (descuento por transferencia)
        if (variant.price_with_payment_discount_short) {
          data.priceTransfer = parseFloat(
            variant.price_with_payment_discount_short.replace(/[^0-9,]/g, '').replace(',', '.')
          ) || null;
          // Si viene en formato argentino "36.120" (punto como miles), parsear correctamente
          var raw = variant.price_with_payment_discount_short.replace(/[^0-9.]/g, '');
          if (raw.indexOf('.') > -1 && raw.split('.').pop().length === 3) {
            data.priceTransfer = parseFloat(raw.replace('.', '')) || data.priceTransfer;
          }
        }
      }
      if (window.LS && window.LS.product) {
        data.name = window.LS.product.name || null;
      }
    } catch(e) {}

    // 2. Fallback: meta tag de precio
    if (!data.price) {
      try {
        var meta = document.querySelector('meta[property="product:price:amount"]');
        if (meta) data.price = parseFloat(meta.content) || null;
      } catch(e) {}
    }

    // 3. Fallback: DOM para precio transferencia
    if (!data.priceTransfer && data.price) {
      try {
        var allText = document.body.innerText || '';
        var match = allText.match(/\$\s*([\d.,]+)\s*por\s*Transferencia/i);
        if (match) {
          data.priceTransfer = parseFloat(match[1].replace(/\./g, '').replace(',', '.')) || null;
        }
      } catch(e) {}
    }

    return data;
  }

  // ── A/B ASSIGNMENT ───────────────────────────────────────────────────────
  function abAssign() {
    // Permite forzar bucket desde preview (window.__dante_bucket = 'test')
    // En producción esta variable no existe, se ignora.
    if (window.__dante_bucket === 'test' || window.__dante_bucket === 'control') {
      return window.__dante_bucket;
    }
    var bucket = getCookie(COOKIE_NAME);
    if (!bucket) {
      bucket = Math.random() < 0.5 ? 'test' : 'control';
      setCookie(COOKIE_NAME, bucket, COOKIE_DAYS);
    }
    return bucket;
  }

  // ── TRACKING ─────────────────────────────────────────────────────────────
  function track(eventName, extra) {
    window.dataLayer = window.dataLayer || [];
    var sessionId = sessionStorage.getItem('dante_sid');
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('dante_sid', sessionId);
    }
    var payload = Object.assign({
      event:            eventName,
      dante_experiment: EXPERIMENT,
      dante_session_id: sessionId,
      dante_ts:         Date.now(),
    }, extra || {});
    window.dataLayer.push(payload);
    console.debug('[dante-cro]', eventName, payload);
  }

  // ── FONTS ─────────────────────────────────────────────────────────────────
  function loadFonts() {
    if (document.getElementById('dante-fonts')) return;
    var link = document.createElement('link');
    link.id   = 'dante-fonts';
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;800;900&family=Red+Hat+Text:wght@400;500;700&display=swap';
    document.head.appendChild(link);
  }

  // ── CRO INJECTION ────────────────────────────────────────────────────────
  function injectCRO(data) {
    if (document.getElementById('dante-cro-section')) return;

    var anchorSelectors = ['.js-addtocart.btn-add-to-cart', '.js-addtocart:not(.js-quickshop-icon-add)', '.js-add-to-cart', '[data-js="add-to-cart"]', '.buy-button', '.product-form__submit'];
    var anchor = null;
    for (var i = 0; i < anchorSelectors.length; i++) {
      anchor = document.querySelector(anchorSelectors[i]);
      if (anchor) break;
    }
    if (!anchor) return;

    // Inyectar estilos con !important para ganarle al tema de Simona
    if (!document.getElementById('dante-cro-css')) {
      var css = document.createElement('style');
      css.id = 'dante-cro-css';
      css.textContent = [
        '#dante-cro-section{font-family:"Red Hat Text","Red Hat Display",system-ui,sans-serif!important;margin:0!important;}',
        '#dante-cro-section *{box-sizing:border-box!important;}',
        // Columna normal (clay)
        '#dante-cro-section .dc-eyebrow-n{color:#70625f!important;font-family:"Red Hat Text",system-ui!important;font-size:10px!important;font-weight:700!important;letter-spacing:.14em!important;text-transform:uppercase!important;margin-bottom:6px!important;}',
        '#dante-cro-section .dc-price-n{color:#c9bab0!important;font-family:"Red Hat Display",system-ui!important;font-weight:900!important;font-size:28px!important;letter-spacing:-.02em!important;line-height:1!important;text-decoration:line-through!important;}',
        '#dante-cro-section .dc-sub-n{color:#9a877f!important;font-size:11px!important;margin-top:5px!important;}',
        // Columna transferencia (ink)
        '#dante-cro-section .dc-eyebrow-t{color:#fbbfaf!important;font-family:"Red Hat Text",system-ui!important;font-size:10px!important;font-weight:700!important;letter-spacing:.14em!important;text-transform:uppercase!important;margin-bottom:6px!important;}',
        '#dante-cro-section .dc-price-t{color:#f7f1ea!important;font-family:"Red Hat Display",system-ui!important;font-weight:900!important;font-size:28px!important;letter-spacing:-.02em!important;line-height:1!important;}',
        '#dante-cro-section .dc-sub-t{color:#fdded5!important;font-size:11px!important;margin-top:5px!important;}',
        '#dante-cro-section .dc-badge{display:inline-block!important;margin-top:10px!important;background:#fbbfaf!important;color:#2a2a2a!important;font-size:11px!important;font-weight:700!important;letter-spacing:.06em!important;text-transform:uppercase!important;padding:4px 12px!important;}',
        // Cuotas
        '#dante-cro-section .dc-cuota-main{color:#2a2a2a!important;font-family:"Red Hat Display",system-ui!important;font-weight:700!important;font-size:14px!important;}',
        '#dante-cro-section .dc-cuota-sub{color:#9a877f!important;font-size:11px!important;margin-top:2px!important;}',
        // Urgencia
        '#dante-cro-section .dc-flash{color:#f7f1ea!important;font-size:13px!important;line-height:1.4!important;}',
        '#dante-cro-section .dc-flash strong{color:#fbbfaf!important;}',
        '#dante-cro-section .dc-flash-sub{color:#9a877f!important;font-size:10px!important;margin-top:3px!important;}',
        '#dante-cro-section .dc-cd-label{color:#70625f!important;font-size:10px!important;font-weight:700!important;letter-spacing:.12em!important;text-transform:uppercase!important;}',
        '#dante-cro-section .dc-cd-time{color:#f7f1ea!important;font-family:"Red Hat Display",system-ui!important;font-weight:800!important;font-size:20px!important;font-variant-numeric:tabular-nums!important;line-height:1.1!important;}',
        // Social proof
        '#dante-cro-section .dc-social-num{color:#2a2a2a!important;font-family:"Red Hat Display",system-ui!important;font-weight:800!important;font-size:16px!important;}',
        '#dante-cro-section .dc-social-label{color:#9a877f!important;font-size:10px!important;font-weight:700!important;letter-spacing:.12em!important;text-transform:uppercase!important;margin-top:2px!important;}',
        // Envío
        '#dante-cro-section .dc-ship{color:#70625f!important;font-size:12px!important;}',
        '#dante-cro-section .dc-ship strong{color:#2a2a2a!important;}',
      ].join('');
      document.head.appendChild(css);
    }

    var price         = data.price         ? '$' + Math.round(data.price).toLocaleString('es-AR')         : '';
    var priceTransfer = data.priceTransfer ? '$' + Math.round(data.priceTransfer).toLocaleString('es-AR') : '';
    var hasTransfer   = !!data.priceTransfer;
    var pct           = (hasTransfer && data.price) ? Math.round((1 - data.priceTransfer / data.price) * 100) : null;
    var cuota         = data.price ? Math.round(data.price / 12).toLocaleString('es-AR') : '';

    var midnight    = new Date(); midnight.setHours(24, 0, 0, 0);
    var countdownId = 'dante-cd-' + Date.now();

    var section = document.createElement('div');
    section.id  = 'dante-cro-section';

    var html = [];

    // ── Bloque precio comparado (V2) ──────────────────────────────────────
    if (hasTransfer) {
      html.push(
        '<div style="display:flex;gap:2px;border-bottom:2px solid #f7f1ea;">',
          '<div style="flex:1;padding:16px;background:#e4d6ca;">',
            '<div class="dc-eyebrow-n">Precio normal</div>',
            '<div class="dc-price-n">' + price + '</div>',
            '<div class="dc-sub-n">12 x $' + cuota + ' sin interés</div>',
          '</div>',
          '<div style="flex:1;padding:16px;background:#2a2a2a;">',
            '<div class="dc-eyebrow-t">Transferencia</div>',
            '<div class="dc-price-t">' + priceTransfer + '</div>',
            '<div class="dc-sub-t">Pago único · Más económico</div>',
            '<div class="dc-badge">−' + (pct || '20') + '% OFF</div>',
          '</div>',
        '</div>'
      );
    }

    // ── Cuotas ────────────────────────────────────────────────────────────
    html.push(
      '<div style="background:#f7f1ea;padding:12px 18px;border-left:3px solid #fbbfaf;border-bottom:2px solid #efe6dc;">',
        '<div class="dc-cuota-main">12 cuotas de $' + cuota + '</div>',
        '<div class="dc-cuota-sub">Sin interés · Con tarjeta</div>',
      '</div>'
    );

    // ── Urgencia + countdown ──────────────────────────────────────────────
    html.push(
      '<div style="background:#2a2a2a;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #f7f1ea;">',
        '<div>',
          '<div class="dc-flash">⚡ Comprá hoy, llega <strong>mañana</strong></div>',
          '<div class="dc-flash-sub">Envío flash · Solo CABA y GBA</div>',
        '</div>',
        '<div style="text-align:right;">',
          '<div class="dc-cd-label">Quedan</div>',
          '<div class="dc-cd-time" id="' + countdownId + '">--:--:--</div>',
        '</div>',
      '</div>'
    );

    // ── Social proof ──────────────────────────────────────────────────────
    html.push(
      '<div style="background:#efe6dc;display:flex;border-bottom:2px solid #f7f1ea;">',
        '<div style="flex:1;padding:12px 0;text-align:center;">',
          '<div class="dc-social-num">330k</div>',
          '<div class="dc-social-label">Ventas</div>',
        '</div>',
        '<div style="flex:1;padding:12px 0;text-align:center;border-left:1px solid #e4d6ca;">',
          '<div class="dc-social-num">60 días</div>',
          '<div class="dc-social-label">Cambios</div>',
        '</div>',
        '<div style="flex:1;padding:12px 0;text-align:center;border-left:1px solid #e4d6ca;">',
          '<div class="dc-social-num">4.9 ★</div>',
          '<div class="dc-social-label">Rating</div>',
        '</div>',
      '</div>'
    );

    // ── Envío gratis ──────────────────────────────────────────────────────
    html.push(
      '<div style="background:#f7f1ea;padding:10px 18px;">',
        '<span class="dc-ship">🚚 &nbsp;<strong>Envío gratis</strong> en compras mayores a $149.900</span>',
      '</div>'
    );

    section.innerHTML = html.join('');
    anchor.parentNode.insertBefore(section, anchor);

    // Forzar colores con setProperty — gana contra cualquier !important del tema
    function sc(sel, prop, val) {
      section.querySelectorAll(sel).forEach(function(el) {
        el.style.setProperty(prop, val, 'important');
      });
    }
    sc('.dc-eyebrow-n', 'color', '#70625f');
    sc('.dc-price-n',   'color', '#c9bab0');
    sc('.dc-price-n',   'text-decoration', 'line-through');
    sc('.dc-sub-n',     'color', '#9a877f');
    sc('.dc-eyebrow-t', 'color', '#fbbfaf');
    sc('.dc-price-t',   'color', '#f7f1ea');
    sc('.dc-sub-t',     'color', '#fdded5');
    sc('.dc-badge',     'color', '#2a2a2a');
    sc('.dc-cuota-main','color', '#2a2a2a');
    sc('.dc-cuota-sub', 'color', '#9a877f');
    sc('.dc-flash',     'color', '#f7f1ea');
    section.querySelectorAll('.dc-flash strong').forEach(function(el) {
      el.style.setProperty('color', '#fbbfaf', 'important');
    });
    sc('.dc-flash-sub', 'color', '#9a877f');
    sc('.dc-cd-label',  'color', '#70625f');
    sc('.dc-cd-time',   'color', '#f7f1ea');
    sc('.dc-social-num','color', '#2a2a2a');
    sc('.dc-social-label','color','#9a877f');
    sc('.dc-ship',      'color', '#70625f');
    section.querySelectorAll('.dc-ship strong').forEach(function(el) {
      el.style.setProperty('color', '#2a2a2a', 'important');
    });

    // Ocultar sección original de TN que el CRO reemplaza
    ['.js-product-payments-container', '.js-free-shipping-minimum-message'].forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        el.style.setProperty('display', 'none', 'important');
      });
    });

    // Countdown
    var cdEl = document.getElementById(countdownId);
    function tick() {
      var diff = Math.max(0, Math.floor((midnight - Date.now()) / 1000));
      var h = String(Math.floor(diff / 3600)).padStart(2, '0');
      var m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      var s = String(diff % 60).padStart(2, '0');
      if (cdEl) cdEl.textContent = h + ':' + m + ':' + s;
    }
    tick();
    setInterval(tick, 1000);

    // Tracking visibilidad
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            track('dante_cro_visible', {
              dante_bucket:        'test',
              dante_product_id:    data.id,
              dante_product_name:  data.name,
              dante_product_price: data.price,
            });
            obs.disconnect();
          }
        });
      }, { threshold: 0.5 });
      obs.observe(section);
    }
  }

  // ── LISTENERS ────────────────────────────────────────────────────────────
  function setupListeners(data, bucket) {
    var baseProps = {
      dante_bucket:        bucket,
      dante_product_id:    data.id,
      dante_product_name:  data.name,
      dante_product_price: data.price,
    };

    document.querySelectorAll('[data-variant], .js-product-variants input[type="radio"]').forEach(function(el) {
      el.addEventListener('change', function() {
        track('dante_variant_select', Object.assign({ dante_variant_value: this.value }, baseProps));
      });
      el.addEventListener('click', function() {
        track('dante_variant_select', Object.assign({ dante_variant_value: this.dataset.variant || this.value }, baseProps));
      });
    });

    ['.js-add-to-cart', '[data-action="add-to-cart"]', '.buy-button', '.product-form__submit'].forEach(function(sel) {
      var btn = document.querySelector(sel);
      if (btn) btn.addEventListener('click', function() { track('dante_add_to_cart', baseProps); }, { passive: true });
    });

    var startTime = Date.now();
    window.addEventListener('beforeunload', function() {
      track('dante_pdp_exit', Object.assign({ dante_time_on_page: Math.round((Date.now() - startTime) / 1000) }, baseProps));
    });
  }

  // ── COOKIE HELPERS ───────────────────────────────────────────────────────
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  // ── START ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
