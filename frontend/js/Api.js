const API_URL = "http://localhost:8080";

async function crearProducto() {
    const producto = {
        nombre: document.getElementById("nombre").value.trim(),
        marca: document.getElementById("marca").value.trim(),
        precio: parseFloat(document.getElementById("precio").value),
        stock: parseInt(document.getElementById("stock").value),
        descripcion: document.getElementById("descripcion").value.trim()
    };

    
      try{
        const response = await fetch(`${API_URL}/api/productos`, {

          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(producto)

        });


        const mensaje = await response.text(); 

        if (response.status === 409) {

            alert(mensaje); 

            return;

        }

        if (!response.ok) {

          alert("Error inesperado: " + response.status);

          return;

        }

        alert("Producto creado correctamente");

        limpiarFormulario();


      }catch(error){

        console.error(error);

        alert("No se pudo conectar con el servidor")

      }
}

function limpiarFormulario() {

  ["nombre", "marca", "precio", "stock", "descripcion"]
    .forEach(id => document.getElementById(id).value = "");

}

function cancelar() {

  if (confirm("¿Cancelar? Se perderán los datos.")) limpiarFormulario();

}


const crearProductoButton = document.getElementById("btn-crear-producto");
const cancelarButton = document.getElementById("btn-cancelar");

crearProductoButton.addEventListener("click", crearProducto);

cancelarButton.addEventListener("click", cancelar);
