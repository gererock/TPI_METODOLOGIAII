const adminLogueado = localStorage.getItem("adminLogueado");

if (!adminLogueado) {
  window.location.href = "/frontend/pages/LoginCliente.html";
}

const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("adminLogueado");
    window.location.href = "/frontend/pages/LoginCliente.html";
  });
}

// Configuracion general y referencias del panel de administracion.



const URL_API = "http://localhost:8081";
const URL_REPORTE_STOCK_MINIMO = `${URL_API}/api/productos/reporte-stock-minimo`;
const DURACION_TOAST_MS = 3500;
const FILA_TABLA_VACIA = '<tr class="empty-row"><td colspan="6">No hay productos cargados aun.</td></tr>';
const IDS_CAMPOS_PRODUCTO = ["nombre", "marca", "precio", "stock", "stock_min", "foto", "descripcion"];



const elementos = {
  toast: document.getElementById("toast"),
  botonCrearProducto: document.getElementById("btn-crear-producto"),
  botonCancelar: document.getElementById("btn-cancelar"),
  botonIrACrear: document.getElementById("btn-ir-crear"),
  cuerpoTablaProductos: document.getElementById("products-tbody"),

  cuerpoTablaReporteStock: document.getElementById("reporte-stock-tbody"),
  botonActualizarReporteStock: document.getElementById("btn-actualizar-reporte-stock"),

  botonesPestanas: document.querySelectorAll(".tab-btn"),
  panelesPestanas: document.querySelectorAll(".tab-panel"),
  camposFormulario: Object.fromEntries(
    IDS_CAMPOS_PRODUCTO.map((idCampo) => [idCampo, document.getElementById(idCampo)]),
  ),
};

// Helpers de texto para mensajes y tabla.
function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function estaEnStockMinimo(producto) {
  const stock = Number(producto.stock);
  const stockMinimo = Number(producto.stockMinimo);

  return (
    Number.isFinite(stock) &&
    Number.isFinite(stockMinimo) &&
    stock <= stockMinimo
  );
}

function mostrarToast(mensaje, esError = false) {
  elementos.toast.textContent = mensaje;
  elementos.toast.style.background = esError ? "#8f2a2a" : "var(--teal)";
  elementos.toast.classList.add("show");
  window.setTimeout(() => elementos.toast.classList.remove("show"), DURACION_TOAST_MS);
}

function extraerMensaje(data) {
  if (data.message) {
    return data.message;
  }

  if (data.error) {
    return data.error;
  }

  return "Respuesta inesperada del servidor.";
}

function extraerErroresCampos(errores) {
  if (!errores) {
    return "";
  }

  if (Array.isArray(errores)) {
    return errores.join("\n");
  }

  return Object.entries(errores)
    .map(([campo, mensaje]) => `- ${campo}: ${mensaje}`)
    .join("\n");
}

