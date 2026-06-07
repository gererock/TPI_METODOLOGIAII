import {
  construirResumenCarrito,
  quitarCantidadDelCarrito,
  quitarProductoDelCarrito,
  suscribirseAlCarrito,
} from "/frontend/js/cart-store.js";
import {
  formatearPrecio,
  obtenerProductos,
} from "/frontend/js/productos-api.js";

const URL_CHECKOUT  = "/frontend/pages/CheckoutCliente.html";
const URL_CATALOGO  = "/frontend/pages/CatalogoCliente.html";
const URL_API       = "http://localhost:8080";
const URL_APLICAR_CUPON = `${URL_API}/api/cupones/aplicar`;
const URL_USAR_CUPON    = `${URL_API}/api/cupones/usar`;

// ─── ESTADO ──────────────────────────────────────────────────────────────────
const estado = {
  productos: [],
  idProductoEditorQuitar: null,
  borradorQuitarPorProducto: {},
  cuponAplicado: null,   // { codigoCupon, totalOriginal, descuentoAplicado, totalFinal }
};

// ─── ELEMENTOS DOM ───────────────────────────────────────────────────────────
const el = {
  listaCarrito:     document.getElementById("carrito-items"),
  contadorCarrito:  document.getElementById("carrito-count"),
  totalCarrito:     document.getElementById("carrito-total"),
  filaDescuento:    document.getElementById("discount-row"),
  descuentoVal:     document.getElementById("summary-discount"),
  filaTotalFinal:   document.getElementById("final-total-row"),
  totalFinal:       document.getElementById("summary-final-total"),
  inputCupon:       document.getElementById("codigo-cupon"),
  btnAplicarCupon:  document.getElementById("btn-aplicar-cupon"),
  mensajeCupon:     document.getElementById("coupon-message"),
  botonProceder:    document.getElementById("btn-proceder-pago"),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function escaparHtml(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function normalizarCantidadQuitar(valor, max) {
  const n = Number.parseInt(valor, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(n, 1), Math.max(max, 1));
}

function obtenerClienteId() {
  try {
    const raw = localStorage.getItem("cliente");
    if (!raw) return null;
    const c = JSON.parse(raw);
    return c.id ?? c.idCliente ?? null;
  } catch { return null; }
}

// ─── CUPÓN ───────────────────────────────────────────────────────────────────
function mostrarMensajeCupon(msg, esError = false) {
  el.mensajeCupon.textContent = msg;
  el.mensajeCupon.className = "coupon-message " + (esError ? "error" : "success");
}

function limpiarMensajeCupon() {
  el.mensajeCupon.textContent = "";
  el.mensajeCupon.className = "coupon-message";
}

function actualizarResumenConCupon() {
  const resumen = construirResumenCarrito(estado.productos);

  el.totalCarrito.textContent = formatearPrecio(resumen.total);
  el.contadorCarrito.textContent = String(resumen.totalUnidades);

  if (estado.cuponAplicado) {
    el.filaDescuento.style.display  = "flex";
    el.filaTotalFinal.style.display = "flex";
    el.descuentoVal.textContent = `- ${formatearPrecio(estado.cuponAplicado.descuentoAplicado)}`;
    el.totalFinal.textContent   = formatearPrecio(estado.cuponAplicado.totalFinal);
  } else {
    el.filaDescuento.style.display  = "none";
    el.filaTotalFinal.style.display = "none";
  }

  el.botonProceder.disabled = resumen.totalUnidades === 0;
}

// Guardamos el cupon en sessionStorage para que CheckoutCliente lo reciba
function persistirCupon() {
  if (estado.cuponAplicado) {
    sessionStorage.setItem("cuponAplicado", JSON.stringify(estado.cuponAplicado));
  } else {
    sessionStorage.removeItem("cuponAplicado");
  }
}

async function aplicarCupon() {
  const resumen = construirResumenCarrito(estado.productos);
  const idCliente = obtenerClienteId();
  const codigoCupon = Number(el.inputCupon.value);

  limpiarMensajeCupon();

  if (!idCliente) {
    mostrarMensajeCupon("No se encontró el cliente. Iniciá sesión.", true);
    return;
  }
  if (!Number.isInteger(codigoCupon) || codigoCupon <= 0) {
    mostrarMensajeCupon("Ingresá un código de cupón válido.", true);
    return;
  }
  if (resumen.total <= 0) {
    mostrarMensajeCupon("El carrito está vacío.", true);
    return;
  }

  try {
    el.btnAplicarCupon.disabled = true;
    el.btnAplicarCupon.textContent = "Aplicando…";

    const resp = await fetch(URL_APLICAR_CUPON, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idCliente:   idCliente,
        codigoCupon: codigoCupon,
        totalPedido: resumen.total,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(data.message ?? data.error ?? "No se pudo aplicar el cupón.");
    }

    estado.cuponAplicado = data.data;
    persistirCupon();

    mostrarMensajeCupon(
      `✓ Cupón aplicado. Descuento: ${formatearPrecio(data.data.descuentoAplicado)}`
    );
    actualizarResumenConCupon();

  } catch (err) {
    estado.cuponAplicado = null;
    persistirCupon();
    actualizarResumenConCupon();
    mostrarMensajeCupon(err.message, true);
  } finally {
    el.btnAplicarCupon.disabled = false;
    el.btnAplicarCupon.textContent = "Aplicar";
  }
}

// ─── RENDER LISTA ─────────────────────────────────────────────────────────────
function obtenerCantidadQuitarBorrador(id, max) {
  const v = normalizarCantidadQuitar(estado.borradorQuitarPorProducto[id], max);
  estado.borradorQuitarPorProducto[id] = v;
  return v;
}

function guardarCantidadQuitarBorrador(id, valor, max) {
  estado.borradorQuitarPorProducto[String(id)] = normalizarCantidadQuitar(valor, max);
}

function cerrarEditorQuitar() { estado.idProductoEditorQuitar = null; }

function alternarEditorQuitar(id, max) {
  if (estado.idProductoEditorQuitar === id) { cerrarEditorQuitar(); return; }
  estado.idProductoEditorQuitar = id;
  guardarCantidadQuitarBorrador(id, estado.borradorQuitarPorProducto[id] ?? 1, max);
}

function renderizarCarrito() {
  const resumen = construirResumenCarrito(estado.productos);

  if (!resumen.productos.some(p => p.idProducto === estado.idProductoEditorQuitar)) {
    cerrarEditorQuitar();
  }

  // Si el carrito cambió y hay cupón aplicado, revalidar descuento sobre nuevo total
  if (estado.cuponAplicado) {
    const nuevoTotal = resumen.total;
    const descuento  = Number(estado.cuponAplicado.descuentoAplicado);
    if (nuevoTotal <= descuento) {
      // El carrito quedó por debajo del descuento, lo quitamos
      estado.cuponAplicado = null;
      persistirCupon();
      mostrarMensajeCupon("El cupón fue removido porque el total es menor al descuento.", true);
    } else {
      // Recalcular totalFinal con el nuevo subtotal
      estado.cuponAplicado = {
        ...estado.cuponAplicado,
        totalOriginal: nuevoTotal,
        totalFinal: nuevoTotal - descuento,
      };
      persistirCupon();
    }
  }

  actualizarResumenConCupon();

  if (!resumen.productos.length) {
    el.listaCarrito.innerHTML = `
      <div class="carrito-empty">
        <p class="carrito-empty-icon">🛒</p>
        <p class="carrito-empty-title">Tu carrito está vacío</p>
        <p class="carrito-empty-msg">Agregá productos desde el catálogo para continuar.</p>
        <a class="btn-outline" href="${URL_CATALOGO}">Ir al catálogo</a>
      </div>`;
    return;
  }

  el.listaCarrito.innerHTML = resumen.productos.map(p => {
    const editorAbierto  = estado.idProductoEditorQuitar === p.idProducto;
    const cantidadQuitar = obtenerCantidadQuitarBorrador(p.idProducto, p.cantidad);

    return `
      <article class="carrito-item">
        <img class="carrito-item-img" src="${escaparHtml(p.foto)}" alt="${escaparHtml(p.nombre)}" />

        <div class="carrito-item-info">
          <h3 class="carrito-item-name">${escaparHtml(p.nombre)}</h3>
          <p class="carrito-item-brand">Marca: ${escaparHtml(p.marca || 'BodyPaint')}</p>
          <p class="carrito-item-meta">
            <span class="carrito-item-qty">${p.cantidad} x</span>
            <span class="carrito-item-price">${formatearPrecio(p.precioUnitario)}</span>
          </p>
        </div>

        <div class="carrito-item-right">
          <strong class="carrito-item-subtotal">${formatearPrecio(p.subtotal)}</strong>
          <button class="carrito-trash-toggle ${editorAbierto ? 'is-open' : ''}"
            type="button" data-accion="abrir-panel-quitar"
            data-id-producto="${escaparHtml(p.idProducto)}"
            aria-label="Quitar unidades" aria-expanded="${editorAbierto}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/><path d="M8 6V4h8v2"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v5"/><path d="M14 11v5"/>
            </svg>
          </button>
        </div>

        ${editorAbierto ? `
          <div class="carrito-remove-panel">
            <p class="carrito-remove-title">¿Cuántas unidades querés quitar?</p>
            <div class="carrito-remove-actions">
              <div class="carrito-qty-stepper">
                <button class="carrito-qty-btn" type="button"
                  data-accion="bajar-cantidad-quitar"
                  data-id-producto="${escaparHtml(p.idProducto)}">−</button>
                <input class="carrito-qty-input" type="number" min="1" max="${p.cantidad}"
                  value="${cantidadQuitar}" inputmode="numeric"
                  data-input-quitar="true"
                  data-id-producto="${escaparHtml(p.idProducto)}" />
                <button class="carrito-qty-btn" type="button"
                  data-accion="subir-cantidad-quitar"
                  data-id-producto="${escaparHtml(p.idProducto)}">+</button>
              </div>
              <button class="carrito-action-btn" type="button"
                data-accion="aplicar-cantidad-quitar"
                data-id-producto="${escaparHtml(p.idProducto)}">Quitar cantidad</button>
              <button class="carrito-action-btn is-danger" type="button"
                data-accion="quitar-todo"
                data-id-producto="${escaparHtml(p.idProducto)}">Quitar todas</button>
            </div>
          </div>` : ''}
      </article>`;
  }).join('');
}

// ─── EVENTOS LISTA ────────────────────────────────────────────────────────────
function manejarAccionesLista(evento) {
  const btn = evento.target.closest("[data-accion]");
  if (!btn) return;

  const { accion, idProducto } = btn.dataset;
  const resumen = construirResumenCarrito(estado.productos);
  const prod = resumen.productos.find(p => p.idProducto === idProducto);
  if (!prod) return;

  switch (accion) {
    case "abrir-panel-quitar":
      alternarEditorQuitar(idProducto, prod.cantidad);
      renderizarCarrito();
      break;
    case "bajar-cantidad-quitar": {
      const actual = obtenerCantidadQuitarBorrador(idProducto, prod.cantidad);
      guardarCantidadQuitarBorrador(idProducto, actual - 1, prod.cantidad);
      renderizarCarrito();
      break;
    }
    case "subir-cantidad-quitar": {
      const actual = obtenerCantidadQuitarBorrador(idProducto, prod.cantidad);
      guardarCantidadQuitarBorrador(idProducto, actual + 1, prod.cantidad);
      renderizarCarrito();
      break;
    }
    case "aplicar-cantidad-quitar": {
      const cant = obtenerCantidadQuitarBorrador(idProducto, prod.cantidad);
      cerrarEditorQuitar();
      quitarCantidadDelCarrito(idProducto, cant);
      break;
    }
    case "quitar-todo":
      cerrarEditorQuitar();
      quitarProductoDelCarrito(idProducto);
      break;
  }
}

function manejarInputLista(evento) {
  const input = evento.target.closest("[data-input-quitar]");
  if (!input) return;
  const { idProducto } = input.dataset;
  const resumen = construirResumenCarrito(estado.productos);
  const prod = resumen.productos.find(p => p.idProducto === idProducto);
  if (!prod) return;
  const siguiente = normalizarCantidadQuitar(input.value, prod.cantidad);
  guardarCantidadQuitarBorrador(idProducto, siguiente, prod.cantidad);
  input.value = String(siguiente);
}

// ─── CARGA Y ARRANQUE ─────────────────────────────────────────────────────────
async function cargarProductos() {
  try { estado.productos = await obtenerProductos(); }
  catch { estado.productos = []; }
  renderizarCarrito();
}

function vincularEventos() {
  el.listaCarrito.addEventListener("click", manejarAccionesLista);
  el.listaCarrito.addEventListener("input", manejarInputLista);
  el.listaCarrito.addEventListener("change", manejarInputLista);

  el.btnAplicarCupon.addEventListener("click", aplicarCupon);

  el.inputCupon.addEventListener("keydown", (e) => {
    if (e.key === "Enter") aplicarCupon();
  });

  el.botonProceder.addEventListener("click", () => {
    if (!el.botonProceder.disabled) window.location.href = URL_CHECKOUT;
  });
}

function iniciar() {
  // Si el usuario vuelve al carrito sin haber finalizado la compra,
  // descartamos el cupón para que no quede bloqueado/consumido sin pagar.
  sessionStorage.removeItem("cuponAplicado");
  estado.cuponAplicado = null;

  vincularEventos();
  suscribirseAlCarrito(() => renderizarCarrito());
  cargarProductos();
}

iniciar();