/* DF urbano — MVP (maqueta). SPA con rutas por hash para funcionar en GitHub Pages. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $("#app");
const money = n => "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = id => PRODUCTS.find(p => p.id === +id);
const isDesktop = () => matchMedia("(min-width:900px)").matches;
const waLink = txt => `https://wa.me/${STORE.wa}?text=${encodeURIComponent(txt)}`;
const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.address + ", Buenos Aires")}`;

/* ---------- Ticker ---------- */
const msg = "10% OFF POR TRANSFERENCIA ~ ENVIO A TODO EL PAIS  ";
$("#ticker").innerHTML = Array.from({ length: 12 }, () => `<span>${msg}</span>`).join("");

/* ---------- Carrito (localStorage con respaldo) ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("dfu_cart") || "[]").filter(l => byId(l.id)); } catch (e) {}
const persist = () => { try { localStorage.setItem("dfu_cart", JSON.stringify(cart)); } catch (e) {} };
const count = () => cart.reduce((a, l) => a + l.qty, 0);
const sumList = () => cart.reduce((a, l) => a + byId(l.id).price * l.qty, 0);
const sumTr = () => cart.reduce((a, l) => a + byId(l.id).tr * l.qty, 0);
const shippingFor = (mode, subtotal) => mode === "retiro" ? 0 : subtotal >= STORE.freeShippingFrom ? 0 : STORE.shipping;

/* ---------- Sesión (simulada, localStorage) ---------- */
let user = null;
try { user = JSON.parse(localStorage.getItem("dfu_user") || "null"); } catch (e) {}
function setUser(u) { user = u; try { u ? localStorage.setItem("dfu_user", JSON.stringify(u)) : localStorage.removeItem("dfu_user"); } catch (e) {} updUser(); }
function updUser() {
  const b = $("#userBtn"); if (!b) return;
  b.href = user ? "#/cuenta" : "#/login";
  b.setAttribute("aria-label", user ? "Mi cuenta" : "Iniciar sesión");
  b.classList.toggle("on", !!user);
}

function updBadge() { const b = $("#badge"); b.hidden = !count(); b.textContent = count(); }
function addToCart(id, color, size, qty) {
  const f = cart.find(l => l.id === id && l.color === color && l.size === size);
  f ? f.qty += qty : cart.push({ id, color, size, qty });
  persist(); updBadge();
}

/* ---------- Toast / Drawer ---------- */
let tt;
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 1800); }

const drawer = $("#drawer"), scrim = $("#scrim"), dBody = $("#drawerBody"), dTitle = $("#drawerTitle");
function closeDrawer() { drawer.classList.remove("open"); scrim.classList.remove("show"); drawer.setAttribute("aria-hidden", "true"); }
function openDrawer(kind) {
  drawer.classList.toggle("right", kind !== "menu");
  if (kind === "menu") {
    dTitle.textContent = "MENU";
    dBody.innerHTML = `<a href="#/">Inicio</a><a href="#/catalogo/todo">Todos los pantalones</a>${Object.entries(STYLES).map(([k, v]) => `<a class="sub" href="#/catalogo/${k}">${v}</a>`).join("")}<a href="#/catalogo/adultos">Adultos</a><a href="#/catalogo/ninos">Niños</a><a href="#/catalogo/popular">Lo popular</a><a href="#/catalogo/puesta">Mirala puesta</a><a href="#/local">Local</a><a href="#/carrito">Carrito</a>${user ? `<a class="acct" href="#/cuenta">Mi cuenta</a><a class="acct" href="#/" data-logout>Cerrar sesión</a>` : `<a class="acct" href="#/login">Iniciar sesión</a>`}`;
  } else if (kind === "search") {
    dTitle.textContent = "BUSCAR";
    dBody.innerHTML = `<input id="q" type="search" placeholder="Buscar pantalón, calza, body…" autocomplete="off"><div id="qres"></div>`;
    const q = $("#q");
    q.oninput = () => {
      const v = q.value.trim().toLowerCase();
      const r = v ? PRODUCTS.filter(p => (p.name + " pantalon " + STYLES[p.style]).toLowerCase().includes(v)) : [];
      $("#qres").innerHTML = r.length ? r.map(p => `<a class="sres" href="#/producto/${p.id}"><span class="sth"></span><span><b>${esc(p.name)}</b><small>${STYLES[p.style]} · ${money(p.price)}</small></span></a>`).join("")
        : v ? `<p>Sin resultados para “${esc(v)}”.</p>` : "";
    };
    setTimeout(() => q.focus(), 300);
  } else {
    dTitle.textContent = "CARRITO";
    dBody.innerHTML = miniCart();
  }
  drawer.classList.add("open"); scrim.classList.add("show"); drawer.setAttribute("aria-hidden", "false");
}
function miniCart() {
  if (!cart.length) return `<p>Tu carrito está vacío.</p><a class="btn-w" href="#/catalogo/todo">VER PRODUCTOS</a>`;
  return cart.map(l => { const p = byId(l.id); return `<div class="citem"><div>${esc(p.name)}<small>${COLORS[l.color].n} · Talle ${l.size} · x${l.qty}</small></div><b>${money(p.price * l.qty)}</b></div>`; }).join("")
    + `<div class="cfoot"><div class="row"><span>Subtotal</span><b>${money(sumList())}</b></div><a class="btn-w" href="#/carrito">VER CARRITO</a></div>`;
}
$("#menuBtn").onclick = () => openDrawer("menu");
$("#searchBtn").onclick = () => openDrawer("search");
$("#cartBtn").onclick = () => openDrawer("cart");
$("#drawerClose").onclick = scrim.onclick = closeDrawer;
dBody.addEventListener("click", e => { if (e.target.closest("[data-logout]")) { setUser(null); toast("Sesión cerrada"); } if (e.target.closest("a")) closeDrawer(); });
document.addEventListener("keydown", e => e.key === "Escape" && closeDrawer());

