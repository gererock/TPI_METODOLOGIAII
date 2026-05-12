import {
  agregarCantidadAlCarrito,
  construirResumenCarrito,
  obtenerStockDisponible,
  quitarCantidadDelCarrito,
  quitarProductoDelCarrito,
  suscribirseAlCarrito,
} from "/frontend/js/cart-store.js";
import {
  formatearPrecio,
  obtenerIdProducto,
  obtenerProductos,
} from "/frontend/js/productos-api.js";

// Rutas y tiempos de animacion usados por esta pantalla.
const URL_PAGINA_CHECKOUT = "/frontend/pages/CarritoCliente.html";
const DURACION_ANIMACION_CARRITO_MS = 180;
const DURACION_ANIMACION_MODAL_MS = 180;

// Estado general del catalogo, del modal de producto y del carrito flotante.
const estado = {
  productos: [],
  estadoCatalogo: "inicial",
  textoBusqueda: "",
  idProductoActivo: null,
  carritoAbierto: false,
  temporizadorCierreCarrito: 0,
  temporizadorCierreModal: 0,
  idProductoEditorQuitar: null,
  borradorQuitarPorProducto: {},
  cantidadBorradorAgregar: 1,
};

// Referencias al DOM para no repetir busquedas en toda la pantalla.
const elementos = {
  inputBusqueda: document.getElementById("search"),
  botonLimpiarBusqueda: document.getElementById("clear-btn"),
  grillaCatalogo: document.getElementById("catalog-grid"),
  botonCarrito: document.getElementById("cart-toggle"),
  contadorCarrito: document.getElementById("cart-count"),
  panelCarrito: document.getElementById("cart-panel"),
  botonCerrarCarrito: document.getElementById("cart-close"),
  listaCarrito: document.getElementById("cart-items"),
  totalCarrito: document.getElementById("cart-total"),
  botonContinuar: document.getElementById("cart-continue"),
  overlayModal: document.getElementById("modal-overlay"),
  imagenModal: document.getElementById("modal-img"),
  marcaModal: document.getElementById("modal-brand"),
  tituloModal: document.getElementById("modal-title"),
  descripcionModal: document.getElementById("modal-desc"),
  stockModal: document.getElementById("modal-stock"),
  precioModal: document.getElementById("modal-price"),
  botonCerrarModal: document.getElementById("modal-close"),
  botonCancelarModal: document.getElementById("modal-close-secondary"),
  botonBajarCantidadModal: document.getElementById("modal-qty-decrease"),
  inputCantidadModal: document.getElementById("modal-qty-input"),
  botonSubirCantidadModal: document.getElementById("modal-qty-increase"),
  botonAgregarModal: document.getElementById("modal-add"),
};

