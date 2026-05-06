const API_URL = "http://localhost:8080";

/* ════════════════════════════════════
   TOAST
════════════════════════════════════ */
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent      = msg;
  t.style.background = isError ? '#8f2a2a' : 'var(--teal)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ════════════════════════════════════
   EXTRACTOR DE MENSAJE — back → front
════════════════════════════════════ */
function extractMessage(data) {
  if (data.message) return data.message;
  if (data.error)   return data.error;
  return 'Respuesta inesperada del servidor.';
}

function extractFieldErrors(errors) {
  if (!errors) return '';
  if (Array.isArray(errors)) return errors[0] ?? '';

  const valores = Object.values(errors);
  return valores.length ? valores[0] : '';
}

/* ════════════════════════════════════
   TOGGLE PASSWORD
════════════════════════════════════ */
document.getElementById('button-password').addEventListener('click', () => {
  const input    = document.getElementById('password');
  const eyeOn    = document.getElementById('ico-eye');
  const eyeOff   = document.getElementById('ico-eye-off');
  const isHidden = input.type === 'password';

  input.type           = isHidden ? 'text'  : 'password';
  eyeOn.style.display  = isHidden ? 'none'  : 'block';
  eyeOff.style.display = isHidden ? 'block' : 'none';
});

/* ════════════════════════════════════
   VALIDACIÓN CLIENTE
════════════════════════════════════ */
function validateForm({ dniInput, nombre, apellido, email, password, provincia, localidad }) {
  if (!nombre || !apellido)        return 'El nombre y apellido son obligatorios.';
  if (!/^\d+$/.test(dniInput))     return 'El DNI solo puede contener números.';
  if (!email)                      return 'El email es obligatorio.';
  if (!provincia || !localidad)    return 'La provincia y localidad son obligatorias.';
  if (password.length < 8)         return 'La contraseña debe tener al menos 8 caracteres.';
  return null;
}

/* ════════════════════════════════════
   REGISTRAR
════════════════════════════════════ */
async function registrar() {
  const dniInput     = document.getElementById('dni').value.trim();
  const nombre       = document.getElementById('nombre').value.trim();
  const apellido     = document.getElementById('apellido').value.trim();
  const email        = document.getElementById('email').value.trim();
  const password     = document.getElementById('password').value;
  const provincia    = document.getElementById('provincia').value.trim();
  const localidad    = document.getElementById('localidad').value.trim();
  const departamento = document.getElementById('departamento').value.trim();
  const pisoVal      = document.getElementById('piso').value;

  // ── Validación en el cliente ──────────────────────────────────
  const clientError = validateForm({ dniInput, nombre, apellido, email, password, provincia, localidad });
  if (clientError) {
    showToast('⚠ ' + clientError, true);
    return;
  }

  const cliente = {
    dni:          parseInt(dniInput),
    nombre:       `${nombre} ${apellido}`,
    email,
    password,
    localidad,
    provincia,
    piso:         pisoVal ? parseInt(pisoVal) : null,
    departamento: departamento || null,
  };

  // ── Llamada al back ───────────────────────────────────────────
  try {
    const response = await fetch(`${API_URL}/api/clientes/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(cliente),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      /*
       * Si hay errors de campo → mostramos solo el primer error de campo
       * (el mainMsg ya repite lo mismo)
       * Si no hay errors       → mostramos el mensaje principal
       */
      const fieldErr = extractFieldErrors(data.errors);
      const fullMsg  = fieldErr ? fieldErr : extractMessage(data);
      showToast('✕ ' + fullMsg, true);
      return;
    }

    /*
     * 201 — BaseResponse.ok(ClienteResponse, "Cliente Registrado Correctamente")
     *   { data: { id, dni, nombre, email, … }, message, errors: null, timestamp }
     * Guardamos solo data.data (el ClienteResponse), no el BaseResponse completo.
     */
    localStorage.setItem('cliente', JSON.stringify(data.data));
    showToast('✓ ' + extractMessage(data));
    setTimeout(() => {
      window.location.href = '/frontend/pages/CatalogoCliente.html';
    }, 1200);

  } catch (error) {
    console.error('[registrar]', error);
    showToast('✕ No se pudo conectar con el servidor.', true);
  }
}

/* ════════════════════════════════════
   LISTENERS
════════════════════════════════════ */
document.getElementById('btn-registrar').addEventListener('click', registrar);

document.getElementById('registro-form').addEventListener('submit', e => {
  e.preventDefault();
  registrar();
});