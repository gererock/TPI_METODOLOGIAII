import {
  construirResumenCarrito,
  suscribirseAlCarrito,
  vaciarCarrito,
} from "/frontend/js/cart-store.js";
import {
  formatearPrecio,
  obtenerProductos,
} from "/frontend/js/productos-api.js";

const URL_PAGINA_CATALOGO      = "/frontend/pages/CatalogoCliente.html";
const DURACION_ANIMACION_PAGO_MS = 180;
const URL_API          = "http://localhost:8080";
const URL_CREAR_PEDIDO = `${URL_API}/api/pedidos/generar`;
const URL_APLICAR_CUPON = `${URL_API}/api/cupones/aplicar`;
const URL_USAR_CUPON   = `${URL_API}/api/cupones/usar`;

const estado = {
  productos: [],
  temporizadorCierrePago: 0,
  cuponAplicado: null,
};

const elementos = {
  listaProductos:    document.getElementById("checkout-items"),
  cantidadResumen:   document.getElementById("summary-items"),
  totalResumen:      document.getElementById("summary-total"),
  botonPagarEfectivo: document.getElementById("cash-payment-btn"),
  overlayPago:       document.getElementById("payment-overlay"),
  tituloPago:        document.getElementById("payment-title"),
  botonCancelarPago: document.getElementById("payment-cancel-btn"),
  botonFinalizarPago: document.getElementById("payment-finish-btn"),
  inputCodigoCupon:  document.getElementById("codigo-cupon"),
  botonAplicarCupon: document.getElementById("btn-aplicar-cupon"),
  mensajeCupon:      document.getElementById("coupon-message"),
  filaDescuento:     document.getElementById("discount-row"),
  descuentoResumen:  document.getElementById("summary-discount"),
  filaTotalFinal:    document.getElementById("final-total-row"),
  totalFinalResumen: document.getElementById("summary-final-total"),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function obtenerClienteId() {
  try {
    const raw = localStorage.getItem("clienteLogueado");
    if (!raw) return null;
    const c = JSON.parse(raw);
    return c.id ?? c.idCliente ?? null;
  } catch { return null; }
}

function obtenerTotalAPagar(resumen) {
  return estado.cuponAplicado ? Number(estado.cuponAplicado.totalFinal) : Number(resumen.total);
}

// ─── CUPÓN ───────────────────────────────────────────────────────────────────
function mostrarMensajeCupon(mensaje, esError = false) {
  if (!elementos.mensajeCupon) return;
  elementos.mensajeCupon.textContent = mensaje;
  elementos.mensajeCupon.classList.remove("success", "error");
  elementos.mensajeCupon.classList.add(esError ? "error" : "success");
}

function limpiarMensajeCupon() {
  if (!elementos.mensajeCupon) return;
  elementos.mensajeCupon.textContent = "";
  elementos.mensajeCupon.classList.remove("success", "error");
}

function renderizarResumenCupon() {
  if (!elementos.filaDescuento || !elementos.filaTotalFinal) return;
  if (!estado.cuponAplicado) {
    elementos.filaDescuento.style.display = "none";
    elementos.filaTotalFinal.style.display = "none";
    return;
  }
  elementos.filaDescuento.style.display = "flex";
  elementos.filaTotalFinal.style.display = "flex";
  elementos.descuentoResumen.textContent = `-${formatearPrecio(estado.cuponAplicado.descuentoAplicado)}`;
  elementos.totalFinalResumen.textContent = formatearPrecio(estado.cuponAplicado.totalFinal);
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderizarCheckout() {
  const resumen = construirResumenCarrito(estado.productos);
  const totalAPagar = obtenerTotalAPagar(resumen);

  elementos.cantidadResumen.textContent = String(resumen.totalUnidades);
  elementos.totalResumen.textContent    = formatearPrecio(resumen.total);
  elementos.tituloPago.textContent      = `Monto a pagar: ${formatearPrecio(totalAPagar)}`;
  elementos.botonPagarEfectivo.disabled = resumen.totalUnidades === 0;

  renderizarResumenCupon();

  if (!resumen.productos.length) {
    elementos.listaProductos.innerHTML = `
      <div class="checkout-empty">
        <strong>Tu carrito ya no tiene productos</strong>
        <p>Podés volver al catálogo para seguir comprando.</p>
        <a class="btn-outline" href="${URL_PAGINA_CATALOGO}">Volver al catálogo</a>
      </div>`;
    return;
  }

  elementos.listaProductos.innerHTML = resumen.productos.map((p) => `
    <article class="checkout-item">
      <img class="checkout-item-image" src="${escaparHtml(p.foto || "")}" alt="${escaparHtml(p.nombre)}" />
      <div>
        <h3 class="checkout-item-name">${escaparHtml(p.nombre)}</h3>
        <p class="checkout-item-brand">Marca: ${escaparHtml(p.marca || "BodyPaint")}</p>
        <p class="checkout-item-description">${escaparHtml(p.descripcion || "Sin descripción disponible.")}</p>
        <p class="checkout-item-meta">
          <span class="checkout-item-qty">${p.cantidad} x</span>
          <span class="checkout-item-unit-price">${formatearPrecio(p.precioUnitario)}</span>
        </p>
      </div>
      <div class="checkout-item-total">
        <strong>${formatearPrecio(p.subtotal)}</strong>
      </div>
    </article>`).join("");
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function abrirModalPago() {
  elementos.overlayPago.hidden = false;
  elementos.overlayPago.getBoundingClientRect();
  elementos.overlayPago.classList.add("is-open");
  document.body.classList.add("body-locked");
}

function cerrarModalPago(inmediato = false) {
  elementos.overlayPago.classList.remove("is-open");
  document.body.classList.remove("body-locked");
  if (inmediato) { elementos.overlayPago.hidden = true; return; }
  window.clearTimeout(estado.temporizadorCierrePago);
  estado.temporizadorCierrePago = window.setTimeout(() => {
    elementos.overlayPago.hidden = true;
  }, DURACION_ANIMACION_PAGO_MS);
}

// ─── DOMICILIO ────────────────────────────────────────────────────────────────
async function cargarDomicilioCheckout() {
  const skeletonEl = document.getElementById("domicilio-skeleton-checkout");
  const textoEl    = document.getElementById("domicilio-texto-checkout");
  if (!skeletonEl || !textoEl) return;

  function formatear(d) {
    const partes = [`${d.calle} ${d.altura}`];
    if (d.piso)         partes.push(`Piso ${d.piso}`);
    if (d.departamento) partes.push(`Dpto. ${d.departamento}`);
    partes.push(`${d.localidad}, ${d.provincia}`);
    partes.push(`CP ${d.codigoPostal}`);
    return partes.join(" — ");
  }

  function mostrar(d) {
    textoEl.textContent   = d ? formatear(d) : "No se pudo cargar el domicilio.";
    skeletonEl.style.display = "none";
    textoEl.style.display    = "block";
  }

  // 1. sessionStorage — instantáneo, sin red
  try {
    const guardado = sessionStorage.getItem("domicilioCliente");
    if (guardado) { mostrar(JSON.parse(guardado)); return; }
  } catch { /* sigue */ }

  // 2. Fallback fetch (entró directo al checkout sin pasar por el carrito)
  const idCliente = obtenerClienteId();
  if (!idCliente) { mostrar(null); return; }

  try {
    const resp = await fetch(`${URL_API}/api/clientes/${idCliente}/domicilio`);
    const data = await resp.json();
    if (!resp.ok) throw new Error();
    sessionStorage.setItem("domicilioCliente", JSON.stringify(data.data));
    mostrar(data.data);
  } catch {
    mostrar(null);
  }
}

// ─── CUPÓN: APLICAR ───────────────────────────────────────────────────────────
async function aplicarCupon() {
  const resumen   = construirResumenCarrito(estado.productos);
  const idCliente = obtenerClienteId();
  const codigo    = Number(elementos.inputCodigoCupon.value);

  limpiarMensajeCupon();

  if (!idCliente) { mostrarMensajeCupon("No se encontró el cliente logueado.", true); return; }
  if (!Number.isInteger(codigo) || codigo <= 0) { mostrarMensajeCupon("Ingresá un código de cupón válido.", true); return; }
  if (resumen.total <= 0) { mostrarMensajeCupon("El total del pedido debe ser mayor a 0.", true); return; }

  try {
    elementos.botonAplicarCupon.disabled = true;
    elementos.botonAplicarCupon.textContent = "Aplicando...";

    const resp = await fetch(URL_APLICAR_CUPON, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idCliente, codigoCupon: codigo, totalPedido: resumen.total }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.message ?? data.error ?? "No se pudo aplicar el cupón.");

    estado.cuponAplicado = data.data;
    mostrarMensajeCupon(`Cupón aplicado. Descuento: ${formatearPrecio(data.data.descuentoAplicado)}`);
    renderizarCheckout();
  } catch (error) {
    estado.cuponAplicado = null;
    renderizarCheckout();
    mostrarMensajeCupon(error.message, true);
  } finally {
    elementos.botonAplicarCupon.disabled = false;
    elementos.botonAplicarCupon.textContent = "Aplicar";
  }
}

// ─── CUPÓN: MARCAR COMO USADO ─────────────────────────────────────────────────
async function marcarCuponComoUsado() {
  if (!estado.cuponAplicado) return;
  const idCliente = obtenerClienteId();
  if (!idCliente) throw new Error("No se encontró el cliente para marcar el cupón como usado.");

  const resp = await fetch(URL_USAR_CUPON, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idCliente, codigoCupon: estado.cuponAplicado.codigoCupon }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.message ?? data.error ?? "No se pudo marcar el cupón como usado.");
  return data;
}

// ─── PEDIDO ───────────────────────────────────────────────────────────────────
function construirDiccionarioProductosPedido() {
  const resumen = construirResumenCarrito(estado.productos);
  const productos = {};
  resumen.productos.forEach((p) => { productos[p.idProducto] = p.cantidad; });
  return productos;
}

async function enviarPedidoAlBackend() {
  const resumen     = construirResumenCarrito(estado.productos);
  const idCliente   = obtenerClienteId();
  const totalAPagar = obtenerTotalAPagar(resumen);

  if (!idCliente) throw new Error("No se encontró el cliente que realiza el pedido.");

  const resp = await fetch(URL_CREAR_PEDIDO, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_cliente: idCliente, total: totalAPagar, productos: construirDiccionarioProductosPedido() }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.message ?? data.error ?? `Error ${resp.status}`);
  alert(data.message);
  return data;
}