// Helpers de texto para pintar contenido seguro dentro del HTML.
function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escaparRegex(valor) {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resaltarTexto(texto, textoBusqueda) {
  const textoSeguro = escaparHtml(texto);
  const terminoNormalizado = textoBusqueda.trim();

  if (!terminoNormalizado) {
    return textoSeguro;
  }

  return textoSeguro.replace(
    new RegExp(`(${escaparRegex(escaparHtml(terminoNormalizado))})`, "gi"),
    '<span class="hl">$1</span>',
  );
}

// Utilidades de busqueda y de borradores de cantidad.
function obtenerProductosFiltrados() {
  const terminoBusqueda = estado.textoBusqueda.trim().toLowerCase();

  if (!terminoBusqueda) {
    return estado.productos;
  }

  return estado.productos.filter((producto) => {
    const textoProducto = [
      producto.nombre,
      producto.marca,
      producto.descripcion,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return textoProducto.includes(terminoBusqueda);
  });
}

function buscarProductoPorId(idProducto) {
  return estado.productos.find(
    (producto) => obtenerIdProducto(producto) === String(idProducto),
  ) ?? null;
}

function obtenerProductoResumenCarrito(idProducto) {
  return construirResumenCarrito(estado.productos).productos.find(
    (producto) => producto.idProducto === String(idProducto),
  ) ?? null;
}

function normalizarCantidadQuitar(valor, cantidadMaxima) {
  const cantidadParseada = Number.parseInt(valor, 10);

  if (!Number.isFinite(cantidadParseada)) {
    return 1;
  }

  return Math.min(Math.max(cantidadParseada, 1), Math.max(cantidadMaxima, 1));
}

function obtenerCantidadQuitarBorrador(idProducto, cantidadMaxima) {
  const idNormalizado = String(idProducto);
  const cantidadBorrador = estado.borradorQuitarPorProducto[idNormalizado];
  const cantidadNormalizada = normalizarCantidadQuitar(cantidadBorrador, cantidadMaxima);

  estado.borradorQuitarPorProducto[idNormalizado] = cantidadNormalizada;
  return cantidadNormalizada;
}

function guardarCantidadQuitarBorrador(idProducto, valor, cantidadMaxima) {
  estado.borradorQuitarPorProducto[String(idProducto)] =
    normalizarCantidadQuitar(valor, cantidadMaxima);
}

function normalizarCantidadAgregar(valor, stockDisponible) {
  const cantidadParseada = Number.parseInt(valor, 10);

  if (stockDisponible <= 0) {
    return 0;
  }

  if (!Number.isFinite(cantidadParseada)) {
    return 1;
  }

  return Math.min(Math.max(cantidadParseada, 1), stockDisponible);
}

function guardarCantidadAgregarBorrador(valor, stockDisponible) {
  estado.cantidadBorradorAgregar = normalizarCantidadAgregar(valor, stockDisponible);
}

function cerrarEditorQuitar() {
  estado.idProductoEditorQuitar = null;
}

function alternarEditorQuitar(idProducto, cantidadMaxima) {
  const idNormalizado = String(idProducto);

  if (estado.idProductoEditorQuitar === idNormalizado) {
    cerrarEditorQuitar();
    return;
  }

  estado.idProductoEditorQuitar = idNormalizado;
  guardarCantidadQuitarBorrador(
    idNormalizado,
    estado.borradorQuitarPorProducto[idNormalizado] ?? 1,
    cantidadMaxima,
  );
}

function actualizarVisibilidadBotonLimpiar() {
  elementos.botonLimpiarBusqueda.style.display = estado.textoBusqueda ? "block" : "none";
}

// Estados vacios y mensajes generales del catalogo.
function crearEstadoVacio(icono, titulo, mensaje, mostrarBotonReinicio = false) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icono}</div>
      <p class="empty-title">${titulo}</p>
      <p class="empty-msg">${mensaje}</p>
      ${
        mostrarBotonReinicio
          ? '<button class="empty-reset" id="reiniciar-busqueda-btn" type="button">Limpiar busqueda</button>'
          : ""
      }
    </div>
  `;
}

function mostrarErrorGrilla(mensaje) {
  elementos.grillaCatalogo.innerHTML = crearEstadoVacio(
    "&#9888;",
    "Ocurrio un error",
    escaparHtml(mensaje),
    false,
  );
}

// Render principal de tarjetas del catalogo.
function renderizarCatalogo() {
  const productosFiltrados = obtenerProductosFiltrados();

  if (!productosFiltrados.length) {
    const hayBusqueda = Boolean(estado.textoBusqueda.trim());
    const titulo = hayBusqueda ? "Sin resultados" : "No hay productos";
    const mensaje = hayBusqueda
      ? "No encontramos productos con ese texto."
      : "Todavia no hay productos cargados en el catalogo.";

    elementos.grillaCatalogo.innerHTML = crearEstadoVacio(
      "&#128269;",
      titulo,
      mensaje,
      hayBusqueda,
    );

    document
      .getElementById("reiniciar-busqueda-btn")
      ?.addEventListener("click", reiniciarBusqueda);
    return;
  }

  elementos.grillaCatalogo.innerHTML = productosFiltrados
    .map((producto) => {
      const idProducto = obtenerIdProducto(producto);
      const stockDisponible = obtenerStockDisponible(producto);
      const puedeAgregar = stockDisponible > 0;

      return `
        <article
          class="card"
          data-id-producto="${escaparHtml(idProducto)}"
          data-puede-agregar="${puedeAgregar ? "true" : "false"}"
          tabindex="0"
          aria-label="${
            puedeAgregar
              ? `Agregar ${escaparHtml(producto.nombre)} al carrito`
              : `${escaparHtml(producto.nombre)} sin stock`
          }"
        >
          <div class="card-img-wrap">
            <img class="card-img" src="${escaparHtml(producto.foto || "")}" alt="${escaparHtml(producto.nombre)}" loading="lazy" />
          </div>

          <div class="card-body">
            <h2 class="card-name">${resaltarTexto(producto.nombre, estado.textoBusqueda)}</h2>
            <p class="card-brand">Marca: ${escaparHtml(producto.marca || "BodyPaint")}</p>
            <p class="card-desc">${resaltarTexto(producto.descripcion || "Sin descripcion disponible.", estado.textoBusqueda)}</p>

            <div class="card-footer">
              <span class="card-price">${formatearPrecio(producto.precio)}</span>
              <button class="card-btn" type="button" data-accion="agregar" ${puedeAgregar ? "" : "disabled"}>
                ${puedeAgregar ? "Agregar al carrito" : "Sin stock"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// Render del carrito flotante que se abre desde la navbar.
function renderizarCarrito() {
  const resumen = construirResumenCarrito(estado.productos);

  if (!resumen.productos.some((producto) => producto.idProducto === estado.idProductoEditorQuitar)) {
    cerrarEditorQuitar();
  }

  elementos.contadorCarrito.textContent = String(resumen.totalUnidades);
  elementos.totalCarrito.textContent = formatearPrecio(resumen.total);
  elementos.botonContinuar.disabled = resumen.totalUnidades === 0;

  if (!resumen.productos.length) {
    elementos.listaCarrito.innerHTML = `
      <div class="cart-empty">
        <strong>Tu carrito esta vacio</strong>
        Agrega productos desde el catalogo para continuar con la compra.
      </div>
    `;
    return;
  }

  elementos.listaCarrito.innerHTML = resumen.productos
    .map((producto) => {
      const editorQuitarAbierto = estado.idProductoEditorQuitar === producto.idProducto;
      const cantidadQuitar = obtenerCantidadQuitarBorrador(
        producto.idProducto,
        producto.cantidad,
      );

      return `
        <article class="cart-item">
          <div class="cart-item-top">
            <div>
              <h3 class="cart-item-name">${escaparHtml(producto.nombre)}</h3>
              <p class="cart-item-brand">Marca: ${escaparHtml(producto.marca || "BodyPaint")}</p>
            </div>
            <button
              class="cart-trash-toggle ${editorQuitarAbierto ? "is-open" : ""}"
              type="button"
              data-accion="abrir-panel-quitar"
              data-id-producto="${escaparHtml(producto.idProducto)}"
              aria-label="Abrir opciones para quitar unidades"
              aria-expanded="${editorQuitarAbierto ? "true" : "false"}"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"></path>
                <path d="M8 6V4h8v2"></path>
                <path d="M19 6l-1 14H6L5 6"></path>
                <path d="M10 11v5"></path>
                <path d="M14 11v5"></path>
              </svg>
            </button>
          </div>

          <p class="cart-item-meta">
            <span class="cart-item-qty">${producto.cantidad} x</span>
            <span class="cart-item-unit-price">${formatearPrecio(producto.precioUnitario)}</span>
          </p>

          <div class="cart-item-summary">
            <div class="cart-item-subtotal-wrap">
              <span class="cart-item-subtotal-label">Total producto</span>
              <span class="cart-item-subtotal">${formatearPrecio(producto.subtotal)}</span>
            </div>
          </div>

          ${
            editorQuitarAbierto
              ? `
                <div class="cart-remove-panel">
                  <p class="cart-remove-title">Selecciona cuantas unidades quieres quitar</p>

                  <div class="cart-remove-actions">
                    <div class="cart-qty-stepper">
                      <button
                        class="cart-qty-btn"
                        type="button"
                        data-accion="bajar-cantidad-quitar"
                        data-id-producto="${escaparHtml(producto.idProducto)}"
                        aria-label="Bajar cantidad a quitar"
                      >
                        -
                      </button>

                      <input
                        class="cart-qty-input"
                        type="number"
                        min="1"
                        max="${producto.cantidad}"
                        value="${cantidadQuitar}"
                        inputmode="numeric"
                        data-input-quitar="true"
                        data-id-producto="${escaparHtml(producto.idProducto)}"
                        aria-label="Cantidad de unidades a quitar"
                      />

                      <button
                        class="cart-qty-btn"
                        type="button"
                        data-accion="subir-cantidad-quitar"
                        data-id-producto="${escaparHtml(producto.idProducto)}"
                        aria-label="Subir cantidad a quitar"
                      >
                        +
                      </button>
                    </div>

                    <button
                      class="cart-action-btn"
                      type="button"
                      data-accion="aplicar-cantidad-quitar"
                      data-id-producto="${escaparHtml(producto.idProducto)}"
                    >
                      Quitar cantidad
                    </button>

                    <button
                      class="cart-action-btn is-danger"
                      type="button"
                      data-accion="quitar-todo"
                      data-id-producto="${escaparHtml(producto.idProducto)}"
                    >
                      Quitar todas
                    </button>
                  </div>
                </div>
              `
              : ""
          }
        </article>
      `;
    })
    .join("");
}

// Sincroniza el modal de detalle con el producto activo y el stock real.
function sincronizarModalProducto() {
  if (!estado.idProductoActivo) {
    return;
  }

  const producto = buscarProductoPorId(estado.idProductoActivo);

  if (!producto) {
    cerrarModalProducto(true);
    return;
  }

  const stockDisponible = obtenerStockDisponible(producto);
  guardarCantidadAgregarBorrador(estado.cantidadBorradorAgregar, stockDisponible);

  elementos.imagenModal.src = producto.foto ?? "";
  elementos.imagenModal.alt = producto.nombre ?? "Producto";
  elementos.tituloModal.textContent = producto.nombre ?? "Producto";
  elementos.marcaModal.textContent = `Marca: ${producto.marca || "BodyPaint"}`;
  elementos.descripcionModal.textContent =
    producto.descripcion || "Sin descripcion disponible.";
  elementos.precioModal.textContent = formatearPrecio(producto.precio);
  elementos.stockModal.textContent = stockDisponible === 0
    ? "Sin stock"
    : `Disponible: ${stockDisponible} ${stockDisponible === 1 ? "unidad" : "unidades"}`;
  elementos.stockModal.className = stockDisponible === 0 ? "modal-stock is-empty" : "modal-stock";
  elementos.inputCantidadModal.max = String(Math.max(stockDisponible, 1));
  elementos.inputCantidadModal.value = String(estado.cantidadBorradorAgregar);
  elementos.inputCantidadModal.disabled = stockDisponible === 0;
  elementos.botonBajarCantidadModal.disabled =
    stockDisponible === 0 || estado.cantidadBorradorAgregar <= 1;
  elementos.botonSubirCantidadModal.disabled =
    stockDisponible === 0 || estado.cantidadBorradorAgregar >= stockDisponible;
  elementos.botonAgregarModal.disabled = stockDisponible === 0;
  elementos.botonAgregarModal.textContent = stockDisponible === 0 ? "Sin stock" : "Agregar";
}

function abrirModalProducto(idProducto) {
  window.clearTimeout(estado.temporizadorCierreModal);
  estado.idProductoActivo = String(idProducto);
  estado.cantidadBorradorAgregar = 1;
  sincronizarModalProducto();
  elementos.overlayModal.hidden = false;
  requestAnimationFrame(() => elementos.overlayModal.classList.add("is-open"));
  document.body.classList.add("body-locked");
}

function cerrarModalProducto(inmediato = false) {
  estado.idProductoActivo = null;
  elementos.overlayModal.classList.remove("is-open");

  const finalizarCierre = () => {
    elementos.overlayModal.hidden = true;
    document.body.classList.remove("body-locked");
  };

  if (inmediato) {
    finalizarCierre();
    return;
  }

  window.clearTimeout(estado.temporizadorCierreModal);
  estado.temporizadorCierreModal = window.setTimeout(() => {
    if (!elementos.overlayModal.classList.contains("is-open")) {
      finalizarCierre();
    }
  }, DURACION_ANIMACION_MODAL_MS);
}

// Apertura y cierre del panel del carrito en la misma pagina.
function abrirPanelCarrito() {
  window.clearTimeout(estado.temporizadorCierreCarrito);
  estado.carritoAbierto = true;
  elementos.panelCarrito.hidden = false;
  elementos.botonCarrito.setAttribute("aria-expanded", "true");
  elementos.panelCarrito.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => elementos.panelCarrito.classList.add("is-open"));
}

