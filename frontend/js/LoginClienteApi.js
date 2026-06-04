const URL_LOGIN = "http://localhost:8080/api/clientes/login";

const formLogin = document.getElementById("login-form");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const mensajeError = document.getElementById("login-error");

formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();

  mensajeError.textContent = "";

  const login = {
    email: inputEmail.value.trim(),
    password: inputPassword.value.trim(),
  };

  if (!login.email || !login.password) {
    mensajeError.textContent = "Debe ingresar correo y contraseña.";
    return;
  }

  try {
    const respuesta = await fetch(URL_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(login),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mensajeError.textContent = data.message || "Cliente no registrado o datos mal ingresados.";
      return;
    }

    localStorage.setItem("clienteLogueado", JSON.stringify(data.data));

    window.location.href = "/frontend/pages/CatalogoCliente.html";

  } catch (error) {
    mensajeError.textContent = "No se pudo conectar con el servidor.";
  }
});