/* ---------- Componentes ---------- */
const swatch = k => `<i class="sw" style="background:${COLORS[k].h}" title="${COLORS[k].n}"></i>`;
function card(p, opt = {}) {
  const href = `#/producto/${p.id}`;
  return `<article class="card">
    <a class="ph" href="${href}" aria-label="${esc(p.name)}"><img src="assets/ph-tall.svg" alt=""></a>
    ${opt.sw ? `<div class="swatches">${p.colors.map(swatch).join("")}</div>` : ""}
    <div class="cbody">
      <a class="name" href="${href}">${esc(p.name)}</a>
      <span class="old${p.old ? "" : " none"}">${p.old ? money(p.old) : "&nbsp;"}</span>
      <span class="price">${money(p.price)}</span>
      <span class="inst">3 x ${money(p.price / 3)} sin interes</span>
      <span class="tr">${money(p.tr)} <small>por transferencia</small></span>
    </div>
    <a class="buy" href="${href}">COMPRAR</a>
  </article>`;
}

function rail(ids, row) {
  return `<div class="rail row${row}" data-rail>
    <button class="narrow l" data-dir="-1" aria-label="Anterior"><img src="assets/nav-left.svg" alt=""></button>
    <button class="narrow r" data-dir="1" aria-label="Siguiente"><img src="assets/nav-right.svg" alt=""></button>
    <div class="track">${ids.map(id => card(byId(id), { sw: row === 1 })).join("")}</div>
  </div>`;
}
function bindRails() {
  $$("[data-rail]").forEach(r => {
    const t = $(".track", r), l = $(".narrow.l", r), n = $(".narrow.r", r);
    const sync = () => { l.hidden = t.scrollLeft < 4; n.hidden = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4; };
    t.addEventListener("scroll", sync, { passive: true });
    t.addEventListener("dragstart", e => e.preventDefault());
    t.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const sx = e.clientX, sl = t.scrollLeft; let moved = false;
      const mv = ev => { const d = ev.clientX - sx; if (Math.abs(d) > 5) { moved = true; t.classList.add("drag"); } t.scrollLeft = sl - d; };
      const up = () => {
        window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
        t.classList.remove("drag");
        if (moved) { const stop = ev => { ev.preventDefault(); ev.stopPropagation(); }; t.addEventListener("click", stop, true); setTimeout(() => t.removeEventListener("click", stop, true), 0); }
      };
      window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
    });
    $$(".narrow", r).forEach(b => b.onclick = () => {
      const step = (t.firstElementChild.getBoundingClientRect().width + 10) * 2;
      t.scrollBy({ left: step * +b.dataset.dir, behavior: "smooth" });
    });
    sync();
  });
}

const crumbs = list => `<nav class="crumbs">${list.map(([t, h]) => h ? `<a href="${h}">${t}</a>` : `<span>${t}</span>`).join("<i>/</i>")}</nav>`;
const sizesFor = p => SIZES[p.pub];

