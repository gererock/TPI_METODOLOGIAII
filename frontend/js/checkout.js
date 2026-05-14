import {
  construirResumenCarrito,
  suscribirseAlCarrito,
  vaciarCarrito,
} from "/frontend/js/cart-store.js";
import {
  formatearPrecio,
  obtenerProductos,
} from "/frontend/js/productos-api.js";

// Rutas y tiempos de animacion del checkout.
const URL_PAGINA_CATALOGO = "/frontend/pages/CatalogoCliente.html";
const DURACION_ANIMACION_PAGO_MS = 180;
const URL_API = "http://localhost:8080";
const URL_CREAR_PEDIDO = `${URL_API}/api/pedidos/generar`;


// Estado de esta pantalla y referencias del modal de pago.
const estado = {
  productos: [],
  temporizadorCierrePago: 0,
};

const elementos = {
  listaProductos: document.getElementById("checkout-items"),
  cantidadResumen: document.getElementById("summary-items"),
  totalResumen: document.getElementById("summary-total"),
  botonPagarEfectivo: document.getElementById("cash-payment-btn"),
  overlayPago: document.getElementById("payment-overlay"),
  tituloPago: document.getElementById("payment-title"),
  botonCancelarPago: document.getElementById("payment-cancel-btn"),
  botonFinalizarPago: document.getElementById("payment-finish-btn"),
};

// Helper para pintar contenido seguro dentro del resumen.
function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Render de la pagina final de compra usando el mismo resumen del carrito.
function renderizarCheckout() {
  const resumen = construirResumenCarrito(estado.productos);

  elementos.cantidadResumen.textContent = String(resumen.totalUnidades);
  elementos.totalResumen.textContent = formatearPrecio(resumen.total);
  elementos.tituloPago.textContent = `Monto a pagar: ${formatearPrecio(resumen.total)}`;
  elementos.botonPagarEfectivo.disabled = resumen.totalUnidades === 0;

  if (!resumen.productos.length) {
    elementos.listaProductos.innerHTML = `
      <div class="checkout-empty">
        <strong>Tu carrito ya no tiene productos</strong>
        <p>Puedes volver al catalogo para seguir comprando o revisar otro pedido.</p>
        <a class="btn-outline" href="${URL_PAGINA_CATALOGO}">Volver al catalogo</a>
      </div>
    `;
    return;
  }

  elementos.listaProductos.innerHTML = resumen.productos
    .map((producto) => `
      <article class="checkout-item">
        <img
          class="checkout-item-image"
          src="${escaparHtml(producto.foto || "")}"
          alt="${escaparHtml(producto.nombre)}"
        />

        <div>
          <h3 class="checkout-item-name">${escaparHtml(producto.nombre)}</h3>
          <p class="checkout-item-brand">Marca: ${escaparHtml(producto.marca || "BodyPaint")}</p>
          <p class="checkout-item-description">${escaparHtml(producto.descripcion || "Sin descripcion disponible.")}</p>
          <p class="checkout-item-meta">
            <span class="checkout-item-qty">${producto.cantidad} x</span>
            <span class="checkout-item-unit-price">${formatearPrecio(producto.precioUnitario)}</span>
          </p>
        </div>

        <div class="checkout-item-total">
          <strong>${formatearPrecio(producto.subtotal)}</strong>
        </div>
      </article>
    `)
    .join("");
}

// Control de apertura y cierre del modal de pago.
function abrirModalPago() {
  window.clearTimeout(estado.temporizadorCierrePago);
  elementos.overlayPago.hidden = false;
  requestAnimationFrame(() => elementos.overlayPago.classList.add("is-open"));
  document.body.classList.add("body-locked");
}

function cerrarModalPago(inmediato = false) {
  elementos.overlayPago.classList.remove("is-open");

  const finalizarCierre = () => {
    elementos.overlayPago.hidden = true;
    document.body.classList.remove("body-locked");
  };

  if (inmediato) {
    finalizarCierre();
    return;
  }

  window.clearTimeout(estado.temporizadorCierrePago);
  estado.temporizadorCierrePago = window.setTimeout(() => {
    if (!elementos.overlayPago.classList.contains("is-open")) {
      finalizarCierre();
    }
  }, DURACION_ANIMACION_PAGO_MS);
}

async function cargarProductos() {
  try {
    estado.productos = await obtenerProductos();
  } catch (error) {
    console.error("[checkout] No se pudieron cargar los productos.", error);
    estado.productos = [];
  }

  renderizarCheckout();
}
function obtenerClienteId() {
  const clienteGuardado = localStorage.getItem("cliente");

  if (!clienteGuardado) {
    return null;
  }

  try {
    const cliente = JSON.parse(clienteGuardado);
    return cliente.id ?? cliente.idCliente ?? null;
  } catch {
    return null;
  }
}

function construirDiccionarioProductosPedido() {
  const resumen = construirResumenCarrito(estado.productos);

  const productos = {};

  resumen.productos.forEach((producto) => {
    productos[producto.idProducto] = producto.cantidad;
  });

  return productos;
}

async function enviarPedidoAlBackend() {
  const resumen = construirResumenCarrito(estado.productos);
  const productos = construirDiccionarioProductosPedido();
  const idCliente = obtenerClienteId();


  if (!idCliente) {
    throw new Error("No se encontro el cliente que realiza el pedido.");
  }

  const pedido = {
    idCliente: idCliente,
    total: resumen.total,
    productos: productos,
  };

  const respuesta = await fetch(URL_CREAR_PEDIDO, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });

  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const mensaje = data.message ?? data.error ?? `Error ${respuesta.status}`;
    throw new Error(mensaje);
  }

  alert(data.message)

  return data;
}
// Eventos del resumen y del modal de pago en efectivo.
function vincularEventos() {
  elementos.botonPagarEfectivo.addEventListener("click", () => {
    if (!elementos.botonPagarEfectivo.disabled) {
      abrirModalPago();
    }
  });

  elementos.botonCancelarPago.addEventListener("click", () => cerrarModalPago());

elementos.botonFinalizarPago.addEventListener("click", async () => {
  const resumen = construirResumenCarrito(estado.productos);

  if (!resumen.productos.length) {
    cerrarModalPago();
    renderizarCheckout();
    return;
  }


  try {
    elementos.botonFinalizarPago.disabled = true;
    elementos.botonFinalizarPago.textContent = "Procesando...";

    await enviarPedidoAlBackend();

    vaciarCarrito();

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

  elementos.overlayPago.addEventListener("click", (evento) => {
    if (evento.target === elementos.overlayPago) {
      cerrarModalPago();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !elementos.overlayPago.hidden) {
      cerrarModalPago();
    }
  });
}

function iniciar() {
  vincularEventos();
  suscribirseAlCarrito(() => renderizarCheckout());
  cargarProductos();
}

iniciar();
