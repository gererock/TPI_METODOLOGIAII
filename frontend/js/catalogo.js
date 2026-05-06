const API_URL = "http://localhost:8080";

// ─── ESTADO ───────────────────────────────
let query        = '';
let currentPage  = 1;
let allProducts  = [];

// ─── API ──────────────────────────────────
async function fetchProductos(page = 0) {
  try {
    const res = await fetch(`${API_URL}/api/productos?page=${page}&size=100`);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // BaseResponse de error → "message"; handler genérico → "error"
      throw new Error(err.message ?? err.error ?? `Error ${res.status}`);
    }

    const body = await res.json();   // BaseResponse<Page<?>>

    /*
     * body.data  → el objeto Page de Spring
     * body.data.content → array de productos
     * body.data.number  → página actual (0-indexed)
     */
    const pageData  = body.data ?? {};
    allProducts     = pageData.content ?? [];
    currentPage     = (pageData.number ?? 0) + 1;

  } catch (e) {
    console.error('[fetchProductos]', e);
    showGridError(e.message);
  }
}

// ─── FILTRADO LOCAL ───────────────────────
function getFiltered() {
  const q = query.trim().toLowerCase();
  if (!q) return allProducts;

  return allProducts.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    (p.descripcion ?? '').toLowerCase().includes(q)
  );
}

// ─── HELPERS ──────────────────────────────
function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text, q) {
  if (!q.trim()) return text;
  return text.replace(
    new RegExp(`(${escapeRegex(q.trim())})`, 'gi'),
    '<span class="hl">$1</span>'
  );
}

// ─── ERROR EN GRID ────────────────────────
function showGridError(msg) {
  document.getElementById('catalog-grid').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <p class="empty-title">Ocurrió un error</p>
      <p class="empty-msg">${msg}</p>
      <button class="empty-reset" onclick="location.reload()">Reintentar</button>
    </div>`;
  document.getElementById('pagination').innerHTML   = '';
  document.getElementById('result-count').innerHTML = '';
}

// ─── RENDER ───────────────────────────────
function render() {
  const results = getFiltered();
  const grid    = document.getElementById('catalog-grid');
  const countEl = document.getElementById('result-count');

  countEl.innerHTML = `<strong>${results.length}</strong> producto${results.length !== 1 ? 's' : ''}`;

  if (results.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-title">Sin resultados</p>
        <p class="empty-msg">No encontramos productos con ese texto.</p>
        <button class="empty-reset" onclick="resetSearch()">Limpiar búsqueda</button>
      </div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  grid.innerHTML = results.map((p, i) => `
    <div class="card" style="animation-delay:${i * 0.05}s"
         data-id="${p.id ?? i}"
         onclick="openModal(${allProducts.indexOf(p)})">
      <div class="card-img-wrap">
        <img class="card-img" src="${p.foto}" alt="${p.nombre}" loading="lazy"/>
      </div>
      <div class="card-body">
        <p class="card-name">${highlight(p.nombre, query)}</p>
        <p class="card-desc">${highlight(p.descripcion || '', query)}</p>
        <div class="card-footer">
          <span class="card-price">${formatPrice(p.precio)}</span>
          <button class="card-btn"
                  onclick="event.stopPropagation(); openModal(${allProducts.indexOf(p)})">
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('pagination').innerHTML = '';
}

// ─── MODAL ────────────────────────────────
function openModal(index) {
  const p = allProducts[index];
  if (!p) return;

  document.getElementById('modal-img').src          = p.foto ?? '';
  document.getElementById('modal-img').alt          = p.nombre;
  document.getElementById('modal-title').textContent = p.nombre;
  document.getElementById('modal-desc').textContent  = p.descripcion ?? 'Sin descripción.';
  document.getElementById('modal-price').textContent = formatPrice(p.precio);
  document.getElementById('modal-old').textContent   = '';

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click',  closeModal);
document.getElementById('modal-close2').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─── RESET BÚSQUEDA ───────────────────────
function resetSearch() {
  query = '';
  const input    = document.getElementById('search');
  const clearBtn = document.getElementById('clear-btn');
  if (input)    input.value           = '';
  if (clearBtn) clearBtn.style.display = 'none';
  render();
}

// ─── BÚSQUEDA ─────────────────────────────
document.getElementById('search').addEventListener('input', e => {
  query = e.target.value;
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
  render();
});

document.getElementById('clear-btn')?.addEventListener('click', () => {
  resetSearch();
});

// ─── ARRANQUE ─────────────────────────────
fetchProductos(0).then(() => render());