const API_URL = "http://localhost:8080";

document.getElementById("button-password")
    .addEventListener("click", togglePass);

document.querySelector(".registro-form").addEventListener("submit", function(e) {
    e.preventDefault();

    registrar();
});



async function registrar(){

    const dniInput = document.getElementById("dni").value.trim();

    if (!/^\d+$/.test(dniInput)) {
        alert("El DNI debe contener solo números");
        return;
    }

    const cliente = {
        dni: parseInt(dniInput),
        nombre: document.getElementById("nombre").value.trim() + " " + document.getElementById("apellido").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        localidad: document.getElementById("localidad").value.trim(),
        provincia: document.getElementById("provincia").value.trim(),
        piso: document.getElementById("piso").value 
              ? parseInt(document.getElementById("piso").value) 
              : null,
        departamento: document.getElementById("departamento").value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/api/clientes/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente)
        });

        const data = await response.json();

        if(!response.ok){
            alert(data.mensaje || "Error inesperado");
            return;
        }

        localStorage.setItem("cliente", JSON.stringify(data));

        window.location.href = "/frontend/pages/Cliente.html";

    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor");
    }
}


function togglePass() {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
}