/* ---------- Vistas ---------- */
function viewHome() {
  return `<section class="hero" id="hero" aria-label="Destacados">
      <button class="harrow l" id="hPrev" aria-label="Anterior"><img src="assets/arrow-left.svg" alt=""></button>
      <button class="harrow r" id="hNext" aria-label="Siguiente"><img src="assets/arrow-right.svg" alt=""></button>
    </section>
    <div class="pager" id="pager"></div>
    <div class="wrap">
      <h2 class="title t-popular"><a href="#/catalogo/popular">LO POPULAR</a></h2>
      ${rail(HOME_POPULAR, 1)}
      <h2 class="title t-mirala"><a href="#/catalogo/puesta">MIRALA PUESTA</a></h2>
      ${rail(HOME_PUESTA, 2)}
      <div class="cats">
        <a class="cat l" href="#/catalogo/adultos"><img src="assets/ph-wide.svg" alt=""><span>ADULTOS</span></a>
        <a class="cat r" href="#/catalogo/ninos"><img src="assets/ph-wide.svg" alt=""><span>NINOS</span></a>
      </div>
      <h2 class="title t-local"><a href="#/local">LOCAL</a></h2>
      ${localCard()}
    </div>`;
}
function localCard() {
  return `<section class="local">
    <div class="flores">FLORES</div>
    <div class="info"><b>${STORE.address}</b><span>${STORE.city}</span><span>${STORE.hours}</span></div>
    <a class="l-link como" href="${mapLink}" target="_blank" rel="noopener">Como llegar</a>
    <a class="l-link wsp" href="${waLink("Hola! Quería hacer una consulta.")}" target="_blank" rel="noopener">Whatsapp </a>
  </section>`;
}
let heroTimer;
function bindHome() {
  const hero = $("#hero"), pager = $("#pager"), N = 3;
  let cur = 1;
  const track = document.createElement("div"); track.className = "hero-track";
  hero.insertBefore(track, hero.firstChild);
  for (let i = 0; i < N; i++) {
    const s = document.createElement("a"); s.className = "slide"; s.href = "#/catalogo/todo"; s.setAttribute("aria-label", "Ver productos"); s.draggable = false;
    track.appendChild(s);
    const b = document.createElement("button"); b.setAttribute("aria-label", "Slide " + (i + 1)); b.onclick = () => go(i); pager.appendChild(b);
  }
  const dots = $$("button", pager);
  const go = i => {
    cur = (i + N) % N;
    track.style.transform = `translateX(${-cur * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle("on", k === cur));
  };
  $("#hPrev").onclick = () => go(cur - 1);
  $("#hNext").onclick = () => go(cur + 1);
  go(cur);
  clearInterval(heroTimer);
  heroTimer = setInterval(() => go(cur + 1), 5000);

  // Arrastre con dedo (touch) o mouse
  let sx = 0, dx = 0, down = false, moved = false;
  hero.addEventListener("pointerdown", e => {
    if (e.target.closest("button") || (e.pointerType === "mouse" && e.button !== 0)) return;
    down = true; moved = false; sx = e.clientX; dx = 0;
    track.style.transition = "none"; clearInterval(heroTimer);
    hero.classList.add("drag");
  });
  const move = e => {
    if (!down) return;
    dx = e.clientX - sx;
    if (Math.abs(dx) > 6) moved = true;
    track.style.transform = `translateX(calc(${-cur * 100}% + ${dx}px))`;
  };
  const end = () => {
    if (!down) return;
    down = false; hero.classList.remove("drag"); track.style.transition = "";
    const w = hero.clientWidth;
    go(dx < -w * .15 ? cur + 1 : dx > w * .15 ? cur - 1 : cur);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  hero.addEventListener("click", e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  hero.addEventListener("dragstart", e => e.preventDefault());
  hero.addEventListener("keydown", e => { if (e.key === "ArrowLeft") go(cur - 1); if (e.key === "ArrowRight") go(cur + 1); });
  hero.tabIndex = 0;
  bindRails();
}

/* Catálogo */
const CAT_META = {
  todo: { t: "PANTALONES", f: () => true },
  adultos: { t: "ADULTOS", f: p => p.pub === "adultos" },
  ninos: { t: "NINOS", f: p => p.pub === "ninos" },
  popular: { t: "LO POPULAR", f: p => p.pop },
  puesta: { t: "MIRALA PUESTA", f: p => p.look },
  ...Object.fromEntries(Object.entries(STYLES).map(([k, v]) => [k, { t: v.toUpperCase(), f: p => p.style === k }]))
};
function viewCatalog(slug) {
  slug = CAT_META[slug] ? slug : "todo";
  const m = CAT_META[slug];
  const chip = (k, label) => `<a class="chip ${k === slug ? "on" : ""}" href="#/catalogo/${k}">${label}</a>`;
  return `<div class="wrap page">
    ${crumbs([["Inicio", "#/"], ["Pantalones", slug === "todo" ? "" : "#/catalogo/todo"], ...(slug === "todo" ? [] : [[m.t[0] + m.t.slice(1).toLowerCase()]])].map(c => c[1] === "" ? [c[0]] : c))}
    <h1 class="title big">${m.t}</h1>
    <div class="toolbar">
      <div class="chips">${chip("todo", "Todos los pantalones")}${chip("adultos", "Adultos")}${chip("ninos", "Niños")}${Object.entries(STYLES).map(([k, v]) => chip(k, v)).join("")}</div>
      <label class="sel"><span>Ordenar</span><select id="sort"><option value="">Destacados</option><option value="asc">Menor precio</option><option value="desc">Mayor precio</option></select></label>
    </div>
    <p class="count" id="count"></p>
    <div class="grid" id="grid"></div>
  </div>`;
}
function bindCatalog(slug) {
  const base = PRODUCTS.filter((CAT_META[slug] || CAT_META.todo).f);
  const draw = () => {
    let l = base;
    const s = $("#sort").value;
    if (s) l = [...l].sort((a, b) => s === "asc" ? a.price - b.price : b.price - a.price);
    $("#count").textContent = `${l.length} pantalon${l.length === 1 ? "" : "es"}`;
    $("#grid").innerHTML = l.map(p => card(p, { sw: true })).join("");
  };
  $("#sort").onchange = draw;
  draw();
}

/* Producto */
function viewProduct(id) {
  const p = byId(id);
  if (!p) return notFound();
  const rel = PRODUCTS.filter(x => x.id !== p.id && x.style === p.style).concat(PRODUCTS.filter(x => x.id !== p.id && x.style !== p.style)).slice(0, 4);
  return `<div class="wrap page">
    ${crumbs([["Inicio", "#/"], ["Pantalones", "#/catalogo/todo"], [STYLES[p.style], `#/catalogo/${p.style}`], [esc(p.name)]])}
    <div class="pdp">
      <div class="gal">
        <div class="ph main" id="gmain"><img src="assets/ph-tall.svg" alt=""></div>
        <div class="thumbs" id="thumbs">${[0, 1, 2, 3].map(i => `<button class="ph th ${i ? "" : "on"}" aria-label="Foto ${i + 1}"><img src="assets/ph-small.svg" alt=""></button>`).join("")}</div>
      </div>
      <div class="pinfo">
        <span class="ptag">Pantalon · ${STYLES[p.style]} · ${PUBLICO[p.pub]}</span>
        <h1 class="pname">${esc(p.name)}</h1>
        ${p.old ? `<span class="old">${money(p.old)}</span>` : ""}
        <div class="pprice">${money(p.price)}</div>
        <div class="inst">3 x ${money(p.price / 3)} sin interes</div>
        <div class="tr big">${money(p.tr)} <small>por transferencia (10% off)</small></div>

        <div class="opt"><h4>Color: <b id="colName">${COLORS[p.colors[0]].n}</b></h4>
          <div class="opts" id="colors">${p.colors.map((c, i) => `<button class="swb ${i ? "" : "on"}" data-c="${c}" style="--c:${COLORS[c].h}" aria-label="${COLORS[c].n}"></button>`).join("")}</div></div>
        <div class="opt"><h4>Talle <a href="#/info/talles" class="lnk">Guía de talles</a></h4>
          <div class="opts" id="sizes">${sizesFor(p).map((s, i, a) => `<button class="szb ${a.length === 1 ? "on" : ""}" data-s="${s}">${s}</button>`).join("")}</div>
          <p class="err" id="sizeErr" hidden>Elegí un talle para continuar</p></div>

        <div class="buyrow">
          <div class="qty"><button id="qm" aria-label="Menos">−</button><span id="qv">1</span><button id="qp" aria-label="Más">+</button></div>
          <button class="btn-w big" id="addBtn">AGREGAR AL CARRITO</button>
        </div>
        <a class="btn-o" id="waBtn" target="_blank" rel="noopener" href="#">CONSULTAR POR WHATSAPP</a>

        <div class="acc">
          <details open><summary>Descripción</summary><p>Pantalón estilo ${STYLES[p.style].toLowerCase()}, tela elástica y suave, de corte cómodo. Descripción de ejemplo para la maqueta.</p></details>
          <details><summary>Envíos</summary><p>Envío a todo el país. Retiro gratis en el local de Flores. Envío gratis desde ${money(STORE.freeShippingFrom)}.</p></details>
          <details><summary>Cambios</summary><p>Tenés 30 días para cambiar tu prenda, sin uso y con etiquetas.</p></details>
        </div>
      </div>
    </div>
    ${rel.length ? `<h2 class="title mid">TAMBIEN TE PUEDE GUSTAR</h2><div class="grid rel">${rel.map(x => card(x, { sw: true })).join("")}</div>` : ""}
  </div>`;
}
function bindProduct(id) {
  const p = byId(id); if (!p) return;
  let color = p.colors[0], size = sizesFor(p).length === 1 ? sizesFor(p)[0] : null, qty = 1;
  const wa = () => $("#waBtn").href = waLink(`Hola! Quiero consultar por: ${p.name} (${COLORS[color].n}${size ? ", talle " + size : ""}).`);
  wa();
  $("#colors").onclick = e => { const b = e.target.closest(".swb"); if (!b) return; color = b.dataset.c; $("#colName").textContent = COLORS[color].n; $$(".swb").forEach(x => x.classList.toggle("on", x === b)); wa(); };
  $("#sizes").onclick = e => { const b = e.target.closest(".szb"); if (!b) return; size = b.dataset.s; $$(".szb").forEach(x => x.classList.toggle("on", x === b)); $("#sizeErr").hidden = true; wa(); };
  $("#thumbs").onclick = e => { const b = e.target.closest(".th"); if (!b) return; $$(".th").forEach(x => x.classList.toggle("on", x === b)); };
  $("#qm").onclick = () => $("#qv").textContent = qty = Math.max(1, qty - 1);
  $("#qp").onclick = () => $("#qv").textContent = qty = Math.min(9, qty + 1);
  $("#addBtn").onclick = () => {
    if (!size) { $("#sizeErr").hidden = false; return; }
    addToCart(p.id, color, size, qty); openDrawer("cart"); toast("Agregado al carrito ✓");
  };
}

/* Carrito */
function viewCart() {
  if (!cart.length) return `<div class="wrap page"><h1 class="title big">CARRITO</h1>
    <div class="empty"><p>Tu carrito está vacío.</p><a class="btn-w" href="#/catalogo/todo">VER PRODUCTOS</a></div></div>`;
  const sub = sumList(), tr = sumTr(), ship = shippingFor("domicilio", sub);
  return `<div class="wrap page">
    ${crumbs([["Inicio", "#/"], ["Carrito"]])}
    <h1 class="title big">CARRITO</h1>
    <div class="cols">
      <div class="lines">${cart.map((l, i) => { const p = byId(l.id); return `
        <div class="line">
          <a class="ph lt" href="#/producto/${p.id}"><img src="assets/ph-small.svg" alt=""></a>
          <div class="li">
            <a class="name" href="#/producto/${p.id}">${esc(p.name)}</a>
            <small>${COLORS[l.color].n} · Talle ${l.size}</small>
            <div class="qty sm"><button data-dec="${i}" aria-label="Menos">−</button><span>${l.qty}</span><button data-inc="${i}" aria-label="Más">+</button></div>
          </div>
          <div class="lp"><b>${money(p.price * l.qty)}</b><small>${money(p.tr * l.qty)} transf.</small><button class="lnk" data-rm="${i}">Quitar</button></div>
        </div>`; }).join("")}</div>
      <aside class="summary">
        <h3>Resumen</h3>
        <div class="row"><span>Subtotal</span><b>${money(sub)}</b></div>
        <div class="row"><span>Envío a domicilio</span><b>${ship ? money(ship) : "Gratis"}</b></div>
        <div class="row muted"><span>Retiro en local</span><b>Gratis</b></div>
        <div class="row total"><span>Total</span><b>${money(sub + ship)}</b></div>
        <div class="row tr-row"><span>Total por transferencia</span><b>${money(tr + ship)}</b></div>
        <p class="note">${sub < STORE.freeShippingFrom ? `Sumá ${money(STORE.freeShippingFrom - sub)} más y el envío es gratis.` : "¡Tenés envío gratis!"}</p>
        <a class="btn-w big" href="#/checkout">INICIAR COMPRA</a>
        <a class="lnk center" href="#/catalogo/todo">Seguir comprando</a>
      </aside>
    </div>
  </div>`;
}
function bindCart() {
  $(".lines")?.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.inc != null) cart[t.dataset.inc].qty = Math.min(9, cart[t.dataset.inc].qty + 1);
    else if (t.dataset.dec != null) { if (--cart[t.dataset.dec].qty < 1) cart.splice(t.dataset.dec, 1); }
    else if (t.dataset.rm != null) cart.splice(t.dataset.rm, 1);
    else return;
    persist(); updBadge(); updUser(); render();
  });
}

/* Checkout */
function viewCheckout() {
  if (!cart.length) return viewCart();
  const sub = sumList();
  return `<div class="wrap page">
    ${crumbs([["Inicio", "#/"], ["Carrito", "#/carrito"], ["Checkout"]])}
    <h1 class="title big">CHECKOUT</h1>
    <form id="co" class="cols" novalidate>
      <div class="form">
        <fieldset><legend>1. Contacto</legend>
          <label>Nombre y apellido<input name="nombre" required autocomplete="name"></label>
          <div class="two"><label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Teléfono<input name="tel" type="tel" required autocomplete="tel"></label></div>
        </fieldset>
        <fieldset><legend>2. Entrega</legend>
          <div class="radios">
            <label class="radio"><input type="radio" name="envio" value="retiro" checked><span><b>Retiro en el local</b><small>Yerbal 2816, Flores · Gratis</small></span></label>
            <label class="radio"><input type="radio" name="envio" value="domicilio"><span><b>Envío a domicilio</b><small id="shipTxt"></small></span></label>
          </div>
          <div id="addr" hidden>
            <label>Dirección<input name="dir" autocomplete="street-address"></label>
            <div class="two"><label>Ciudad<input name="ciudad" autocomplete="address-level2"></label><label>Código postal<input name="cp" inputmode="numeric" autocomplete="postal-code"></label></div>
          </div>
        </fieldset>
        <fieldset><legend>3. Pago</legend>
          <div class="radios">
            <label class="radio"><input type="radio" name="pago" value="transferencia" checked><span><b>Transferencia bancaria</b><small>10% off · recibís los datos al confirmar</small></span></label>
            <label class="radio"><input type="radio" name="pago" value="tarjeta"><span><b>Tarjeta de crédito</b><small>Hasta 3 cuotas sin interés</small></span></label>
          </div>
        </fieldset>
      </div>
      <aside class="summary" id="sum"></aside>
    </form>
  </div>`;
}
function bindCheckout() {
  const f = $("#co"); if (!f) return;
  const sumEl = $("#sum");
  const calc = () => {
    const envio = f.envio.value, pago = f.pago.value, sub = sumList();
    const ship = shippingFor(envio, sub), base = pago === "transferencia" ? sumTr() : sub;
    $("#shipTxt").textContent = sub >= STORE.freeShippingFrom ? "Gratis (superás el mínimo)" : money(STORE.shipping);
    $("#addr").hidden = envio !== "domicilio";
    $$("#addr input").forEach(i => i.required = envio === "domicilio");
    sumEl.innerHTML = `<h3>Tu pedido</h3>
      ${cart.map(l => { const p = byId(l.id); return `<div class="row sm"><span>${esc(p.name)} <small>${COLORS[l.color].n}, ${l.size} ×${l.qty}</small></span><b>${money((pago === "transferencia" ? p.tr : p.price) * l.qty)}</b></div>`; }).join("")}
      <div class="row"><span>Envío</span><b>${ship ? money(ship) : "Gratis"}</b></div>
      <div class="row total"><span>Total</span><b>${money(base + ship)}</b></div>
      ${pago === "tarjeta" ? `<p class="note">3 cuotas de ${money((base + ship) / 3)} sin interés</p>` : `<p class="note">Ahorrás ${money(sub - sumTr())} pagando por transferencia</p>`}
      <button class="btn-w big" type="submit">CONFIRMAR PEDIDO</button>
      <p class="note">Maqueta: no se realiza ningún cobro.</p>`;
  };
  if (user) { f.nombre.value = user.name; f.email.value = user.email; }
  f.addEventListener("change", calc); calc();
  f.addEventListener("submit", e => {
    e.preventDefault();
    const bad = $$("input[required]", f).find(i => !i.value.trim() || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value)));
    $$(".invalid", f).forEach(i => i.classList.remove("invalid"));
    if (bad) { bad.classList.add("invalid"); bad.focus(); toast("Completá los campos marcados"); return; }
    const order = {
      n: "DFU-" + String(Math.floor(Math.random() * 90000) + 10000),
      nombre: f.nombre.value.trim(), email: f.email.value.trim(), envio: f.envio.value, pago: f.pago.value,
      total: (f.pago.value === "transferencia" ? sumTr() : sumList()) + shippingFor(f.envio.value, sumList())
    };
    try { sessionStorage.setItem("dfu_order", JSON.stringify(order)); } catch (er) {}
    window.__order = order;
    cart = []; persist(); updBadge();
    location.hash = "#/gracias";
  });
}

/* Gracias */
function viewThanks() {
  let o = window.__order;
  try { o = o || JSON.parse(sessionStorage.getItem("dfu_order")); } catch (e) {}
  if (!o) return `<div class="wrap page"><h1 class="title big">GRACIAS</h1><div class="empty"><p>No hay pedidos recientes.</p><a class="btn-w" href="#/">VOLVER AL INICIO</a></div></div>`;
  return `<div class="wrap page"><div class="thanks">
    <div class="check">✓</div>
    <h1 class="title big">PEDIDO CONFIRMADO</h1>
    <p>Gracias, <b>${esc(o.nombre)}</b>. Te enviamos el detalle a <b>${esc(o.email)}</b>.</p>
    <div class="summary"><div class="row"><span>N° de pedido</span><b>${o.n}</b></div>
      <div class="row"><span>Entrega</span><b>${o.envio === "retiro" ? "Retiro en local" : "Envío a domicilio"}</b></div>
      <div class="row"><span>Pago</span><b>${o.pago === "transferencia" ? "Transferencia" : "Tarjeta"}</b></div>
      <div class="row total"><span>Total</span><b>${money(o.total)}</b></div>
      ${o.pago === "transferencia" ? `<p class="note">Datos para transferir (ejemplo): CBU 0000000000000000000000 · Alias DFURBANO.DANZA</p>` : ""}
    </div>
    <p class="note">Esta es una maqueta: no se generó ningún cobro real.</p>
    <a class="btn-w big" href="#/">SEGUIR EXPLORANDO</a></div></div>`;
}

/* Local */
function viewLocal() {
  return `<div class="wrap page">
    ${crumbs([["Inicio", "#/"], ["Local"]])}
    <h1 class="title big">LOCAL</h1>
    ${localCard()}
    <div class="cols local-cols">
      <div>
        <div class="ph map"><img src="assets/ph-wide.svg" alt="Mapa (placeholder)"><span>MAPA</span></div>
        <h3 class="h3">Horarios</h3>
        <div class="row"><span>Lunes a viernes</span><b>9 a 18:30</b></div>
        <div class="row"><span>Sábados y domingos</span><b>Cerrado</b></div>
        <p class="note">${STORE.address}, ${STORE.city}</p>
      </div>
      <form class="form" id="contact" novalidate>
        <h3 class="h3">Escribinos</h3>
        <label>Nombre<input name="n" required></label>
        <label>Email<input name="e" type="email" required></label>
        <label>Mensaje<textarea name="m" rows="4" required></textarea></label>
        <button class="btn-w big" type="submit">ENVIAR MENSAJE</button>
      </form>
    </div>
  </div>`;
}
function bindLocal() {
  $("#contact").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, bad = $$("[required]", f).find(i => !i.value.trim());
    $$(".invalid", f).forEach(i => i.classList.remove("invalid"));
    if (bad) { bad.classList.add("invalid"); bad.focus(); toast("Completá todos los campos"); return; }
    f.reset(); toast("Mensaje enviado (simulado) ✓");
  });
}

/* Info */
const INFO = {
  envios: ["ENVIOS", `Enviamos a todo el país. Envío a domicilio ${money(STORE.shipping)} en toda la Argentina y gratis desde ${money(STORE.freeShippingFrom)}. También podés retirar gratis por el local de Flores (${STORE.address}). Los pedidos se despachan en 2 a 5 días hábiles.`],
  cambios: ["CAMBIOS", "Tenés 30 días desde la compra para cambiar tu prenda. Tiene que estar sin uso y con las etiquetas puestas. Escribinos por Whatsapp o acercate al local."],
  pagos: ["PAGOS", "Transferencia bancaria con 10% off, o tarjeta de crédito hasta en 3 cuotas sin interés. También podés abonar en efectivo en el local."],
  talles: ["TALLES", "Adultos: S, M, L y XL. Niños: 4, 6, 8, 10 y 12. Si dudás entre dos talles, elegí el mayor. Tabla de medidas de ejemplo para la maqueta."]
};
function viewInfo(k) {
  const i = INFO[k]; if (!i) return notFound();
  return `<div class="wrap page">${crumbs([["Inicio", "#/"], [i[0][0] + i[0].slice(1).toLowerCase()]])}
    <h1 class="title big">${i[0]}</h1><p class="prose">${i[1]}</p>
    <a class="btn-w" href="#/catalogo/todo">VER PRODUCTOS</a></div>`;
}

function notFound() {
  return `<div class="wrap page"><h1 class="title big">404</h1><div class="empty"><p>No encontramos esa página.</p><a class="btn-w" href="#/">VOLVER AL INICIO</a></div></div>`;
}

/* Login / registro / cuenta (simulado) */
let authMode = "login";
function viewLogin() {
  if (user) return viewAccount();
  const reg = authMode === "register";
  return `<div class="wrap page"><div class="auth">
    ${crumbs([["Inicio", "#/"], [reg ? "Crear cuenta" : "Iniciar sesión"]])}
    <h1 class="title big">${reg ? "CREAR CUENTA" : "INGRESAR"}</h1>
    <div class="tabs" role="tablist">
      <button class="tab ${reg ? "" : "on"}" data-mode="login" role="tab">Iniciar sesión</button>
      <button class="tab ${reg ? "on" : ""}" data-mode="register" role="tab">Crear cuenta</button>
    </div>
    <form id="auth" class="form" novalidate>
      ${reg ? `<label>Nombre<input name="nombre" required autocomplete="name"></label>` : ""}
      <label>Email<input name="email" type="email" required autocomplete="email"></label>
      <label>Contraseña<input name="pass" type="password" required minlength="4" autocomplete="${reg ? "new-password" : "current-password"}"></label>
      ${reg ? "" : `<button type="button" class="lnk left" id="forgot">¿Olvidaste tu contraseña?</button>`}
      <button class="btn-w big" type="submit">${reg ? "CREAR CUENTA" : "INGRESAR"}</button>
      <p class="note">Maqueta: cualquier email y contraseña (4+ caracteres) funcionan.</p>
    </form>
  </div></div>`;
}
function bindLogin() {
  if (user) return bindAccount();
  $$(".tab").forEach(t => t.onclick = () => { authMode = t.dataset.mode; render(); });
  const f = $("#auth");
  $("#forgot")?.addEventListener("click", () => toast("Te enviaríamos un email (simulado)"));
  f.addEventListener("submit", e => {
    e.preventDefault();
    $$(".invalid", f).forEach(i => i.classList.remove("invalid"));
    const bad = $$("input", f).find(i => !i.value.trim() || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value)) || (i.name === "pass" && i.value.length < 4));
    if (bad) { bad.classList.add("invalid"); bad.focus(); toast("Revisá los campos marcados"); return; }
    const email = f.email.value.trim();
    const name = (f.nombre?.value.trim()) || email.split("@")[0].replace(/^./, c => c.toUpperCase());
    setUser({ name, email });
    toast("¡Hola, " + name + "!");
    location.hash = "#/cuenta";
  });
}
function viewAccount() {
  if (!user) return viewLogin();
  let o = null; try { o = JSON.parse(sessionStorage.getItem("dfu_order")); } catch (e) {}
  return `<div class="wrap page"><div class="auth">
    ${crumbs([["Inicio", "#/"], ["Mi cuenta"]])}
    <h1 class="title big">MI CUENTA</h1>
    <div class="summary">
      <h3>Datos</h3>
      <div class="row"><span>Nombre</span><b>${esc(user.name)}</b></div>
      <div class="row"><span>Email</span><b>${esc(user.email)}</b></div>
    </div>
    <div class="summary" style="margin-top:16px">
      <h3>Último pedido</h3>
      ${o ? `<div class="row"><span>N° de pedido</span><b>${o.n}</b></div><div class="row"><span>Total</span><b>${money(o.total)}</b></div>` : `<p class="note" style="margin:0">Todavía no hiciste pedidos.</p>`}
    </div>
    <div class="buyrow"><a class="btn-w big" href="#/catalogo/todo">SEGUIR COMPRANDO</a><button class="btn-o" id="logout" style="flex:1;margin:0">CERRAR SESIÓN</button></div>
  </div></div>`;
}
function bindAccount() {
  $("#logout")?.addEventListener("click", () => { setUser(null); toast("Sesión cerrada"); location.hash = "#/"; });
}

/* ---------- Router ---------- */
function render() {
  const [, page = "", arg] = location.hash.replace(/^#/, "").split("/").map(decodeURIComponent);
  const routes = {
    "": [viewHome, bindHome, "DF urbano"],
    catalogo: [() => viewCatalog(arg), () => bindCatalog(arg), "Catálogo"],
    producto: [() => viewProduct(arg), () => bindProduct(arg), byId(arg)?.name || "Producto"],
    carrito: [viewCart, bindCart, "Carrito"],
    checkout: [viewCheckout, bindCheckout, "Checkout"],
    gracias: [viewThanks, null, "Gracias"],
    local: [viewLocal, bindLocal, "Local"],
    login: [viewLogin, bindLogin, "Iniciar sesión"],
    cuenta: [viewAccount, bindAccount, "Mi cuenta"],
    info: [() => viewInfo(arg), null, "Info"]
  };
  const r = routes[page] || [notFound, null, "No encontrado"];
  clearInterval(heroTimer);
  app.innerHTML = r[0](); r[1] && r[1]();
  document.title = (r[2] === "DF urbano" ? "" : r[2] + " · ") + "DF urbano";
  $$(".dnav a").forEach(a => a.classList.toggle("on", location.hash.startsWith(a.getAttribute("href")) && a.getAttribute("href") !== "#/"));
}
let lastHash = null;
window.addEventListener("hashchange", () => { render(); closeDrawer(); window.scrollTo(0, 0); });
updBadge(); render();