function cerrarPanelCarrito() {
  window.clearTimeout(estado.temporizadorCierreCarrito);
  estado.carritoAbierto = false;
  elementos.botonCarrito.setAttribute("aria-expanded", "false");
  elementos.panelCarrito.setAttribute("aria-hidden", "true");
  elementos.panelCarrito.classList.remove("is-open");
  estado.temporizadorCierreCarrito = window.setTimeout(() => {
    if (!estado.carritoAbierto) {
      elementos.panelCarrito.hidden = true;
    }
  }, DURACION_ANIMACION_CARRITO_MS);
}

function alternarPanelCarrito() {
  if (estado.carritoAbierto) {
    cerrarPanelCarrito();
    return;
  }

  abrirPanelCarrito();
}

// Recarga visual del catalogo cuando cambia la busqueda.
function reiniciarBusqueda() {
  estado.textoBusqueda = "";
  elementos.inputBusqueda.value = "";
  actualizarVisibilidadBotonLimpiar();
  renderizarCatalogo();
}

async function cargarProductos() {
  try {
    estado.productos = await obtenerProductos();
    estado.estadoCatalogo = "listo";
    renderizarCatalogo();
    renderizarCarrito();
    sincronizarModalProducto();
  } catch (error) {
    estado.estadoCatalogo = "error";
    console.error("[catalogo] No se pudieron cargar los productos.", error);
    mostrarErrorGrilla(error.message);
    renderizarCarrito();
  }
}

