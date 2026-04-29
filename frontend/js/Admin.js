const form = {
    
    inputs: {
      nombre: document.querySelector('.admin-form-group input[placeholder="Ej: Auriculares BT500"]'),
      marca: document.querySelector('.admin-form-group input[placeholder="Ej: Sony"]'),
      precio: document.querySelector('.admin-price-wrapper input'),
      stock: document.querySelector('.admin-form-group input[placeholder="0"]'),
      descripcion: document.querySelector('.admin-form-group textarea'),
    },
    
  
    card: document.querySelector('.admin-form-card'),
    header: document.querySelector('.admin-form-header'),
    fields: document.querySelector('.admin-form-card > .admin-form-row'),
    productos: [],
  };
  
  // Ocultar campos al cargar la página
    document.querySelectorAll('.admin-form-row, .admin-form-group--full, .admin-form-actions')
    .forEach(el => el.style.display = 'none');
  // Toggle campos al clickear el icono
  document.querySelector('.admin-form-header-icon').addEventListener('click', () => {
    const rows = document.querySelectorAll('.admin-form-row, .admin-form-group--full, .admin-form-actions');
    rows.forEach(el => {
      el.style.display = el.style.display === 'none' ? '' : 'none';
    });
  });
  
  // Abrir modal de confirmacion
  document.querySelector('.btn-primary').addEventListener('click', () => {
    const { nombre, marca, precio, stock, descripcion } = form.inputs;
  
    if (!nombre.value || !marca.value || !precio.value || !stock.value) {
      alert('Completá todos los campos obligatorios.');
      return;
    }
  
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.75);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    `;
  
    overlay.innerHTML = `
      <div style="
        background: #1a1a1a;
        border: 0.5px solid rgba(255,255,255,0.12);
        border-radius: 12px;
        padding: 2rem;
        max-width: 420px;
        width: 90%;
      ">
        <h3 style="margin-bottom: 1.25rem; font-size: 15px; font-weight: 500;">Confirmá el producto</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: rgba(255,255,255,0.45); width: 110px;">Nombre</td>    <td>${nombre.value}</td></tr>
          <tr><td style="padding: 6px 0; color: rgba(255,255,255,0.45);">Marca</td>      <td>${marca.value}</td></tr>
          <tr><td style="padding: 6px 0; color: rgba(255,255,255,0.45);">Precio</td>     <td>$${Number(precio.value).toFixed(2)}</td></tr>
          <tr><td style="padding: 6px 0; color: rgba(255,255,255,0.45);">Stock</td>      <td>${stock.value} unidades</td></tr>
          <tr><td style="padding: 6px 0; color: rgba(255,255,255,0.45); vertical-align: top;">Descripción</td><td>${descripcion.value || '—'}</td></tr>
        </table>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem;">
          <button id="btn-cancelar" style="
            padding: 0 1.25rem; height: 36px; font-size: 13px;
            background: transparent; color: rgba(255,255,255,0.75);
            border: 0.5px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer;
          ">Cancelar</button>
          <button id="btn-confirmar" style="
            padding: 0 1.25rem; height: 36px; font-size: 13px;
            background: #185fa5; color: white;
            border: none; border-radius: 8px; cursor: pointer;
          ">Confirmar</button>
        </div>
      </div>
    `;
  
    document.body.appendChild(overlay);
  });