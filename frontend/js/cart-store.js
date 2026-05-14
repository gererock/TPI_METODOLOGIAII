import { obtenerIdProducto } from "/frontend/js/productos-api.js";

// Persistencia y eventos compartidos del carrito.
const CLAVE_STORAGE_CARRITO = "bodypaint-cart";
const CLAVE_STORAGE_STOCK_COMPRADO = "bodypaint-purchased-stock";
const EVENTO_CARRITO_ACTUALIZADO = "bodypaint:cart-updated";

// Helpers de storage para leer y guardar datos sin repetir logica.
function leerStorage(clave, valorPorDefecto) {
  try {
    const valorCrudo = localStorage.getItem(clave);
    return valorCrudo ? JSON.parse(valorCrudo) : valorPorDefecto;
  } catch {
    return valorPorDefecto;
  }
}

function guardarStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerItemsCarritoInternos() {
  return leerStorage(CLAVE_STORAGE_CARRITO, []);
}

function guardarItemsCarritoInternos(itemsCarrito) {
  guardarStorage(CLAVE_STORAGE_CARRITO, itemsCarrito);
}

function obtenerStockCompradoInterno() {
  return leerStorage(CLAVE_STORAGE_STOCK_COMPRADO, {});
}

function guardarStockCompradoInterno(stockComprado) {
  guardarStorage(CLAVE_STORAGE_STOCK_COMPRADO, stockComprado);
}

function normalizarCantidad(valor) {
  return Math.max(0, Number.parseInt(valor, 10) || 0);
}

function crearInstantaneaProducto(producto) {
  return {
    nombre: producto?.nombre ?? "Producto",
    marca: producto?.marca ?? "",
    foto: producto?.foto ?? "",
    descripcion: producto?.descripcion ?? "",
    precio: Number(producto?.precio) || 0,
    stock: normalizarCantidad(producto?.stock),
  };
}

function emitirActualizacionCarrito() {
  window.dispatchEvent(
    new CustomEvent(EVENTO_CARRITO_ACTUALIZADO, {
      detail: obtenerEstadoCarrito(),
    }),
  );
}

// Lecturas simples del carrito para reutilizar en catalogo y checkout.
export function obtenerItemsCarrito() {
  return obtenerItemsCarritoInternos();
}

export function obtenerCantidadComprada(idProducto) {
  return 0;
}

export function obtenerCantidadEnCarrito(idProducto) {
  const itemCarrito = obtenerItemsCarritoInternos().find(
    (item) => item.idProducto === String(idProducto),
  );

  return normalizarCantidad(itemCarrito?.cantidad);
}

export function obtenerStockDisponible(producto) {
  const idProducto = obtenerIdProducto(producto);
  const stockBase = normalizarCantidad(producto?.stock);
  const cantidadComprada = obtenerCantidadComprada(idProducto);
  const cantidadEnCarrito = obtenerCantidadEnCarrito(idProducto);

  return Math.max(0, stockBase - cantidadComprada - cantidadEnCarrito);
}

// Alta y baja de unidades dentro del carrito.
export function agregarCantidadAlCarrito(producto, cantidadAAgregar) {
  const cantidadSeguraAAgregar = normalizarCantidad(cantidadAAgregar);

  if (cantidadSeguraAAgregar <= 0) {
    return {
      ok: false,
      mensaje: "Debes agregar al menos una unidad.",
    };
  }

  const stockDisponible = obtenerStockDisponible(producto);

  if (stockDisponible <= 0 || cantidadSeguraAAgregar > stockDisponible) {
    return {
      ok: false,
      mensaje: "No hay stock disponible para agregar este producto.",
    };
  }

  const idProducto = obtenerIdProducto(producto);
  const instantanea = crearInstantaneaProducto(producto);
  const itemsCarrito = obtenerItemsCarritoInternos();
  const itemExistente = itemsCarrito.find((item) => item.idProducto === idProducto);

  if (itemExistente) {
    itemExistente.cantidad += cantidadSeguraAAgregar;
    itemExistente.instantanea = instantanea;
  } else {
    itemsCarrito.push({
      idProducto,
      cantidad: cantidadSeguraAAgregar,
      instantanea,
    });
  }

  guardarItemsCarritoInternos(itemsCarrito);
  emitirActualizacionCarrito();

  return { ok: true };
}

