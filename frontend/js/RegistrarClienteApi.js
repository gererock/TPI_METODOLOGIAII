// Configuracion general de la pantalla de registro.
const URL_API = "http://localhost:8080";
const DURACION_TOAST_MS = 3500;

const elementos = {
  toast: document.getElementById("toast"),
  formulario: document.getElementById("registro-form"),
  botonRegistrar: document.getElementById("btn-registrar"),
  botonVerContrasena: document.getElementById("button-password"),
  iconoOjoVisible: document.getElementById("ico-eye"),
  iconoOjoOculto: document.getElementById("ico-eye-off"),
  inputNombre: document.getElementById("nombre"),
  inputApellido: document.getElementById("apellido"),
  inputEmail: document.getElementById("email"),
  inputDni: document.getElementById("dni"),
  inputPassword: document.getElementById("password"),
  inputProvincia: document.getElementById("provincia"),
  inputLocalidad: document.getElementById("localidad"),
  inputPiso: document.getElementById("piso"),
  inputDepartamento: document.getElementById("departamento"),
  inputCalle: document.getElementById("calle"),
  inputAltura: document.getElementById("altura"),
  inputCodigoPostal: document.getElementById("codigoPostal"),
};


const numberInputs = document.querySelectorAll('input[type="number"]');

numberInputs.forEach((input) => {
  // Bloquear scroll
  input.addEventListener("wheel", (e) => {
    e.preventDefault();
  });

  // Bloquear flechas ↑ ↓
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
  });
});

// Helpers de mensajes y errores.
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
    return errores[0] ?? "";
  }

  const valores = Object.values(errores);
  return valores.length ? valores[0] : "";
}

// Control visual para mostrar u ocultar la contrasena.
function alternarVisibilidadContrasena() {
  const contrasenaOculta = elementos.inputPassword.type === "password";

  elementos.inputPassword.type = contrasenaOculta ? "text" : "password";
  elementos.iconoOjoVisible.hidden = contrasenaOculta;
  elementos.iconoOjoOculto.hidden = !contrasenaOculta;
}

function obtenerDatosFormulario() {
  return {
    dniIngresado: elementos.inputDni.value.trim(),
    nombre: elementos.inputNombre.value.trim(),
    apellido: elementos.inputApellido.value.trim(),
    email: elementos.inputEmail.value.trim(),
    password: elementos.inputPassword.value,
    provincia: elementos.inputProvincia.value.trim(),
    localidad: elementos.inputLocalidad.value.trim(),
    departamento: elementos.inputDepartamento.value.trim(),
    pisoIngresado: elementos.inputPiso.value,
    calle: elementos.inputCalle.value.trim(),
    alturaIngresada: elementos.inputAltura.value,
    codigoPostalIngresado: elementos.inputCodigoPostal.value,
  };
}


function validarFormularioRegistro({
  dniIngresado,
  nombre,
  apellido,
  email,
  password,
  provincia,
  localidad,
  calle,
  alturaIngresada,
  codigoPostalIngresado,
}) {
  if (!nombre || !apellido) {
    return "El nombre y apellido son obligatorios.";
  }

  if (!/^\d+$/.test(dniIngresado)) {
    return "El DNI solo puede contener numeros.";
  }

  if (!email) {
    return "El email es obligatorio.";
  }

  if (!provincia || !localidad) {
    return "La provincia y localidad son obligatorias.";
  }

  if (!calle) {
    return "La calle es obligatoria.";
  }

  if (!alturaIngresada) {
    return "La altura es obligatoria.";
  }

  if (!codigoPostalIngresado) {
    return "El codigo postal es obligatorio.";
  }

  if (password.length < 8) {
    return "La contrasena debe tener al menos 8 caracteres.";
  }

  return null;
}

function construirPayloadCliente(datosFormulario) {
  return {
    dni: Number.parseInt(datosFormulario.dniIngresado, 10),
    nombre: `${datosFormulario.nombre} ${datosFormulario.apellido}`,
    email: datosFormulario.email,
    password: datosFormulario.password,
    localidad: datosFormulario.localidad,
    provincia: datosFormulario.provincia,
    calle: datosFormulario.calle,
    altura: Number.parseInt(datosFormulario.alturaIngresada, 10),
    codigoPostal: Number.parseInt(datosFormulario.codigoPostalIngresado, 10),
    piso: datosFormulario.pisoIngresado
      ? Number.parseInt(datosFormulario.pisoIngresado, 10)
      : null,
    departamento: datosFormulario.departamento || null,
  };
}

// Registro del cliente respetando el contrato actual del backend.
async function registrarCliente() {
  const datosFormulario = obtenerDatosFormulario();
  const errorCliente = validarFormularioRegistro(datosFormulario);

  if (errorCliente) {
    mostrarToast(`! ${errorCliente}`, true);
    return;
  }

  const cliente = construirPayloadCliente(datosFormulario);

  try {
    const respuesta = await fetch(`${URL_API}/api/clientes/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });

    const data = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      const errorCampo = extraerErroresCampos(data.errors);
      const mensajeCompleto = errorCampo || extraerMensaje(data);
      mostrarToast(`X ${mensajeCompleto}`, true);
      return;
    }

    localStorage.setItem("cliente", JSON.stringify(data.data));
    mostrarToast(`OK ${extraerMensaje(data)}`);

    window.setTimeout(() => {
      window.location.href = "/frontend/pages/CatalogoCliente.html";
    }, 1200);
  } catch (error) {
    console.error("[registrar]", error);
    mostrarToast("X No se pudo conectar con el servidor.", true);
  }
}

// Eventos de registro y de la visibilidad de la contrasena.
function vincularEventos() {
  elementos.botonVerContrasena.addEventListener("click", alternarVisibilidadContrasena);
  elementos.botonRegistrar.addEventListener("click", registrarCliente);
  elementos.formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    registrarCliente();
  });
}

function iniciar() {
  vincularEventos();
}

iniciar();
