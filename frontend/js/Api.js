const API_URL = "http://localhost:8080";

async function crearProducto() {
    const producto = {
        nombre: document.getElementById("nombre").value.trim(),
        marca: document.getElementById("marca").value.trim(),
        precio: parseFloat(document.getElementById("precio").value),
        stock: parseInt(document.getElementById("stock").value),
        descripcion: document.getElementById("descripcion").value.trim()
    };

    if (!producto.nombre || !producto.marca || isNaN(producto.precio)) {
        alert("Por favor completá los campos obligatorios.");
        return;
      }
    
      try{

      }catch(error){
        console.error(error);
        alert("No se pudo conectar con el servidor")
      }

      function limpiarFormulario() {
        ["nombre", "marca", "precio", "stock", "descripcion"]
          .forEach(id => document.getElementById(id).value = "");
      }

      function cancelar() {
        if (confirm("¿Cancelar? Se perderán los datos.")) limpiarFormulario();
      }
}