const API_URL = "http://localhost:8080";
 
/* ════════════════════════════════════
   TAB SWITCHING
════════════════════════════════════ */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
 
function activateTab(tabId) {
  tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  tabPanels.forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabId));
}
 
tabBtns.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
document.getElementById('btn-ir-crear').addEventListener('click', () => activateTab('crear'));
 
/* ════════════════════════════════════
   TOAST
════════════════════════════════════ */
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = isError ? '#8f2a2a' : 'var(--teal)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
 
/* ════════════════════════════════════
   TABLA — renderizado local
════════════════════════════════════ */
const productosLocal = [];
 
function renderTable() {
  const tbody = document.getElementById('products-tbody');
  if (!productosLocal.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No hay productos cargados aún.</td></tr>';
    return;
  }
  tbody.innerHTML = productosLocal.map(p => `
    <tr>
      <td>${p.nombre}</td>
      <td>${p.marca}</td>
      <td><span class="cat-chip">${p.catalogo ?? '—'}</span></td>
      <td class="price-col">$${Number(p.precio).toFixed(2)}</td>
      <td>${p.stock}</td>
    </tr>
  `).join('');
}
 
/* ════════════════════════════════════
   CREAR PRODUCTO
════════════════════════════════════ */
async function crearProducto() {
  const producto = {
    nombre:      document.getElementById("nombre").value.trim(),
    marca:       document.getElementById("marca").value.trim(),
    precio:      parseFloat(document.getElementById("precio").value),
    stock:       parseInt(document.getElementById("stock").value),
    foto:        document.getElementById("foto").value.trim(),
    descripcion: document.getElementById("descripcion").value.trim(),
    catalogo:    document.getElementById("categoria").value  // enum: PINTURAS, RODILLOS…
  };
 
  if (!producto.catalogo) {
    showToast("⚠ Seleccioná una categoría.", true);
    return;
  }
 
  try {
    if (producto.precio <= 0 || producto.stock <= 0) {
      showToast("⚠ El precio y el stock deben ser mayores a 0.", true);
      return;
    }
 
    const response = await fetch(`${API_URL}/api/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto)
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      // CustomExceptionHandler  → { message, errors }
      // RuntimeException        → { mensaje }
      let texto = data.message ?? data.mensaje ?? "Error al crear el producto.";
      if (data.errors) {
        Object.entries(data.errors).forEach(([campo, msg]) => {
          texto += `\n${campo}: ${msg}`;
        });
      }
      showToast("✕ " + texto, true);
      return;
    }
 
    // Controller devuelve Map.of("mensaje", "Producto creado")
    showToast("✓ " + (data.mensaje ?? "Producto creado correctamente."));
    productosLocal.push(producto);
    renderTable();
    limpiarFormulario();
    activateTab('productos');
 
  } catch (error) {
    console.error(error);
    showToast("✕ No se pudo conectar con el servidor.", true);
  }
}
 
/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
function limpiarFormulario() {
  ["nombre", "marca", "precio", "stock", "foto", "descripcion"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("categoria").value = "";
}
 
function cancelar() {
  if (confirm("¿Cancelar? Se perderán los datos ingresados.")) limpiarFormulario();
}
 
/* ════════════════════════════════════
   LISTENERS
════════════════════════════════════ */
document.getElementById("btn-crear-producto").addEventListener("click", crearProducto);
document.getElementById("btn-cancelar").addEventListener("click", cancelar);