export function quitarCantidadDelCarrito(idProducto, cantidadAQuitar) {
  const idProductoNormalizado = String(idProducto);
  const cantidadSeguraAQuitar = normalizarCantidad(cantidadAQuitar);

  if (cantidadSeguraAQuitar <= 0) {
    return;
  }

  const itemsCarrito = obtenerItemsCarritoInternos()
    .map((item) => {
      if (item.idProducto !== idProductoNormalizado) {
        return item;
      }

      return {
        ...item,
        cantidad: Math.max(0, item.cantidad - cantidadSeguraAQuitar),
      };
    })
    .filter((item) => item.cantidad > 0);

  guardarItemsCarritoInternos(itemsCarrito);
  emitirActualizacionCarrito();
}

export function quitarProductoDelCarrito(idProducto) {
  const idProductoNormalizado = String(idProducto);
  const itemsCarrito = obtenerItemsCarritoInternos().filter(
    (item) => item.idProducto !== idProductoNormalizado,
  );

  guardarItemsCarritoInternos(itemsCarrito);
  emitirActualizacionCarrito();
}
export function vaciarCarrito() {
  guardarItemsCarritoInternos([]);
  emitirActualizacionCarrito();
}

// Genera un resumen uniforme para pintar carrito y checkout.
export function construirResumenCarrito(productos = []) {
  const mapaProductos = new Map(
    productos.map((producto) => [obtenerIdProducto(producto), producto]),
  );
  const itemsCarrito = obtenerItemsCarritoInternos();

  const productosResumen = itemsCarrito
    .map((itemCarrito) => {
      const productoActual = mapaProductos.get(itemCarrito.idProducto);
      const fuenteProducto = productoActual ?? itemCarrito.instantanea;

      if (!fuenteProducto) {
        return null;
      }

      const cantidad = normalizarCantidad(itemCarrito.cantidad);
      const precioUnitario = Number(fuenteProducto.precio) || 0;

      return {
        idProducto: itemCarrito.idProducto,
        nombre: fuenteProducto.nombre ?? "Producto",
        marca: fuenteProducto.marca ?? "",
        foto: fuenteProducto.foto ?? "",
        descripcion: fuenteProducto.descripcion ?? "",
        cantidad,
        precioUnitario,
        subtotal: precioUnitario * cantidad,
      };
    })
    .filter(Boolean);

  const total = productosResumen.reduce(
    (acumulador, producto) => acumulador + producto.subtotal,
    0,
  );
  const totalUnidades = productosResumen.reduce(
    (acumulador, producto) => acumulador + producto.cantidad,
    0,
  );

  return {
    productos: productosResumen,
    total,
    totalUnidades,
  };
}

// Confirma el pago en efectivo y pasa las unidades reservadas a compradas.
export function finalizarPagoEnEfectivo(productos = []) {
  const resumen = construirResumenCarrito(productos);

  if (!resumen.productos.length) {
    return {
      ok: false,
      mensaje: "El carrito esta vacio.",
    };
  }

  const stockComprado = obtenerStockCompradoInterno();

  for (const producto of resumen.productos) {
    stockComprado[producto.idProducto] =
      normalizarCantidad(stockComprado[producto.idProducto]) + producto.cantidad;
  }

  guardarStockCompradoInterno(stockComprado);
  guardarItemsCarritoInternos([]);
  emitirActualizacionCarrito();

  return {
    ok: true,
    total: resumen.total,
  };
}

export function obtenerEstadoCarrito() {
  const resumen = construirResumenCarrito();

  return {
    productos: resumen.productos,
    total: resumen.total,
    totalUnidades: resumen.totalUnidades,
  };
}

// Permite que cada pantalla se actualice cuando cambia el carrito.
export function suscribirseAlCarrito(alCambiar) {
  const ejecutarActualizacion = () => alCambiar(obtenerEstadoCarrito());
  const manejarCambioStorage = (evento) => {
    if (
      evento.key === CLAVE_STORAGE_CARRITO
      || evento.key === CLAVE_STORAGE_STOCK_COMPRADO
    ) {
      ejecutarActualizacion();
    }
  };

  window.addEventListener(EVENTO_CARRITO_ACTUALIZADO, ejecutarActualizacion);
  window.addEventListener("storage", manejarCambioStorage);
  ejecutarActualizacion();

  return () => {
    window.removeEventListener(EVENTO_CARRITO_ACTUALIZADO, ejecutarActualizacion);
    window.removeEventListener("storage", manejarCambioStorage);
  };
}