// ─── CARGA INICIAL ────────────────────────────────────────────────────────────
async function cargarProductos() {
  try { estado.productos = await obtenerProductos(); }
  catch (error) { console.error("[checkout] No se pudieron cargar los productos.", error); estado.productos = []; }
  renderizarCheckout();
}

// ─── EVENTOS ──────────────────────────────────────────────────────────────────
function vincularEventos() {
  elementos.botonPagarEfectivo.addEventListener("click", () => {
    if (!elementos.botonPagarEfectivo.disabled) abrirModalPago();
  });

  if (elementos.botonAplicarCupon) {
    elementos.botonAplicarCupon.addEventListener("click", aplicarCupon);
  }

  elementos.botonCancelarPago.addEventListener("click", () => cerrarModalPago());

  elementos.botonFinalizarPago.addEventListener("click", async () => {
    const resumen = construirResumenCarrito(estado.productos);
    if (!resumen.productos.length) { cerrarModalPago(); renderizarCheckout(); return; }
    try {
      elementos.botonFinalizarPago.disabled = true;
      elementos.botonFinalizarPago.textContent = "Procesando...";
      await enviarPedidoAlBackend();
      await marcarCuponComoUsado();
      vaciarCarrito();
      sessionStorage.removeItem("cuponAplicado");
      sessionStorage.removeItem("domicilioCliente");
      cerrarModalPago(true);
      window.location.href = URL_PAGINA_CATALOGO;
    } catch (error) {
      console.error("[checkout] No se pudo crear el pedido.", error);
      alert(`No se pudo finalizar el pedido: ${error.message}`);
    } finally {
      elementos.botonFinalizarPago.disabled = false;
      elementos.botonFinalizarPago.textContent = "Pago finalizado";
    }
  });

  elementos.overlayPago.addEventListener("click", (e) => {
    if (e.target === elementos.overlayPago) cerrarModalPago();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !elementos.overlayPago.hidden) cerrarModalPago();
  });
}

// ─── ARRANQUE ─────────────────────────────────────────────────────────────────
function iniciar() {
  try {
    const cuponGuardado = sessionStorage.getItem("cuponAplicado");
    if (cuponGuardado) estado.cuponAplicado = JSON.parse(cuponGuardado);
  } catch { /* nada */ }

  vincularEventos();
  suscribirseAlCarrito(() => renderizarCheckout());
  cargarProductos();
  cargarDomicilioCheckout();
}

iniciar();
