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
    var anchorSelectors = ['.js-addtocart.btn-add-to-cart', '.js-addtocart:not(.js-quickshop-icon-add)', '.js-add-to-cart', '[data-js="add-to-cart"]', '.buy-button', '.product-form__submit'];
    var anchor = null;
    for (var i = 0; i < anchorSelectors.length; i++) {
      anchor = document.querySelector(anchorSelectors[i]);
      if (anchor) break;
    }
    if (!anchor) return;

    // Colores Simona
    var C = {
      ink:       '#2a2a2a',
      cream:     '#f7f1ea',
      sand:      '#efe6dc',
      clay:      '#e4d6ca',
      stone:     '#c9bab0',
      taupe:     '#70625f',
      mocha:     '#9a877f',
      blush:     '#fbbfaf',
      blushSoft: '#fdded5',
    };

    var FD = '"Red Hat Display", system-ui, sans-serif';
    var FT = '"Red Hat Text", "Red Hat Display", system-ui, sans-serif';

    var price         = data.price         ? '$' + Math.round(data.price).toLocaleString('es-AR')         : '';
    var priceTransfer = data.priceTransfer ? '$' + Math.round(data.priceTransfer).toLocaleString('es-AR') : '';
    var hasTransfer   = !!data.priceTransfer;
    var pct           = (hasTransfer && data.price) ? Math.round((1 - data.priceTransfer / data.price) * 100) : null;
    var savings       = (hasTransfer && data.price) ? Math.round(data.price - data.priceTransfer).toLocaleString('es-AR') : null;

    var midnight    = new Date(); midnight.setHours(24, 0, 0, 0);
    var countdownId = 'dante-cd-' + Date.now();

    var section = document.createElement('div');
    section.id  = 'dante-cro-section';
    section.style.cssText = 'font-family:' + FT + ';margin:0;';

    var html = [];

    // ── Bloque precio comparado (V2) ──────────────────────────────────────
    if (hasTransfer) {
      html.push(
        '<div style="display:flex;gap:2px;border-bottom:2px solid ' + C.cream + ';">',

          // Columna precio normal
          '<div style="flex:1;padding:16px 16px;background:' + C.clay + ';">',
            '<div style="font-family:' + FT + ';font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:' + C.taupe + ';margin-bottom:6px;">Precio normal</div>',
            '<div style="font-family:' + FD + ';font-weight:900;font-size:28px;letter-spacing:-.02em;line-height:1;color:' + C.stone + ';text-decoration:line-through;">' + price + '</div>',
            '<div style="font-family:' + FT + ';font-size:11px;color:' + C.mocha + ';margin-top:5px;">12 x $' + (data.price ? Math.round(data.price / 12).toLocaleString('es-AR') : '') + ' sin interés</div>',
          '</div>',

          // Columna transferencia
          '<div style="flex:1;padding:16px 16px;background:' + C.ink + ';">',
            '<div style="font-family:' + FT + ';font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:' + C.blush + ';margin-bottom:6px;">Transferencia</div>',
            '<div style="font-family:' + FD + ';font-weight:900;font-size:28px;letter-spacing:-.02em;line-height:1;color:' + C.cream + ';">' + priceTransfer + '</div>',
            '<div style="font-family:' + FT + ';font-size:11px;color:' + C.blushSoft + ';margin-top:5px;">Pago único · Más económico</div>',
            '<div style="display:inline-block;margin-top:10px;background:' + C.blush + ';color:' + C.ink + ';font-family:' + FT + ';font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 12px;">−' + (pct || '20') + '% OFF</div>',
          '</div>',

        '</div>'
      );
    }

    // ── Cuotas ────────────────────────────────────────────────────────────
    html.push(
      '<div style="background:' + C.cream + ';padding:12px 18px;display:flex;align-items:center;justify-content:space-between;border-left:3px solid ' + C.blush + ';border-bottom:2px solid ' + C.sand + ';">',
        '<div>',
          '<div style="font-family:' + FD + ';font-weight:700;font-size:14px;color:' + C.ink + ';">12 cuotas de $' + (data.price ? Math.round(data.price / 12).toLocaleString('es-AR') : '') + '</div>',
          '<div style="font-family:' + FT + ';font-size:11px;color:' + C.mocha + ';margin-top:2px;">Sin interés · Con tarjeta</div>',
        '</div>',
      '</div>'
    );

    // ── Urgencia + countdown ──────────────────────────────────────────────
    html.push(
      '<div style="background:' + C.ink + ';padding:12px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid ' + C.cream + ';">',
        '<div>',
          '<div style="font-family:' + FT + ';font-size:13px;color:' + C.cream + ';line-height:1.4;">⚡ Comprá hoy, llega <strong style="color:' + C.blush + ';">mañana</strong></div>',
          '<div style="font-family:' + FT + ';font-size:10px;color:' + C.mocha + ';margin-top:3px;">Envío flash · Solo CABA y GBA</div>',
        '</div>',
        '<div style="text-align:right;">',
          '<div style="font-family:' + FT + ';font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:' + C.taupe + ';">Quedan</div>',
          '<div id="' + countdownId + '" style="font-family:' + FD + ';font-weight:800;font-size:20px;color:' + C.cream + ';font-variant-numeric:tabular-nums;line-height:1.1;">--:--:--</div>',
        '</div>',
      '</div>'
    );

    // ── Social proof ──────────────────────────────────────────────────────
    html.push(
      '<div style="background:' + C.sand + ';display:flex;border-bottom:2px solid ' + C.cream + ';">',
        '<div style="flex:1;padding:12px 0;text-align:center;">',
          '<div style="font-family:' + FD + ';font-weight:800;font-size:16px;color:' + C.ink + ';">330k</div>',
          '<div style="font-family:' + FT + ';font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:' + C.mocha + ';margin-top:2px;">Ventas</div>',
        '</div>',
        '<div style="flex:1;padding:12px 0;text-align:center;border-left:1px solid ' + C.clay + ';">',
          '<div style="font-family:' + FD + ';font-weight:800;font-size:16px;color:' + C.ink + ';">60 días</div>',
          '<div style="font-family:' + FT + ';font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:' + C.mocha + ';margin-top:2px;">Cambios</div>',
        '</div>',
        '<div style="flex:1;padding:12px 0;text-align:center;border-left:1px solid ' + C.clay + ';">',
          '<div style="font-family:' + FD + ';font-weight:800;font-size:16px;color:' + C.ink + ';">4.9 ★</div>',
          '<div style="font-family:' + FT + ';font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:' + C.mocha + ';margin-top:2px;">Rating</div>',
        '</div>',
      '</div>'
    );

    // ── Envío gratis ──────────────────────────────────────────────────────
    html.push(
      '<div style="background:' + C.cream + ';padding:10px 18px;font-family:' + FT + ';font-size:12px;color:' + C.taupe + ';">',
        '🚚 &nbsp;<strong style="color:' + C.ink + ';">Envío gratis</strong> en compras mayores a $149.900',
      '</div>'
    );

    section.innerHTML = html.join('');
    anchor.parentNode.insertBefore(section, anchor);

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
