const API_URL = "http://localhost:8080";

/* ════════════════════════════════════
   TOAST
════════════════════════════════════ */
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = isError ? '#8f2a2a' : 'var(--teal)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ════════════════════════════════════
   TOGGLE PASSWORD
════════════════════════════════════ */
document.getElementById("button-password").addEventListener("click", () => {
  const input   = document.getElementById("password");
  const eyeOn   = document.getElementById("ico-eye");
  const eyeOff  = document.getElementById("ico-eye-off");
  const isHidden = input.type === "password";

  input.type        = isHidden ? "text" : "password";
  eyeOn.style.display  = isHidden ? "none"  : "block";
  eyeOff.style.display = isHidden ? "block" : "none";
});

/* ════════════════════════════════════
   REGISTRAR
════════════════════════════════════ */
document.getElementById("btn-registrar").addEventListener("click", registrar);

// También permite enviar con Enter desde el form
document.getElementById("registro-form").addEventListener("submit", e => {
  e.preventDefault();
  registrar();
});

async function registrar() {
  const dniInput    = document.getElementById("dni").value.trim();
  const nombre      = document.getElementById("nombre").value.trim();
  const apellido    = document.getElementById("apellido").value.trim();
  const email       = document.getElementById("email").value.trim();
  const password    = document.getElementById("password").value;
  const provincia   = document.getElementById("provincia").value.trim();
  const localidad   = document.getElementById("localidad").value.trim();
  const departamento = document.getElementById("departamento").value.trim();
  const pisoVal     = document.getElementById("piso").value;

  /* ── Validaciones frontend ── */
  if (!nombre || !apellido) {
    showToast("⚠ El nombre y apellido son obligatorios.", true);
    return;
  }

  if (!/^\d+$/.test(dniInput)) {
    showToast("⚠ El DNI solo puede contener números.", true);
    return;
  }

  if (!email || !provincia || !localidad) {
    showToast("⚠ Completá todos los campos obligatorios.", true);
    return;
  }

  if (password.length < 8) {
    showToast("⚠ La contraseña debe tener al menos 8 caracteres.", true);
    return;
  }

  const cliente = {
    dni:          parseInt(dniInput),
    nombre:       nombre + " " + apellido,
    email,
    password,
    localidad,
    provincia,
    piso:         pisoVal ? parseInt(pisoVal) : null,
    departamento
  };

  try {
    const response = await fetch(`${API_URL}/api/clientes/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente)
    });

    const data = await response.json();

    if (!response.ok) {
      // CustomExceptionHandler → { message, errors }
      // RuntimeException       → { mensaje }
      let texto = data.message ?? data.mensaje ?? "Error al registrar.";
      if (data.errors) {
        Object.entries(data.errors).forEach(([campo, msg]) => {
          texto += `\n${campo}: ${msg}`;
        });
      }
      showToast("✕ " + texto, true);
      return;
    }

    /* Éxito — guarda el cliente y redirige */
    localStorage.setItem("cliente", JSON.stringify(data));
    showToast("✓ Cuenta creada. Redirigiendo…");
    setTimeout(() => {
      window.location.href = "/frontend/pages/CatalogoCliente.html";
    }, 1200);

  } catch (error) {
    console.error(error);
    showToast("✕ No se pudo conectar con el servidor.", true);
  }
}