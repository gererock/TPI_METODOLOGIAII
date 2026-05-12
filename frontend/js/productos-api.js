// Funciones compartidas para traer productos y formatear datos
// que despues usan catalogo, carrito y checkout.
const URL_API = "http://localhost:8080";

const formateadorPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// Trae el listado de productos desde el backend.
export async function obtenerProductos() {
  const respuesta = await fetch(`${URL_API}/api/productos?page=0&size=100`);

  if (!respuesta.ok) {
    const cuerpoError = await respuesta.json().catch(() => ({}));
    const mensaje = cuerpoError.message ?? cuerpoError.error ?? `Error ${respuesta.status}`;
    throw new Error(mensaje);
  }

  const cuerpo = await respuesta.json();
  return cuerpo.data?.content ?? [];
}

// Unifica el formato de precio para toda la interfaz.
export function formatearPrecio(valor) {
  return formateadorPrecio.format(Number(valor) || 0);
}

// Resuelve un id estable para cada producto, incluso si el backend
// todavia no devuelve un id formal en alguna pantalla.
export function obtenerIdProducto(producto) {
  if (producto?.id !== null && producto?.id !== undefined) {
    return String(producto.id);
  }

  return [
    producto?.nombre ?? "producto",
    producto?.marca ?? "sin-marca",
    producto?.foto ?? "sin-foto",
  ].join("::");
}
