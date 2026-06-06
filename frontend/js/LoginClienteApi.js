const URL_LOGIN_CLIENTE = "http://localhost:8080/api/clientes/login";
const URL_LOGIN_ADMIN = "http://localhost:8080/api/admin/login";
const URL_LOGIN_VENDEDOR = "http://localhost:8080/api/vendedor/login";

const EMAIL_ADMIN = "admin@admin.bodypaint";
const EMAIL_VENDEDOR = "vendedor@vendedor.bodypaint";

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

  let urlLogin = URL_LOGIN_CLIENTE;
  let tipoUsuario = "CLIENTE";

  if (login.email === EMAIL_ADMIN) {
    urlLogin = URL_LOGIN_ADMIN;
    tipoUsuario = "ADMIN";
  }

  if (login.email === EMAIL_VENDEDOR) {
    urlLogin = URL_LOGIN_VENDEDOR;
    tipoUsuario = "VENDEDOR";
  }

  try {
    const respuesta = await fetch(urlLogin, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(login),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mensajeError.textContent =
        data.message || "Usuario no registrado o datos mal ingresados.";
      return;
    }

    localStorage.removeItem("clienteLogueado");
    localStorage.removeItem("adminLogueado");
    localStorage.removeItem("vendedorLogueado");

    if (tipoUsuario === "ADMIN") {
      localStorage.setItem("adminLogueado", JSON.stringify(data.data));
      window.location.href = "/frontend/pages/Admin.html";
      return;
    }

    if (tipoUsuario === "VENDEDOR") {
      localStorage.setItem("vendedorLogueado", JSON.stringify(data.data));
      window.location.href = "/frontend/pages/VendedorPedidos.html";
      return;
    }

    localStorage.setItem("clienteLogueado", JSON.stringify(data.data));
    window.location.href = "/frontend/pages/CatalogoCliente.html";

  } catch (error) {
    mensajeError.textContent = "No se pudo conectar con el servidor.";
  }
});