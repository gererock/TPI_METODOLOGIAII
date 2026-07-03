const URL_LOGIN_CLIENTE  = "http://localhost:8081/api/clientes/login";
const URL_LOGIN_ADMIN    = "http://localhost:8081/api/admin/login";
const URL_LOGIN_VENDEDOR = "http://localhost:8081/api/vendedor/login";

const EMAIL_ADMIN    = "admin@admin.bodypaint";
const EMAIL_VENDEDOR = "vendedor@vendedor.bodypaint";

const inputEmail    = document.getElementById("email");
const inputPassword = document.getElementById("password");
const mensajeError  = document.getElementById("login-error");
const btnLogin      = document.getElementById("btn-login");
const btnToggle     = document.getElementById("btn-toggle-pass");
const icoEye        = document.getElementById("ico-eye");
const icoEyeOff     = document.getElementById("ico-eye-off");

// Estado inicial: ojo abierto visible, ojo tachado oculto
icoEyeOff.classList.add("ico-oculto");

// Toggle mostrar/ocultar contraseña
btnToggle.addEventListener("click", () => {
  const oculta = inputPassword.type === "password";
  inputPassword.type = oculta ? "text" : "password";
  icoEye.classList.toggle("ico-oculto", oculta);
  icoEyeOff.classList.toggle("ico-oculto", !oculta);
});

// Enter dispara login
inputPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") iniciarSesion();
});

btnLogin.addEventListener("click", iniciarSesion);

async function iniciarSesion() {
  mensajeError.textContent = "";

  const email    = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  if (!email || !password) {
    mensajeError.textContent = "Debe ingresar correo y contraseña.";
    return;
  }

  let urlLogin    = URL_LOGIN_CLIENTE;
  let tipoUsuario = "CLIENTE";

  if (email === EMAIL_ADMIN) {
    urlLogin    = URL_LOGIN_ADMIN;
    tipoUsuario = "ADMIN";
  } else if (email === EMAIL_VENDEDOR) {
    urlLogin    = URL_LOGIN_VENDEDOR;
    tipoUsuario = "VENDEDOR";
  }

  btnLogin.disabled    = true;
  btnLogin.textContent = "Ingresando...";

  try {
    const respuesta = await fetch(urlLogin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      mensajeError.textContent =
        data.message || "Usuario no registrado o datos mal ingresados.";
      return;
    }

    // Limpiar sesiones anteriores
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

  } catch {
    mensajeError.textContent = "No se pudo conectar con el servidor.";
  } finally {
    btnLogin.disabled    = false;
    btnLogin.textContent = "Ingresar";
  }
}