// Interacciones del usuario sobre tarjetas, carrito y modal.
function manejarInteraccionGrilla(evento) {
  const tarjeta = evento.target.closest(".card");
  if (!tarjeta) {
    return;
  }

  if (tarjeta.dataset.puedeAgregar !== "true") {
    return;
  }

  abrirModalProducto(tarjeta.dataset.idProducto);
}

function manejarTecladoGrilla(evento) {
  if (evento.key !== "Enter" && evento.key !== " ") {
    return;
  }

  const tarjeta = evento.target.closest(".card");
  if (!tarjeta) {
    return;
  }

  if (tarjeta.dataset.puedeAgregar !== "true") {
    return;
  }

  evento.preventDefault();
  abrirModalProducto(tarjeta.dataset.idProducto);
}

function manejarAccionesCarrito(evento) {
  const botonAccion = evento.target.closest("[data-accion]");
  if (!botonAccion) {
    return;
  }

  const { accion, idProducto } = botonAccion.dataset;
  const productoCarrito = obtenerProductoResumenCarrito(idProducto);

  if (!productoCarrito) {
    return;
  }

  switch (accion) {
    case "abrir-panel-quitar":
      alternarEditorQuitar(idProducto, productoCarrito.cantidad);
      renderizarCarrito();
      return;
    case "bajar-cantidad-quitar": {
      const cantidadActual = obtenerCantidadQuitarBorrador(idProducto, productoCarrito.cantidad);
      guardarCantidadQuitarBorrador(idProducto, cantidadActual - 1, productoCarrito.cantidad);
      renderizarCarrito();
      return;
    }
    case "subir-cantidad-quitar": {
      const cantidadActual = obtenerCantidadQuitarBorrador(idProducto, productoCarrito.cantidad);
      guardarCantidadQuitarBorrador(idProducto, cantidadActual + 1, productoCarrito.cantidad);
      renderizarCarrito();
      return;
    }
    case "aplicar-cantidad-quitar": {
      const cantidadAQuitar = obtenerCantidadQuitarBorrador(idProducto, productoCarrito.cantidad);
      cerrarEditorQuitar();
      quitarCantidadDelCarrito(idProducto, cantidadAQuitar);
      return;
    }
    case "quitar-todo":
      cerrarEditorQuitar();
      quitarProductoDelCarrito(idProducto);
      return;
    default:
      return;
  }
}

