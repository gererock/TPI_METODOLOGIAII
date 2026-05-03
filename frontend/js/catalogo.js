const API_URL = "http://localhost:8080";

// ─── ESTADO ───────────────────────────────
let query         = '';
let activeCategory = 'all';
let currentPage   = 1;
let allProducts   = [];   // cache local para filtrado/búsqueda en frontend

let backendData = {
  content: [],
  totalPages: 1,
  totalElements: 0,
  number: 0
};

// ─── API ──────────────────────────────────
async function fetchProductos(page = 0) {
  const url = `${API_URL}/api/productos?page=${page}&size=100`;
  const res  = await fetch(url);
  const data = await res.json();

  backendData  = data;
  allProducts  = data.content ?? [];
  currentPage  = data.number + 1;
}

// ─── FILTRADO LOCAL ───────────────────────
function getFiltered() {
  return allProducts.filter(p => {
    const matchCat = activeCategory === 'all' ||
                     (p.catalogo ?? '').toUpperCase() === activeCategory.toUpperCase();

    const q = query.trim().toLowerCase();
    const matchQ  = !q ||
                    p.nombre.toLowerCase().includes(q) ||
                    (p.descripcion ?? '').toLowerCase().includes(q);

    return matchCat && matchQ;
  });
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

function labelFromEnum(val) {
  const map = {
    PINTURAS:     'Pinturas',
    RODILLOS:     'Rodillos',
    PINCELES:     'Pinceles',
    HERRAMIENTAS: 'Herramientas',
    PROTECCIONES: 'Protecciones'
  };
  return map[(val ?? '').toUpperCase()] ?? val ?? '';
}

// ─── RENDER ───────────────────────────────
function render() {
  const results  = getFiltered();
  const grid     = document.getElementById('catalog-grid');
  const countEl  = document.getElementById('result-count');

  countEl.innerHTML = `<strong>${results.length}</strong> producto${results.length !== 1 ? 's' : ''}`;

  if (results.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-title">Sin resultados</p>
        <p class="empty-msg">No encontramos productos con ese filtro o búsqueda.</p>
        <button class="empty-reset" onclick="resetFilters()">Limpiar filtros</button>
      </div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  grid.innerHTML = results.map((p, i) => `
    <div class="card" style="animation-delay:${i * 0.05}s" data-id="${p.id ?? i}" onclick="openModal(${allProducts.indexOf(p)})">
      <div class="card-img-wrap">
        <img class="card-img" src="${p.foto}" alt="${p.nombre}" loading="lazy"/>
        <span class="card-badge">${labelFromEnum(p.catalogo)}</span>
      </div>
      <div class="card-body">
        <p class="card-cat">${labelFromEnum(p.catalogo)}</p>
        <p class="card-name">${highlight(p.nombre, query)}</p>
        <p class="card-desc">${highlight(p.descripcion || '', query)}</p>
        <div class="card-footer">
          <span class="card-price">${formatPrice(p.precio)}</span>
          <button class="card-btn" onclick="event.stopPropagation(); openModal(${allProducts.indexOf(p)})">Ver detalle</button>
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

  document.getElementById('modal-img').src        = p.foto ?? '';
  document.getElementById('modal-img').alt        = p.nombre;
  document.getElementById('modal-badge').textContent = labelFromEnum(p.catalogo);
  document.getElementById('modal-cat').textContent   = labelFromEnum(p.catalogo);
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
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ─── RESET FILTROS ────────────────────────
function resetFilters() {
  query          = '';
  activeCategory = 'all';
  document.getElementById('search').value = '';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.chip[data-cat="all"]').classList.add('active');
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
  query = '';
  document.getElementById('search').value = '';
  document.getElementById('clear-btn').style.display = 'none';
  render();
});

// ─── FILTROS ──────────────────────────────
document.getElementById('filters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeCategory = chip.dataset.cat;
  render();
});

// ─── ARRANQUE ─────────────────────────────
fetchProductos(0).then(() => render());