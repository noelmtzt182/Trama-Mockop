(function () {
  'use strict';

  var T = window.TRAMA;
  var BRANDS = T.BRANDS, PRODUCTS = T.PRODUCTS, CATS = T.CATS;

  var app = document.getElementById('app');
  var countEl = document.getElementById('cart-count');
  var toastEl = document.getElementById('toast');
  var ai = document.getElementById('ai');
  var aiLog = document.getElementById('ai-log');
  var aiSugs = document.getElementById('ai-sugs');
  var aiInput = document.getElementById('ai-input');
  var money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function brandOf(id) { return BRANDS.filter(function (b) { return b.id === id; })[0]; }
  function productOf(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function optLabel(cat) {
    return { 'Moda': 'Talla', 'Joyería': 'Medida', 'Mascotas': 'Tamaño', 'Alimentos': 'Presentación' }[cat] || 'Opción';
  }

  var ICONS = {
    'Moda': '<path d="M30 20 42 14Q50 24 58 14L70 20 88 36 78 46 70 40V84H30V40L22 46 12 36Z"/>',
    'Accesorios': '<path d="M22 38H78L84 86H16Z"/><path d="M36 38V30a14 14 0 0 1 28 0V38" fill="none" stroke="currentColor" stroke-width="6"/>',
    'Joyería': '<circle cx="50" cy="64" r="22" fill="none" stroke="currentColor" stroke-width="7"/><path d="M50 18 61 29 50 40 39 29Z"/>',
    'Mascotas': '<ellipse cx="50" cy="68" rx="19" ry="15"/><circle cx="24" cy="48" r="8"/><circle cx="40" cy="32" r="8"/><circle cx="60" cy="32" r="8"/><circle cx="76" cy="48" r="8"/>',
    'Alimentos': '<path d="M32 16H68V28H32Z"/><path d="M28 33H72V84Q72 90 66 90H34Q28 90 28 84Z"/>',
    'Hogar': '<path d="M26 58H74L68 90H32Z"/><path d="M50 58V36" fill="none" stroke="currentColor" stroke-width="5"/><path d="M50 46Q34 44 30 28Q46 28 50 46Z"/><path d="M50 42Q64 40 70 24Q54 24 50 42Z"/>'
  };
  var SPARK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';

  function art(p) {
    return '<div class="ph" style="background:' + p.tone + '" role="img" aria-label="Imagen de ejemplo: ' + esc(p.name) + '">' +
      '<svg viewBox="0 0 100 100" fill="currentColor" style="color:rgba(27,26,23,.38)" aria-hidden="true">' + ICONS[p.cat] + '</svg></div>';
  }

  /* ---------- Búsqueda local y modo demo de la IA ---------- */
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var STOP = 'de la el los las un una unos unas para por con sin que mi mis tu tus su y o en a al del lo me te se es son algo busco buscando quiero necesito quisiera tengo hay como cual cuales menos mas muy bien ver dame dime pesos mxn'.split(' ');
  var SYN = {
    mama: 'regalo mujer', madre: 'regalo mujer', mami: 'regalo mujer', amiga: 'regalo mujer', novia: 'regalo mujer', hermana: 'regalo mujer',
    papa: 'regalo hombre', padre: 'regalo hombre', amigo: 'regalo hombre', novio: 'regalo hombre', hermano: 'regalo hombre',
    picoso: 'picante salsa', picosa: 'picante salsa', joyas: 'joya', joyeria: 'joya', ropa: 'camisa playera',
    comida: 'botana dulce salsa', antojo: 'botana dulce', mascota: 'perro gato', mascotas: 'perro gato',
    cachorro: 'perro', michi: 'gato', decorar: 'decoracion', casa: 'decoracion vela maceta', hogar: 'decoracion vela maceta'
  };

  function tokens(q) {
    var out = [];
    norm(q).replace(/[^a-z0-9ñ ]/g, ' ').split(/\s+/).forEach(function (w) {
      if (w.length < 3 || /^\d+$/.test(w) || STOP.indexOf(w) !== -1) return;
      var list = [w].concat(SYN[w] ? SYN[w].split(' ') : []);
      list.forEach(function (t) {
        if (t.length > 3 && /s$/.test(t)) t = t.slice(0, -1);
        if (out.indexOf(t) === -1) out.push(t);
      });
    });
    return out;
  }
  function parseBudget(q) {
    var m = norm(q).match(/(?:menos de|hasta|max(?:imo)?|presupuesto(?: de)?|\$)\s*(\d{2,5})|(\d{2,5})\s*(?:pesos|mxn)/);
    return m ? Number(m[1] || m[2]) : 0;
  }
  function hay(p) {
    var b = brandOf(p.brand);
    return norm([p.name, p.cat, b.name, b.city, p.tags].join(' '));
  }
  function search(q, budget) {
    var toks = tokens(q);
    if (!toks.length) return [];
    return PRODUCTS.map(function (p) {
      var h = hay(p);
      var s = toks.reduce(function (a, t) { return a + (h.indexOf(t) !== -1 ? 1 : 0); }, 0);
      return { p: p, s: s };
    }).filter(function (x) { return x.s > 0 && (!budget || x.p.price <= budget); })
      .sort(function (a, b) { return b.s - a.s || a.p.price - b.p.price; })
      .map(function (x) { return x.p; });
  }

  function localShop(q) {
    var budget = parseBudget(q);
    var ids = search(q, budget).slice(0, 4).map(function (p) { return p.id; });
    var reply;
    if (ids.length) {
      reply = 'Encontré ' + ids.length + (ids.length === 1 ? ' opción' : ' opciones') + (budget ? ' de hasta ' + money.format(budget) : '') + '. Échales un ojo:';
    } else if (budget && search(q, 0).length) {
      reply = 'Con ese presupuesto no encontré algo exacto. Prueba subiendo un poco el monto o cuéntame otra idea.';
    } else {
      reply = 'No encontré algo exacto. Cuéntame para quién es o prueba con una categoría: ' + CATS.join(', ') + '.';
    }
    return { reply: reply, ids: ids, demo: true };
  }

  function localListing(txt) {
    var clean = txt.trim().replace(/\s+/g, ' ');
    var first = clean.split(/[.,;\n]/)[0].trim();
    var top = search(clean, 0)[0];
    return {
      title: (first.charAt(0).toUpperCase() + first.slice(1)).slice(0, 60),
      description: clean.slice(0, 300),
      category: top ? top.cat : 'Otro',
      tags: tokens(clean).slice(0, 5),
      photoTips: ['Usa luz natural, cerca de una ventana.', 'Toma una foto de frente y otra en uso o con algo que dé escala.'],
      missing: ['Precio', 'Opciones (tallas, tamaños o presentaciones)', 'Tiempo de preparación y entrega'],
      demo: true
    };
  }

  async function callIA(payload) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 25000);
    try {
      var r = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      if (!r.ok) throw new Error('http ' + r.status);
      return await r.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------- Carrito y avisos ---------- */
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('trama-cart') || '[]'); } catch (e) { cart = []; }
  cart = cart.filter(function (l) { return l && productOf(l.id); });

  function saveCart(bump) {
    try { localStorage.setItem('trama-cart', JSON.stringify(cart)); } catch (e) { /* ignorar */ }
    var n = cart.reduce(function (a, l) { return a + l.qty; }, 0);
    countEl.textContent = n;
    countEl.hidden = n === 0;
    var c2 = document.getElementById('cart-count2');
    if (c2) { c2.textContent = n; c2.hidden = n === 0; }
    if (bump) {
      countEl.classList.remove('bump');
      void countEl.offsetWidth;
      countEl.classList.add('bump');
    }
  }
  function addToCart(id, size) {
    var f = cart.filter(function (l) { return l.id === id && l.size === size; })[0];
    if (f) f.qty += 1; else cart.push({ id: id, size: size, qty: 1 });
    saveCart(true);
  }

  var toastTimer;
  function toast(text, linkText, href) {
    toastEl.innerHTML = '<span>' + esc(text) + '</span>' + (linkText ? '<a href="' + href + '">' + esc(linkText) + '</a>' : '');
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 4000);
  }

  /* ---------- Vistas ---------- */
  function card(p) {
    var b = brandOf(p.brand);
    return '<a class="card" href="#/producto/' + p.id + '">' + art(p) +
      '<div class="brand">' + esc(b.name) + ' · ' + esc(b.city) + '</div><div class="name">' + esc(p.name) + '</div>' +
      '<div class="price">' + money.format(p.price) + '</div></a>';
  }

  var PROMPTS = [
    'Un regalo para mi mamá, menos de $500',
    'Algo para consentir a mi perro',
    'Algo picoso hecho en México',
    'Ideas para decorar mi casa'
  ];

  function vHome() {
    var hero = ['p1', 'p13', 'p11'].map(function (id) { return art(productOf(id)); }).join('');
    var prompts = PROMPTS.map(function (t) { return '<button type="button" class="prompt" data-open-ai data-prompt="' + esc(t) + '">' + esc(t) + '</button>'; }).join('');
    var tiles = CATS.map(function (c) {
      var n = PRODUCTS.filter(function (p) { return p.cat === c; });
      return '<a class="tile" style="background:' + n[0].tone + '" href="#/catalogo?cat=' + encodeURIComponent(c) + '">' +
        '<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">' + ICONS[c] + '</svg>' +
        '<div><strong>' + c + '</strong><br><span>' + n.length + ' productos</span></div></a>';
    }).join('');
    var feat = ['p1', 'p10', 'p13', 'p4', 'p16', 'p7', 'p11', 'p14'].map(function (id) { return card(productOf(id)); }).join('');
    var brands = BRANDS.map(function (b) {
      return '<a class="brand-card" href="#/marca/' + b.id + '"><div class="mono" style="background:' + b.color + '">' + esc(b.name.charAt(0)) + '</div>' +
        '<h3>' + esc(b.name) + '</h3><div class="note">' + esc(b.city) + '</div><p>' + esc(b.bio) + '</p></a>';
    }).join('');
    var vIcon = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
    return '<section class="hero"><div class="hero-copy"><span class="eyebrow">Marketplace de emprendedores</span>' +
      '<h1>Todo lo que crean los emprendedores, en un solo lugar.</h1>' +
      '<p>Moda, joyería, mascotas, alimentos y más. Cuéntale a Trama IA qué buscas y te ayuda a elegir.</p>' +
      '<form class="ask" id="hero-ask"><label class="sr" for="hero-q">¿Qué estás buscando?</label>' +
      '<input id="hero-q" maxlength="300" autocomplete="off" placeholder="¿Qué buscas? Ej. regalo para mi mamá"><button class="btn primary" type="submit">Preguntar</button></form>' +
      '<div class="prompts">' + prompts + '</div></div>' +
      '<div class="hero-art" aria-hidden="true">' + hero + '</div></section>' +
      '<section class="section"><div class="section-head"><h2>Compra por categoría</h2></div><div class="tiles">' + tiles + '</div></section>' +
      '<section class="section"><div class="section-head"><h2>Para empezar</h2><a class="link" href="#/catalogo">Ver todo</a></div><div class="grid">' + feat + '</div></section>' +
      '<section class="section"><div class="values">' +
      '<div class="value">' + vIcon('<path d="M4 20c0-4 3-6 8-6s8 2 8 6"/><circle cx="12" cy="8" r="4"/>') + '<h3>Directo de quien lo hace</h3><p>Cada producto tiene una marca y una persona detrás.</p></div>' +
      '<div class="value">' + vIcon('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>') + '<h3>Un asistente que te ayuda</h3><p>Dile para quién es y cuánto quieres gastar. Trama IA te propone opciones.</p></div>' +
      '<div class="value">' + vIcon('<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.800 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>') + '<h3>Marcas de tu región</h3><p>Descubre quién hace qué cerca de ti.</p></div></div></section>' +
      '<section class="section"><div class="section-head"><h2>Marcas</h2></div><div class="brands">' + brands + '</div></section>' +
      '<section class="cta"><h2>¿Tienes una marca?</h2><p>Abre tu tienda en Trama. Nuestra IA te arma la ficha de tu producto en segundos.</p><a class="btn" href="#/vender">Quiero vender</a></section>';
  }

  function hashQ() { return new URLSearchParams(location.hash.split('?')[1] || ''); }
  function setHash(path, q) { var s = q.toString(); location.hash = '#/' + path + (s ? '?' + s : ''); }

  function vCatalog(q) {
    var cat = q.get('cat') || '', marca = q.get('marca') || '', sort = q.get('orden') || '';
    var list = PRODUCTS.filter(function (p) { return (!cat || p.cat === cat) && (!marca || p.brand === marca); });
    if (sort === 'menor') list.sort(function (a, b) { return a.price - b.price; });
    if (sort === 'mayor') list.sort(function (a, b) { return b.price - a.price; });
    var chips = ['Todo'].concat(CATS).map(function (c) {
      var on = (c === 'Todo' && !cat) || c === cat;
      var qq = new URLSearchParams(q.toString());
      if (c === 'Todo') qq.delete('cat'); else qq.set('cat', c);
      var s = qq.toString();
      return '<a class="chip" href="#/catalogo' + (s ? '?' + s : '') + '"' + (on ? ' aria-current="true"' : '') + '>' + c + '</a>';
    }).join('');
    var brandOpts = '<option value="">Todas</option>' + BRANDS.map(function (b) {
      return '<option value="' + b.id + '"' + (marca === b.id ? ' selected' : '') + '>' + esc(b.name) + '</option>';
    }).join('');
    return '<h1 class="page-title">Catálogo</h1><div class="toolbar"><div class="chips">' + chips + '</div></div>' +
      '<div class="toolbar" style="margin-top:0"><p class="note">' + list.length + ' productos</p><div class="filters">' +
      '<label>Marca <select data-q="marca">' + brandOpts + '</select></label>' +
      '<label>Ordenar <select data-q="orden"><option value="">Recomendado</option><option value="menor"' + (sort === 'menor' ? ' selected' : '') + '>Precio: menor a mayor</option>' +
      '<option value="mayor"' + (sort === 'mayor' ? ' selected' : '') + '>Precio: mayor a menor</option></select></label></div></div>' +
      (list.length ? '<div class="grid">' + list.map(card).join('') + '</div>' : '<div class="empty"><p class="muted">No hay productos con esos filtros.</p><a class="btn" href="#/catalogo">Quitar filtros</a></div>');
  }

  function vSearch(q) {
    var term = (q.get('q') || '').trim().slice(0, 80);
    var res = term ? search(term, 0) : [];
    if (!res.length) {
      return '<div class="empty"><h1 class="page-title">Sin resultados' + (term ? ' para “' + esc(term) + '”' : '') + '</h1>' +
        '<p class="muted">Prueba con otra palabra o deja que Trama IA te ayude a encontrarlo.</p>' +
        '<button class="btn ai" data-open-ai data-prompt="' + esc(term) + '">' + SPARK + ' Preguntar a Trama IA</button></div>';
    }
    return '<h1 class="page-title">Resultados para “' + esc(term) + '”</h1><p class="note" style="margin:6px 0 20px">' + res.length + ' productos</p><div class="grid">' + res.map(card).join('') + '</div>';
  }

  function vProduct(id) {
    var p = productOf(id);
    if (!p) return vNotFound();
    var b = brandOf(p.brand);
    var sizes = p.sizes.map(function (s) {
      return '<label class="size"><input type="radio" name="size" value="' + esc(s) + '"' + (p.sizes.length === 1 ? ' checked' : '') + '><span>' + esc(s) + '</span></label>';
    }).join('');
    var others = PRODUCTS.filter(function (x) { return x.brand === b.id && x.id !== p.id; });
    return '<nav class="crumbs" aria-label="Ruta"><a href="#/">Inicio</a> / <a href="#/catalogo?cat=' + encodeURIComponent(p.cat) + '">' + p.cat + '</a></nav>' +
      '<div class="pdp">' + art(p) + '<div class="pdp-info">' +
      '<a class="link" href="#/marca/' + b.id + '">' + esc(b.name) + ' · ' + esc(b.city) + '</a>' +
      '<h1 class="page-title">' + esc(p.name) + '</h1><div class="pdp-price">' + money.format(p.price) + '</div>' +
      '<fieldset class="sizes"><legend>' + optLabel(p.cat) + '</legend>' + sizes + '</fieldset>' +
      '<div id="msg" class="error" role="alert"></div>' +
      '<div class="buybar"><div class="bb-price">' + money.format(p.price) + '</div><button class="btn primary" data-add="' + p.id + '">Agregar al carrito</button></div>' +
      '<button class="btn ai" data-open-ai data-prompt="' + esc('Me gusta "' + p.name + '". ¿Qué otras cosas combinan con esto?') + '">' + SPARK + ' ¿Qué combina con esto?</button>' +
      '<ul class="perks"><li>Hecho por ' + esc(b.name) + ' en ' + esc(b.city) + '</li><li>Envío y devoluciones: [por definir]</li></ul></div></div>' +
      (others.length ? '<section class="section"><div class="section-head"><h2>Más de ' + esc(b.name) + '</h2></div><div class="grid">' + others.map(card).join('') + '</div></section>' : '');
  }

  function vBrand(id) {
    var b = brandOf(id);
    if (!b) return vNotFound();
    return '<div class="brand-head"><div class="mono" style="background:' + b.color + '">' + esc(b.name.charAt(0)) + '</div>' +
      '<div><h1 class="page-title">' + esc(b.name) + '</h1><div class="note">' + esc(b.city) + '</div></div></div>' +
      '<p class="muted" style="max-width:56ch;margin:10px 0 26px">' + esc(b.bio) + '</p><div class="grid">' +
      PRODUCTS.filter(function (p) { return p.brand === id; }).map(card).join('') + '</div>';
  }

  function vCart() {
    if (!cart.length) {
      return '<div class="empty"><h1 class="page-title">Tu carrito está vacío</h1><p class="muted">Agrega algo del catálogo.</p><a class="btn primary" href="#/catalogo">Ver catálogo</a></div>';
    }
    var sub = 0;
    var lines = cart.map(function (l, i) {
      var p = productOf(l.id);
      sub += p.price * l.qty;
      return '<div class="line">' + art(p) + '<div><a href="#/producto/' + p.id + '" style="text-decoration:none;font-weight:500">' + esc(p.name) + '</a>' +
        '<div class="note">' + esc(brandOf(p.brand).name) + ' · ' + optLabel(p.cat) + ' ' + esc(l.size) + '</div>' +
        '<div class="qty"><button aria-label="Menos" data-dec="' + i + '">−</button><output>' + l.qty + '</output><button aria-label="Más" data-inc="' + i + '">+</button>' +
        '<button class="rm" data-rm="' + i + '">Quitar</button></div></div><strong>' + money.format(p.price * l.qty) + '</strong></div>';
    }).join('');
    return '<h1 class="page-title" style="margin-bottom:12px">Carrito</h1><div class="cart"><div>' + lines + '</div>' +
      '<aside class="summary" aria-label="Resumen"><div class="row"><span>Subtotal</span><span>' + money.format(sub) + '</span></div>' +
      '<div class="row note"><span>Envío</span><span>[por definir]</span></div>' +
      '<div class="row total"><span>Total</span><span>' + money.format(sub) + '</span></div>' +
      '<button class="btn primary" disabled>Pagar (próximamente)</button><p class="note">Esto es un mockup: aún no hay pagos.</p></aside></div>';
  }

  function vSell() {
    var opts = CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('');
    return '<div class="sell"><div class="sell-left"><span class="eyebrow">Para emprendedores</span>' +
      '<h1 style="font-size:clamp(2rem,5vw,2.6rem)">Vende tu producto en Trama</h1>' +
      '<p class="muted">Estamos reuniendo a las primeras marcas. Prueba la IA y déjanos tus datos para contactarte.</p>' +
      '<ul class="perks"><li>Perfil de marca propio</li><li>Catálogo y pedidos en un solo lugar</li><li>Pagos y envíos integrados (en desarrollo)</li><li>Comisión: [por definir]</li></ul>' +
      '<section class="ai-box" aria-labelledby="ai-box-t"><h2 id="ai-box-t">' + SPARK + ' Crea tu ficha con IA</h2>' +
      '<p class="note">Cuéntanos en una frase qué vendes. Te armamos un borrador del título, la descripción y las etiquetas.</p>' +
      '<form id="listing-form"><div class="field"><label for="l-txt">¿Qué vendes?</label>' +
      '<textarea id="l-txt" name="txt" maxlength="500" placeholder="Ej. Salsa macha de chile morita que preparo en casa, frasco de 220 ml"></textarea></div>' +
      '<div style="margin-top:12px"><button class="btn primary" type="submit">Generar ficha</button></div></form>' +
      '<div id="listing-out" aria-live="polite"></div></section></div>' +
      '<form class="card-form" id="sell-form" novalidate><h2 style="font-size:1.25rem">Solicita tu lugar</h2><div class="two">' +
      '<div class="field"><label for="f-marca">Nombre de tu marca</label><input id="f-marca" name="marca" required autocomplete="organization"></div>' +
      '<div class="field"><label for="f-ciudad">Ciudad</label><input id="f-ciudad" name="ciudad" required autocomplete="address-level2"></div></div>' +
      '<div class="two"><div class="field"><label for="f-cat">¿Qué vendes?</label><select id="f-cat" name="cat">' + opts + '<option>Otro</option></select></div>' +
      '<div class="field"><label for="f-ig">Instagram</label><input id="f-ig" name="ig" placeholder="@tumarca"></div></div>' +
      '<div class="field"><label for="f-mail">Correo</label><input id="f-mail" name="mail" type="email" required autocomplete="email"></div>' +
      '<div id="sell-msg" role="alert"></div><button class="btn primary" type="submit">Enviar solicitud</button></form></div>';
  }

  function vNotFound() {
    return '<div class="empty"><h1 class="page-title">No encontramos esa página</h1><a class="btn primary" href="#/">Volver al inicio</a></div>';
  }

  /* ---------- Router ---------- */
  function route() {
    var raw = location.hash.replace(/^#\/?/, '');
    var parts = raw.split('?');
    var seg = parts[0].split('/');
    var q = new URLSearchParams(parts[1] || '');
    var html;
    switch (seg[0]) {
      case '': html = vHome(); break;
      case 'catalogo': html = vCatalog(q); break;
      case 'buscar': html = vSearch(q); break;
      case 'producto': html = vProduct(seg[1]); break;
      case 'marca': html = vBrand(seg[1]); break;
      case 'carrito': html = vCart(); break;
      case 'vender': html = vSell(); break;
      default: html = vNotFound();
    }
    app.innerHTML = html;
    document.body.classList.toggle('has-buybar', seg[0] === 'producto' && !!productOf(seg[1]));
    var tabs = document.querySelectorAll('.tabbar [data-tab]');
    var cur = seg[0] === 'buscar' || seg[0] === 'marca' || seg[0] === 'producto' ? 'catalogo' : seg[0];
    Array.prototype.forEach.call(tabs, function (t) {
      if (t.getAttribute('data-tab') === cur) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  /* ---------- Asistente Trama IA ---------- */
  var aiHistory = [], aiBusy = false, demoNoted = false;

  function mini(id) {
    var p = productOf(id);
    if (!p) return '';
    return '<a class="mini" href="#/producto/' + p.id + '">' + art(p) +
      '<div><b>' + esc(p.name) + '</b><small>' + esc(brandOf(p.brand).name) + '</small></div><strong>' + money.format(p.price) + '</strong></a>';
  }
  function bubble(role, text) {
    var d = document.createElement('div');
    d.className = 'msg ' + (role === 'user' ? 'me' : 'bot');
    d.textContent = text;
    aiLog.appendChild(d);
    aiLog.scrollTop = aiLog.scrollHeight;
    return d;
  }
  function openAssistant(prefill) {
    if (typeof ai.showModal === 'function') { if (!ai.open) ai.showModal(); } else ai.setAttribute('open', '');
    if (!aiLog.childNodes.length) {
      bubble('bot', 'Hola, soy Trama IA. Cuéntame qué buscas, para quién es y cuánto quieres gastar, y te recomiendo opciones de nuestras marcas.');
      aiSugs.innerHTML = PROMPTS.map(function (t) { return '<button type="button" class="prompt" data-sug="' + esc(t) + '">' + esc(t) + '</button>'; }).join('');
    }
    if (prefill && prefill.trim()) sendAI(prefill); else aiInput.focus();
  }
  async function sendAI(text) {
    text = String(text || '').trim().slice(0, 300);
    if (!text || aiBusy) return;
    aiBusy = true;
    aiSugs.hidden = true;
    bubble('user', text);
    var pending = bubble('bot', 'Buscando opciones…');
    pending.classList.add('typing');
    var out, demo = false;
    try {
      out = await callIA({ mode: 'shop', message: text, history: aiHistory.slice(-6) });
    } catch (e) {
      out = localShop(text);
      demo = true;
    }
    var reply = String((out && out.reply) || 'Aquí tienes algunas ideas:').slice(0, 600);
    var ids = (Array.isArray(out && out.ids) ? out.ids : []).filter(function (id) { return productOf(id); }).slice(0, 4);
    pending.classList.remove('typing');
    pending.textContent = reply;
    if (ids.length) {
      var wrap = document.createElement('div');
      wrap.className = 'minis';
      wrap.innerHTML = ids.map(mini).join('');
      aiLog.appendChild(wrap);
    }
    if (demo && !demoNoted) {
      demoNoted = true;
      var n = document.createElement('div');
      n.className = 'ai-note';
      n.textContent = 'Modo demo: busco por palabras clave. Con la IA activada en el servidor, Trama IA entiende frases completas.';
      aiLog.appendChild(n);
    }
    aiHistory.push({ role: 'user', content: text }, { role: 'assistant', content: reply });
    aiLog.scrollTop = aiLog.scrollHeight;
    aiBusy = false;
    aiInput.focus();
  }

  /* ---------- Ficha con IA (vendedores) ---------- */
  function cleanListing(d) {
    var s = function (v, n) { return typeof v === 'string' ? v.trim().slice(0, n) : ''; };
    var l = function (v, n, len) { return Array.isArray(v) ? v.map(function (x) { return s(x, len); }).filter(Boolean).slice(0, n) : []; };
    return {
      title: s(d.title, 80), description: s(d.description, 400),
      category: CATS.indexOf(d.category) !== -1 ? d.category : 'Otro',
      tags: l(d.tags, 5, 24), photoTips: l(d.photoTips, 3, 160), missing: l(d.missing, 5, 100), demo: !!d.demo
    };
  }
  function listingHTML(d) {
    var ul = function (a) { return '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; };
    return '<div class="listing"><span class="eyebrow">Borrador de tu ficha</span><h3>' + esc(d.title) + '</h3><p>' + esc(d.description) + '</p>' +
      '<div><h4>Categoría</h4><div class="tagrow"><span class="tag">' + esc(d.category) + '</span></div></div>' +
      (d.tags.length ? '<div><h4>Etiquetas</h4><div class="tagrow">' + d.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div></div>' : '') +
      (d.photoTips.length ? '<div><h4>Consejos para tus fotos</h4>' + ul(d.photoTips) + '</div>' : '') +
      (d.missing.length ? '<div><h4>Te falta definir</h4>' + ul(d.missing) + '</div>' : '') +
      (d.demo ? '<p class="note">Modo demo: es un borrador básico. Con la IA activada la redacción es mucho mejor.</p>' : '') + '</div>';
  }
  async function onListing(form) {
    var txt = form.elements.txt.value.trim();
    var out = document.getElementById('listing-out');
    var btn = form.querySelector('button[type=submit]');
    if (txt.length < 8) { out.innerHTML = '<p class="error">Cuéntanos un poco más de tu producto.</p>'; return; }
    btn.disabled = true;
    out.innerHTML = '<p class="note">Escribiendo tu ficha…</p>';
    var data;
    try { data = await callIA({ mode: 'listing', text: txt.slice(0, 500) }); } catch (e) { data = localListing(txt); }
    out.innerHTML = listingHTML(cleanListing(data));
    btn.disabled = false;
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-inc],[data-dec],[data-rm],[data-open-ai],[data-sug],.mini,#ai-close');
    if (!t) { if (e.target === ai) ai.close ? ai.close() : ai.removeAttribute('open'); return; }
    if (t.id === 'ai-close') { ai.close ? ai.close() : ai.removeAttribute('open'); return; }
    if (t.classList.contains('mini')) { ai.close ? ai.close() : ai.removeAttribute('open'); return; }
    if (t.dataset.sug !== undefined) { sendAI(t.dataset.sug); return; }
    if (t.hasAttribute('data-open-ai')) { openAssistant(t.dataset.prompt || ''); return; }
    if (t.dataset.add) {
      var chosen = app.querySelector('input[name="size"]:checked');
      var msg = document.getElementById('msg');
      if (!chosen) { msg.textContent = 'Elige una opción para continuar.'; return; }
      msg.textContent = '';
      addToCart(t.dataset.add, chosen.value);
      toast('Agregado al carrito', 'Ver carrito', '#/carrito');
      return;
    }
    var i = Number(t.dataset.inc || t.dataset.dec || t.dataset.rm);
    if (t.dataset.inc !== undefined) cart[i].qty += 1;
    if (t.dataset.dec !== undefined) cart[i].qty = Math.max(1, cart[i].qty - 1);
    if (t.dataset.rm !== undefined) cart.splice(i, 1);
    saveCart();
    route();
  });

  document.addEventListener('change', function (e) {
    var key = e.target.dataset && e.target.dataset.q;
    if (!key) return;
    var q = hashQ();
    if (e.target.value) q.set(key, e.target.value); else q.delete(key);
    setHash('catalogo', q);
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'search-form') {
      e.preventDefault();
      var term = f.elements.q.value.trim();
      if (term) { setHash('buscar', new URLSearchParams({ q: term })); f.elements.q.blur(); }
    } else if (f.id === 'hero-ask') {
      e.preventDefault();
      var v = f.querySelector('input').value;
      f.reset();
      openAssistant(v);
    } else if (f.id === 'ai-form') {
      e.preventDefault();
      var m = aiInput.value;
      aiInput.value = '';
      sendAI(m);
    } else if (f.id === 'listing-form') {
      e.preventDefault();
      onListing(f);
    } else if (f.id === 'sell-form') {
      e.preventDefault();
      var out = document.getElementById('sell-msg');
      var el = f.elements;
      if (!el.marca.value.trim() || !el.ciudad.value.trim() || !el.mail.value || !el.mail.validity.valid) {
        out.className = 'error';
        out.textContent = 'Completa marca, ciudad y un correo válido.';
        return;
      }
      out.className = 'ok';
      out.textContent = 'Gracias, ' + el.marca.value.trim() + '. En el sitio real aquí se guardaría tu solicitud.';
      f.reset();
    }
  });

  window.addEventListener('hashchange', route);
  saveCart();
  route();
})();
