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

const URL_CHECKOUT = "/frontend/pages/CheckoutCliente.html";
const URL_CATALOGO = "/frontend/pages/CatalogoCliente.html";
const URL_API      = "http://localhost:8080";

// ─── ESTADO ──────────────────────────────────────────────────────────────────
const estado = {
  productos: [],
  idProductoEditorQuitar: null,
  borradorQuitarPorProducto: {},
  cuponAplicado: null,
  domicilio: null,          // domicilio cargado del servidor
  domicilioEditado: null,   // datos del form antes de guardar
  panelDomicilioAbierto: false,
};

// ─── DOM ─────────────────────────────────────────────────────────────────────
const el = {
  listaCarrito:    document.getElementById("carrito-items"),
  contadorCarrito: document.getElementById("carrito-count"),
  totalCarrito:    document.getElementById("carrito-total"),
  filaDescuento:   document.getElementById("discount-row"),
  descuentoVal:    document.getElementById("summary-discount"),
  filaTotalFinal:  document.getElementById("final-total-row"),
  totalFinal:      document.getElementById("summary-final-total"),
  inputCupon:      document.getElementById("codigo-cupon"),
  btnAplicarCupon: document.getElementById("btn-aplicar-cupon"),
  mensajeCupon:    document.getElementById("coupon-message"),
  botonProceder:   document.getElementById("btn-proceder-pago"),
  // Domicilio
  domicilioPanel:      document.getElementById("domicilio-panel"),
  domicilioTexto:      document.getElementById("domicilio-texto"),
  domicilioSkeleton:   document.getElementById("domicilio-skeleton"),
  btnCambiarDomicilio: document.getElementById("btn-cambiar-domicilio"),
  formDomicilio:       document.getElementById("form-domicilio"),
  domicilioMensaje:    document.getElementById("domicilio-mensaje"),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const esc = (v) => String(v ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function obtenerClienteId() {
  try {
    const raw = localStorage.getItem("clienteLogueado");
    if (!raw) return null;
    const c = JSON.parse(raw);
    return c.id ?? c.idCliente ?? null;
  } catch { return null; }
}

function normalizarCantidadQuitar(valor, max) {
  const n = Number.parseInt(valor, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(n, 1), Math.max(max, 1));
}

// ─── DOMICILIO ────────────────────────────────────────────────────────────────
function formatearDomicilio(d) {
  if (!d) return "Sin domicilio registrado";
  const partes = [`${d.calle} ${d.altura}`];
  if (d.piso)        partes.push(`Piso ${d.piso}`);
  if (d.departamento) partes.push(`Dpto. ${d.departamento}`);
  partes.push(`${d.localidad}, ${d.provincia}`);
  partes.push(`CP ${d.codigoPostal}`);
  return partes.join(" — ");
}

function mostrarDomicilio() {
  el.domicilioSkeleton.style.display = "none";
  el.domicilioTexto.textContent = formatearDomicilio(estado.domicilio);
  el.domicilioTexto.style.display = "block";
}

function mostrarMensajeDomicilio(msg, esError = false) {
  el.domicilioMensaje.textContent = msg;
  el.domicilioMensaje.className = "domicilio-mensaje " + (esError ? "error" : "success");
}

function limpiarMensajeDomicilio() {
  el.domicilioMensaje.textContent = "";
  el.domicilioMensaje.className = "domicilio-mensaje";
}

function rellenarFormDomicilio(d) {
  if (!d || !el.formDomicilio) return;
  const set = (name, val) => {
    const input = el.formDomicilio.querySelector(`[name="${name}"]`);
    if (input) input.value = val ?? "";
  };
  set("calle",        d.calle);
  set("altura",       d.altura);
  set("localidad",    d.localidad);
  set("provincia",    d.provincia);
  set("codigoPostal", d.codigoPostal);
  set("piso",         d.piso ?? "");
  set("departamento", d.departamento ?? "");
}

function abrirFormDomicilio() {
  estado.panelDomicilioAbierto = true;
  rellenarFormDomicilio(estado.domicilio);
  el.formDomicilio.style.display = "flex";
  el.btnCambiarDomicilio.textContent = "Cancelar cambio";
  el.btnCambiarDomicilio.classList.add("is-cancel");
  limpiarMensajeDomicilio();
  // Scroll suave al form
  el.formDomicilio.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function cerrarFormDomicilio() {
  estado.panelDomicilioAbierto = false;
  el.formDomicilio.style.display = "none";
  el.btnCambiarDomicilio.textContent = "Cambiar domicilio";
  el.btnCambiarDomicilio.classList.remove("is-cancel");
  limpiarMensajeDomicilio();
}

async function cargarDomicilio() {
  const idCliente = obtenerClienteId();
  if (!idCliente) {
    el.domicilioSkeleton.style.display = "none";
    el.domicilioTexto.textContent = "Iniciá sesión para ver tu domicilio.";
    el.domicilioTexto.style.display = "block";
    return;
  }

  try {
    const resp = await fetch(`${URL_API}/api/clientes/${idCliente}/domicilio`);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message ?? "Error al cargar el domicilio");
    estado.domicilio = data.data;
    sessionStorage.setItem("domicilioCliente", JSON.stringify(data.data));
  } catch {
    estado.domicilio = null;
  }
  mostrarDomicilio();
}

async function guardarDomicilio(evento) {
  evento.preventDefault();
  limpiarMensajeDomicilio();

  const idCliente = obtenerClienteId();
  if (!idCliente) {
    mostrarMensajeDomicilio("No hay sesión activa.", true);
    return;
  }

  const form = el.formDomicilio;
  const getValue = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim() ?? "";

  const payload = {
    calle:        getValue("calle"),
    altura:       Number(getValue("altura")) || null,
    localidad:    getValue("localidad"),
    provincia:    getValue("provincia"),
    codigoPostal: Number(getValue("codigoPostal")) || null,
    piso:         getValue("piso") ? Number(getValue("piso")) : null,
    departamento: getValue("departamento") || null,
  };

  // Validación mínima en cliente
  const camposObligatorios = ["calle", "localidad", "provincia"];
  for (const campo of camposObligatorios) {
    if (!payload[campo]) {
      mostrarMensajeDomicilio(`El campo "${campo}" es obligatorio.`, true);
      return;
    }
  }
  if (!payload.altura || payload.altura <= 0) {
    mostrarMensajeDomicilio("La altura debe ser un número mayor a 0.", true);
    return;
  }
  if (!payload.codigoPostal || payload.codigoPostal <= 0) {
    mostrarMensajeDomicilio("El código postal debe ser un número mayor a 0.", true);
    return;
  }

  const btnGuardar = form.querySelector("#btn-guardar-domicilio");
  try {
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando…";

    const resp = await fetch(`${URL_API}/api/clientes/${idCliente}/domicilio`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.message ?? "No se pudo actualizar el domicilio.");
    }

    estado.domicilio = data.data;
    sessionStorage.setItem("domicilioCliente", JSON.stringify(data.data));
    mostrarDomicilio();
    mostrarMensajeDomicilio("✓ Domicilio actualizado correctamente");
    setTimeout(() => cerrarFormDomicilio(), 1800);

  } catch (err) {
    mostrarMensajeDomicilio(err.message, true);
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = "Guardar domicilio";
  }
}

// ─── CUPÓN ───────────────────────────────────────────────────────────────────
function mostrarMensajeCupon(msg, esError = false) {
  el.mensajeCupon.textContent = msg;
  el.mensajeCupon.className = "coupon-message " + (esError ? "error" : "success");
}

function actualizarResumenConCupon() {
  const resumen = construirResumenCarrito(estado.productos);
  el.totalCarrito.textContent  = formatearPrecio(resumen.total);
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

function persistirCupon() {
  if (estado.cuponAplicado) {
    sessionStorage.setItem("cuponAplicado", JSON.stringify(estado.cuponAplicado));
  } else {
    sessionStorage.removeItem("cuponAplicado");
  }
}

async function aplicarCupon() {
  const resumen   = construirResumenCarrito(estado.productos);
  const idCliente = obtenerClienteId();
  const codigo    = Number(el.inputCupon.value);

  el.mensajeCupon.textContent = "";
  el.mensajeCupon.className   = "coupon-message";

  if (!idCliente) { mostrarMensajeCupon("Iniciá sesión para usar cupones.", true); return; }
  if (!Number.isInteger(codigo) || codigo <= 0) { mostrarMensajeCupon("Ingresá un código de cupón válido.", true); return; }
  if (resumen.total <= 0) { mostrarMensajeCupon("El carrito está vacío.", true); return; }

  try {
    el.btnAplicarCupon.disabled = true;
    el.btnAplicarCupon.textContent = "Aplicando…";

    const resp = await fetch(`${URL_API}/api/cupones/aplicar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idCliente, codigoCupon: codigo, totalPedido: resumen.total }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.message ?? "No se pudo aplicar el cupón.");

    estado.cuponAplicado = data.data;
    persistirCupon();
    mostrarMensajeCupon(`✓ Cupón aplicado. Ahorrás ${formatearPrecio(data.data.descuentoAplicado)}`);
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

// ─── LISTA DE PRODUCTOS ───────────────────────────────────────────────────────
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

  // Revalidar cupón si el carrito cambió
  if (estado.cuponAplicado) {
    const descuento = Number(estado.cuponAplicado.descuentoAplicado);
    if (resumen.total <= descuento) {
      estado.cuponAplicado = null;
      persistirCupon();
      mostrarMensajeCupon("El cupón fue removido porque el total es menor al descuento.", true);
    } else {
      estado.cuponAplicado = {
        ...estado.cuponAplicado,
        totalOriginal: resumen.total,
        totalFinal: resumen.total - descuento,
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
        <img class="carrito-item-img" src="${esc(p.foto)}" alt="${esc(p.nombre)}" />
        <div class="carrito-item-info">
          <h3 class="carrito-item-name">${esc(p.nombre)}</h3>
          <p class="carrito-item-brand">Marca: ${esc(p.marca || 'BodyPaint')}</p>
          <p class="carrito-item-meta">
            <span class="carrito-item-qty">${p.cantidad} x</span>
            <span class="carrito-item-price">${formatearPrecio(p.precioUnitario)}</span>
          </p>
        </div>
        <div class="carrito-item-right">
          <strong class="carrito-item-subtotal">${formatearPrecio(p.subtotal)}</strong>
          <button class="carrito-trash-toggle ${editorAbierto ? 'is-open' : ''}"
            type="button" data-accion="abrir-panel-quitar"
            data-id-producto="${esc(p.idProducto)}"
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
                  data-accion="bajar-cantidad-quitar" data-id-producto="${esc(p.idProducto)}">−</button>
                <input class="carrito-qty-input" type="number" min="1" max="${p.cantidad}"
                  value="${cantidadQuitar}" inputmode="numeric"
                  data-input-quitar="true" data-id-producto="${esc(p.idProducto)}" />
                <button class="carrito-qty-btn" type="button"
                  data-accion="subir-cantidad-quitar" data-id-producto="${esc(p.idProducto)}">+</button>
              </div>
              <button class="carrito-action-btn" type="button"
                data-accion="aplicar-cantidad-quitar" data-id-producto="${esc(p.idProducto)}">Quitar cantidad</button>
              <button class="carrito-action-btn is-danger" type="button"
                data-accion="quitar-todo" data-id-producto="${esc(p.idProducto)}">Quitar todas</button>
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
      const a = obtenerCantidadQuitarBorrador(idProducto, prod.cantidad);
      guardarCantidadQuitarBorrador(idProducto, a - 1, prod.cantidad);
      renderizarCarrito(); break;
    }
    case "subir-cantidad-quitar": {
      const a = obtenerCantidadQuitarBorrador(idProducto, prod.cantidad);
      guardarCantidadQuitarBorrador(idProducto, a + 1, prod.cantidad);
      renderizarCarrito(); break;
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
  const sig = normalizarCantidadQuitar(input.value, prod.cantidad);
  guardarCantidadQuitarBorrador(idProducto, sig, prod.cantidad);
  input.value = String(sig);
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
  el.inputCupon.addEventListener("keydown", (e) => { if (e.key === "Enter") aplicarCupon(); });

  el.botonProceder.addEventListener("click", () => {
    if (!el.botonProceder.disabled) window.location.href = URL_CHECKOUT;
  });

  // Domicilio
  el.btnCambiarDomicilio.addEventListener("click", () => {
    if (estado.panelDomicilioAbierto) cerrarFormDomicilio();
    else abrirFormDomicilio();
  });

  el.formDomicilio.addEventListener("submit", guardarDomicilio);
}

function iniciar() {
  try {
    const cuponGuardado = sessionStorage.getItem("cuponAplicado");
    if (cuponGuardado) estado.cuponAplicado = JSON.parse(cuponGuardado);
  } catch { /* nada */ }

  vincularEventos();
  suscribirseAlCarrito(() => renderizarCarrito());
  cargarProductos();
  cargarDomicilio();
}

iniciar();