function manejarInputCarrito(evento) {
  const inputCantidad = evento.target.closest("[data-input-quitar]");
  if (!inputCantidad) {
    return;
  }

  const { idProducto } = inputCantidad.dataset;
  const productoCarrito = obtenerProductoResumenCarrito(idProducto);

  if (!productoCarrito) {
    return;
  }

  const siguienteCantidad = normalizarCantidadQuitar(
    inputCantidad.value,
    productoCarrito.cantidad,
  );
  guardarCantidadQuitarBorrador(idProducto, siguienteCantidad, productoCarrito.cantidad);
  inputCantidad.value = String(siguienteCantidad);
}

function manejarInputCantidadModal() {
  const producto = buscarProductoPorId(estado.idProductoActivo);
  if (!producto) {
    return;
  }

  const stockDisponible = obtenerStockDisponible(producto);
  guardarCantidadAgregarBorrador(elementos.inputCantidadModal.value, stockDisponible);
  sincronizarModalProducto();
}

// Registro de eventos principales de la pantalla.
function vincularEventos() {
  elementos.inputBusqueda.addEventListener("input", (evento) => {
    estado.textoBusqueda = evento.target.value;
    actualizarVisibilidadBotonLimpiar();
    renderizarCatalogo();
  });

  elementos.botonLimpiarBusqueda.addEventListener("click", reiniciarBusqueda);
  elementos.grillaCatalogo.addEventListener("click", manejarInteraccionGrilla);
  elementos.grillaCatalogo.addEventListener("keydown", manejarTecladoGrilla);
  elementos.listaCarrito.addEventListener("click", manejarAccionesCarrito);
  elementos.listaCarrito.addEventListener("input", manejarInputCarrito);
  elementos.listaCarrito.addEventListener("change", manejarInputCarrito);
  elementos.botonCarrito.addEventListener("click", alternarPanelCarrito);
  elementos.botonCerrarCarrito.addEventListener("click", cerrarPanelCarrito);

  elementos.botonContinuar.addEventListener("click", () => {
    if (!elementos.botonContinuar.disabled) {
      window.location.href = URL_PAGINA_CHECKOUT;
    }
  });

  elementos.botonCerrarModal.addEventListener("click", () => cerrarModalProducto());
  elementos.botonCancelarModal.addEventListener("click", () => cerrarModalProducto());
  elementos.overlayModal.addEventListener("click", (evento) => {
    if (evento.target === elementos.overlayModal) {
      cerrarModalProducto();
    }
  });

  elementos.botonBajarCantidadModal.addEventListener("click", () => {
    const producto = buscarProductoPorId(estado.idProductoActivo);
    if (!producto) {
      return;
    }

    const stockDisponible = obtenerStockDisponible(producto);
    guardarCantidadAgregarBorrador(estado.cantidadBorradorAgregar - 1, stockDisponible);
    sincronizarModalProducto();
  });

  elementos.botonSubirCantidadModal.addEventListener("click", () => {
    const producto = buscarProductoPorId(estado.idProductoActivo);
    if (!producto) {
      return;
    }

    const stockDisponible = obtenerStockDisponible(producto);
    guardarCantidadAgregarBorrador(estado.cantidadBorradorAgregar + 1, stockDisponible);
    sincronizarModalProducto();
  });

  elementos.inputCantidadModal.addEventListener("input", manejarInputCantidadModal);
  elementos.inputCantidadModal.addEventListener("change", manejarInputCantidadModal);

  elementos.botonAgregarModal.addEventListener("click", () => {
    const producto = buscarProductoPorId(estado.idProductoActivo);
    if (!producto) {
      return;
    }

    const stockDisponible = obtenerStockDisponible(producto);
    const cantidadAAgregar = normalizarCantidadAgregar(
      estado.cantidadBorradorAgregar,
      stockDisponible,
    );
    const resultado = agregarCantidadAlCarrito(producto, cantidadAAgregar);

    if (resultado.ok) {
      estado.cantidadBorradorAgregar = 1;
      cerrarModalProducto();
    }
  });

  document.addEventListener("click", (evento) => {
    if (!estado.carritoAbierto) {
      return;
    }

    const recorridoClick = evento.composedPath();
    const clickDentroCarrito =
      recorridoClick.includes(elementos.panelCarrito)
      || recorridoClick.includes(elementos.botonCarrito);

    if (!clickDentroCarrito) {
      cerrarPanelCarrito();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !elementos.overlayModal.hidden) {
      cerrarModalProducto();
    }
  });
}

function iniciar() {
  vincularEventos();
  actualizarVisibilidadBotonLimpiar();

  suscribirseAlCarrito(() => {
    if (estado.estadoCatalogo === "listo") {
      renderizarCatalogo();
    }

    renderizarCarrito();
    sincronizarModalProducto();
  });

  cargarProductos();
}

iniciar();