// Navegacion interna entre la pestana de crear y la de productos.
function activarPestana(idPestana) {
  elementos.botonesPestanas.forEach((boton) => {
    boton.classList.toggle("active", boton.dataset.tab === idPestana);
  });

  elementos.panelesPestanas.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${idPestana}`);
  });

  if (idPestana === "reporte-stock") {
    cargarReporteStockMinimo();
  }
}

// Render de la tabla con productos traidos desde el backend.
function renderizarTabla(productos) {
  if (!productos.length) {
    elementos.cuerpoTablaProductos.innerHTML = FILA_TABLA_VACIA;
    return;
  }

  elementos.cuerpoTablaProductos.innerHTML = productos
    .map((producto) => {
      const stockMinimoAlcanzado = estaEnStockMinimo(producto);

      return `
        <tr class="${stockMinimoAlcanzado ? "stock-minimo-row" : ""}">
          <td>${escaparHtml(producto.nombre)}</td>
          <td>${escaparHtml(producto.marca)}</td>
          <td class="price-col">$${Number(producto.precio).toFixed(2)}</td>
          <td>${escaparHtml(producto.stock)}</td>
          <td>${escaparHtml(producto.stockMinimo)}</td>
          <td>
            ${
              stockMinimoAlcanzado
                ? '<span class="stock-alerta">Stock mínimo</span>'
                : '<span class="stock-normal">Stock normal</span>'
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

function obtenerPayloadProducto() {
  return {
    nombre: elementos.camposFormulario.nombre.value.trim(),
    marca: elementos.camposFormulario.marca.value.trim(),
    precio: Number.parseFloat(elementos.camposFormulario.precio.value),
    stock: Number.parseInt(elementos.camposFormulario.stock.value, 10),
    stockMinimo: Number(elementos.camposFormulario.stock_min.value),
    foto: elementos.camposFormulario.foto.value.trim(),
    descripcion: elementos.camposFormulario.descripcion.value.trim(),
  };
}

function validarFormularioProducto(producto) {
  if (!producto.nombre) {
    return "El nombre es obligatorio.";
  }

  if (!producto.marca) {
    return "La marca es obligatoria.";
  }

  if (Number.isNaN(producto.precio) || producto.precio <= 0) {
    return "El precio debe ser mayor a 0.";
  }

  if (Number.isNaN(producto.stock) || producto.stock <= 0) {
    return "El stock debe ser mayor a 0.";
  }
  if (Number.isNaN(producto.stockMinimo) || producto.stockMinimo <= 0 || !Number.isInteger(producto.stockMinimo)) {
  return "El stock mínimo debe ser un número entero y mayor a 0.";
}

  if (!producto.foto) {
    return "La URL de foto es obligatoria.";
  }

  return null;
}

function limpiarFormularioProducto() {
  IDS_CAMPOS_PRODUCTO.forEach((idCampo) => {
    elementos.camposFormulario[idCampo].value = "";
  });
}

function manejarCancelacionFormulario() {
  if (window.confirm("Cancelar? Se perderan los datos ingresados.")) {
    limpiarFormularioProducto();
  }
}

async function cargarProductosAdmin() {
  try {
    const respuesta = await fetch(`${URL_API}/api/productos?page=0&size=100`);

    if (!respuesta.ok) {
      const dataError = await respuesta.json().catch(() => ({}));
      throw new Error(extraerMensaje(dataError));
    }

    const cuerpo = await respuesta.json();
    const productos = cuerpo.data?.content ?? [];
    renderizarTabla(productos);
  } catch (error) {
    console.error("[cargarProductosAdmin]", error);
    elementos.cuerpoTablaProductos.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">Error al cargar productos: ${escaparHtml(error.message)}</td>
      </tr>
    `;
  }
}

async function cargarReporteStockMinimo() {
  if (!elementos.cuerpoTablaReporteStock) {
    return;
  }

  elementos.cuerpoTablaReporteStock.innerHTML = `
    <tr class="empty-row">
      <td colspan="5">Cargando reporte...</td>
    </tr>
  `;

  try {
    const respuesta = await fetch(URL_REPORTE_STOCK_MINIMO);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(extraerMensaje(data));
    }

    const productos = data.data || [];

    if (productos.length === 0) {
      elementos.cuerpoTablaReporteStock.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">No hay productos cerca del stock mínimo.</td>
        </tr>
      `;
      return;
    }

    elementos.cuerpoTablaReporteStock.innerHTML = productos
      .map((producto) => `
        <tr>
          <td>${escaparHtml(producto.codigo)}</td>
          <td>${escaparHtml(producto.nombre)}</td>
          <td>${escaparHtml(producto.stockActual)}</td>
          <td>${escaparHtml(producto.stockMinimo)}</td>
          <td>${escaparHtml(producto.estado)}</td>
        </tr>
      `)
      .join("");

  } catch (error) {
    elementos.cuerpoTablaReporteStock.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">Error al cargar reporte: ${escaparHtml(error.message)}</td>
      </tr>
    `;
  }
}

// Alta de producto respetando exactamente el contrato del backend.
async function crearProducto() {
  const producto = obtenerPayloadProducto();
  const errorCliente = validarFormularioProducto(producto);

  if (errorCliente) {
    mostrarToast(`! ${errorCliente}`, true);
    return;
  }

  try {
    const respuesta = await fetch(`${URL_API}/api/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    const data = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      const mensajePrincipal = extraerMensaje(data);
      const erroresCampos = extraerErroresCampos(data.errors);
      const mensajeCompleto = erroresCampos
        ? `${mensajePrincipal}\n${erroresCampos}`
        : mensajePrincipal;

      mostrarToast(`X ${mensajeCompleto}`, true);
      return;
    }

    mostrarToast(`OK ${extraerMensaje(data)}`);
    limpiarFormularioProducto();
    await cargarProductosAdmin();
    await cargarReporteStockMinimo();
    activarPestana("productos");
  } catch (error) {
    console.error("[crearProducto]", error);
    mostrarToast("X No se pudo conectar con el servidor.", true);
  }
}

// Eventos principales del panel admin.
function vincularEventos() {
  elementos.botonesPestanas.forEach((boton) => {
    boton.addEventListener("click", () => activarPestana(boton.dataset.tab));
  });

  if (elementos.botonIrACrear) {
    elementos.botonIrACrear.addEventListener("click", () => activarPestana("crear"));
  }

  if (elementos.botonCrearProducto) {
    elementos.botonCrearProducto.addEventListener("click", crearProducto);
  }

  if (elementos.botonCancelar) {
    elementos.botonCancelar.addEventListener("click", manejarCancelacionFormulario);
  }

  if (elementos.botonActualizarReporteStock) {
    elementos.botonActualizarReporteStock.addEventListener("click", cargarReporteStockMinimo);
  }
}

function iniciar() {
  vincularEventos();
  cargarProductosAdmin();
 
  cargarReporteStockMinimo();
}

iniciar();
