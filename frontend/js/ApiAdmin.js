const API_URL = "http://localhost:8080";

/* ════════════════════════════════════
   TAB SWITCHING
════════════════════════════════════ */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

function activateTab(tabId) {
  tabBtns.forEach(b  => b.classList.toggle('active', b.dataset.tab === tabId));
  tabPanels.forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabId));
}

tabBtns.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
document.getElementById('btn-ir-crear').addEventListener('click', () => activateTab('crear'));

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
  if (Array.isArray(errors)) return errors.join('\n');
  return Object.entries(errors)
    .map(([campo, msg]) => `• ${campo}: ${msg}`)
    .join('\n');
}

/* ════════════════════════════════════
   TABLA — renderizado con datos del servidor
════════════════════════════════════ */
function renderTable(productos) {
  const tbody = document.getElementById('products-tbody');

  if (!productos.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No hay productos cargados aún.</td></tr>';
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr>
      <td>${p.nombre}</td>
      <td>${p.marca}</td>
      <td class="price-col">$${Number(p.precio).toFixed(2)}</td>
      <td>${p.stock}</td>
    </tr>
  `).join('');
}

/* ════════════════════════════════════
   FETCH PRODUCTOS DESDE EL SERVIDOR
   Trae todos los productos y actualiza la tabla.
   Se llama al inicio y después de cada creación exitosa.
════════════════════════════════════ */
async function fetchProductos() {
  try {
    const res = await fetch(`${API_URL}/api/productos?page=0&size=100`);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(extractMessage(err));
    }

    const body     = await res.json();   // BaseResponse<Page<ProductoResponseDto>>
    const pageData = body.data ?? {};
    const lista    = pageData.content ?? [];

    renderTable(lista);

  } catch (e) {
    console.error('[fetchProductos]', e);
    // No bloqueamos la UI, solo mostramos en la tabla
    document.getElementById('products-tbody').innerHTML =
      `<tr class="empty-row"><td colspan="4">Error al cargar productos: ${e.message}</td></tr>`;
  }
}

/* ════════════════════════════════════
   VALIDACIÓN CLIENTE
════════════════════════════════════ */
function validateForm(producto) {
  if (!producto.nombre)                       return 'El nombre es obligatorio.';
  if (!producto.marca)                        return 'La marca es obligatoria.';
  if (isNaN(producto.precio) || producto.precio <= 0) return 'El precio debe ser mayor a 0.';
  if (isNaN(producto.stock)  || producto.stock  <= 0) return 'El stock debe ser mayor a 0.';
  if (!producto.foto)                         return 'La URL de foto es obligatoria.';
  return null;
}

/* ════════════════════════════════════
   CREAR PRODUCTO
════════════════════════════════════ */
async function crearProducto() {
  const producto = {
    nombre:      document.getElementById('nombre').value.trim(),
    marca:       document.getElementById('marca').value.trim(),
    precio:      parseFloat(document.getElementById('precio').value),
    stock:       parseInt(document.getElementById('stock').value),
    foto:        document.getElementById('foto').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
  };

  const clientError = validateForm(producto);
  if (clientError) {
    showToast('⚠ ' + clientError, true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/productos`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(producto),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const mainMsg   = extractMessage(data);
      const fieldErrs = extractFieldErrors(data.errors);
      const fullMsg   = fieldErrs ? `${mainMsg}\n${fieldErrs}` : mainMsg;
      showToast('✕ ' + fullMsg, true);
      return;
    }

    showToast('✓ ' + extractMessage(data));
    limpiarFormulario();

    // ── Recarga la tabla desde el servidor y cambia de pestaña ──
    await fetchProductos();
    activateTab('productos');

  } catch (error) {
    console.error('[crearProducto]', error);
    showToast('✕ No se pudo conectar con el servidor.', true);
  }
}

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
function limpiarFormulario() {
  ['nombre', 'marca', 'precio', 'stock', 'foto', 'descripcion']
    .forEach(id => { document.getElementById(id).value = ''; });
}

function cancelar() {
  if (confirm('¿Cancelar? Se perderán los datos ingresados.')) limpiarFormulario();
}

/* ════════════════════════════════════
   LISTENERS
════════════════════════════════════ */
document.getElementById('btn-crear-producto').addEventListener('click', crearProducto);
document.getElementById('btn-cancelar').addEventListener('click', cancelar);

/* ════════════════════════════════════
   ARRANQUE — carga productos al abrir la página
════════════════════════════════════ */
fetchProductos();