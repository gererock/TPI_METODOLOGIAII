const URL_API = "http://localhost:8080";
    const ESTADOS = ["EN_PROCESO", "ENTREGADO", "CANCELADO"];
    const ESTADOS_LABELS = { EN_PROCESO: "En proceso", ENTREGADO: "Entregado", CANCELADO: "Cancelado" };
 
    const $loading   = document.getElementById("loading-state");
    const $table     = document.getElementById("orders-table");
    const $tbody     = document.getElementById("orders-tbody");
    const $empty     = document.getElementById("empty-state");
    const $statsBar  = document.getElementById("stats-bar");
    const $toast     = document.getElementById("toast");
    const $btnReload = document.getElementById("btn-recargar");

    // ── Modal cancelación ──────────────────────────────────────────
    const $modal         = document.getElementById("modal-cancelacion");
    const $modalMotivo   = document.getElementById("modal-motivo");
    const $modalError    = document.getElementById("modal-error");
    const $modalConfirm  = document.getElementById("modal-confirm");
    const $modalCancel   = document.getElementById("modal-cancel");

    let _pendingCancelId = null;

    $modalCancel.addEventListener("click", cerrarModal);
    $modal.addEventListener("click", e => { if (e.target === $modal) cerrarModal(); });

    $modalConfirm.addEventListener("click", async () => {
      const motivo = $modalMotivo.value.trim();
      if (!motivo) {
        $modalError.textContent = "El motivo es obligatorio para cancelar el pedido.";
        $modalError.style.display = "block";
        return;
      }
      const idParaCancelar = _pendingCancelId; // guardar ANTES de cerrar el modal
      cerrarModal();
      await ejecutarCambioEstado(idParaCancelar, "CANCELADO", motivo);
    });

    function abrirModalCancelacion(pedidoId) {
      _pendingCancelId = pedidoId;
      $modalMotivo.value = "";
      $modalError.style.display = "none";
      $modal.style.display = "flex";
      setTimeout(() => $modal.classList.add("open"), 10);
      $modalMotivo.focus();
    }

    function cerrarModal() {
      $modal.classList.remove("open");
      setTimeout(() => { $modal.style.display = "none"; }, 220);
      _pendingCancelId = null;
    }
    // ──────────────────────────────────────────────────────────────

    function esc(v) {
      return String(v ?? "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }
 
    function mostrarToast(msg, error = false) {
      $toast.textContent = msg;
      $toast.style.background = error ? "#8f2a2a" : "var(--teal)";
      $toast.classList.add("show");
      setTimeout(() => $toast.classList.remove("show"), 3500);
    }
 
    function estadoChip(estado) {
      const label = ESTADOS_LABELS[estado] ?? estado;
      return `<span class="estado-chip ${esc(estado)}">${esc(label)}</span>`;
    }
 
    function formatPrice(n) {
      if (n == null) return "-";
      return "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
 
    // Jackson serializa LocalDate como array [anio, mes, dia]
    function formatDate(d) {
      if (!d) return "-";
      if (Array.isArray(d)) {
        const [y, m, day] = d;
        return `${String(day).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
      }
      const dt = new Date(d);
      return isNaN(dt) ? String(d) : dt.toLocaleDateString("es-AR");
    }
 
    async function cargarPedidos() {
      $loading.style.display  = "block";
      $table.style.display    = "none";
      $empty.style.display    = "none";
      $statsBar.style.display = "none";
      $tbody.innerHTML = "";
 
      try {
        const res  = await fetch(`${URL_API}/api/pedidos`);
        const data = await res.json();
 
        // BaseResponse envuelve la lista en data.data
        const pedidos = Array.isArray(data) ? data : (data.data ?? []);
 
        $loading.style.display = "none";
 
        if (!pedidos.length) {
          $empty.style.display = "block";
          return;
        }
 
        const stats = { EN_PROCESO: 0, ENTREGADO: 0, CANCELADO: 0 };
        pedidos.forEach(p => { if (stats[p.estadoPedido] !== undefined) stats[p.estadoPedido]++; });
        document.getElementById("stat-total").textContent     = pedidos.length;
        document.getElementById("stat-proceso").textContent   = stats.EN_PROCESO;
        document.getElementById("stat-entregado").textContent = stats.ENTREGADO;
        document.getElementById("stat-cancelado").textContent = stats.CANCELADO;
        $statsBar.style.display = "flex";
 
        renderPedidos(pedidos);
        $table.style.display = "table";
 
      } catch (err) {
        $loading.style.display = "none";
        $empty.style.display   = "block";
        $empty.innerHTML = `<div class="empty-ico">&#9888;&#65039;</div><p>Error al conectar con el servidor.<br><small style="color:var(--dim)">${esc(err.message)}</small></p>`;
        mostrarToast("No se pudo cargar los pedidos.", true);
      }
    }
 
    function renderPedidos(pedidos) {
      $tbody.innerHTML = "";
 
      pedidos.forEach((pedido) => {
        const productos = Array.isArray(pedido.productos) ? pedido.productos : [];
        const cantTotal = productos.reduce((sum, p) => sum + (p.cantidad ?? 0), 0);
 
        const trMain = document.createElement("tr");
        trMain.className = "order-row";
        trMain.dataset.id = pedido.id;
        trMain.innerHTML = `
          <td><span class="expand-icon">&#9660;</span></td>
          <td><strong>#${esc(pedido.id)}</strong></td>
          <td>${esc(pedido.id_cliente ?? "-")}</td>
          <td>${esc(formatDate(pedido.fechaDePedido))}</td>
          <td>${estadoChip(pedido.estadoPedido)}</td>
          <td>${cantTotal} &iacute;tem${cantTotal !== 1 ? "s" : ""}</td>
          <td><span style="font-family:var(--font-head);font-weight:900">${formatPrice(pedido.total)}</span></td>
        `;
 
        const trDetail = document.createElement("tr");
        trDetail.className = "detail-row";
        trDetail.innerHTML = `<td colspan="7"><div class="detail-content" id="detail-${pedido.id}">${buildDetail(pedido)}</div></td>`;
 
        trMain.addEventListener("click", () => toggleDetalle(pedido.id, trMain));
 
        $tbody.appendChild(trMain);
        $tbody.appendChild(trDetail);
      });
    }
 
    function buildDetail(pedido) {
      const productos = Array.isArray(pedido.productos) ? pedido.productos : [];
 
      let productoRows = "";
      if (productos.length === 0) {
        productoRows = `<tr><td colspan="4" style="color:var(--muted);padding:12px 10px">Sin productos</td></tr>`;
      } else {
        productos.forEach(prod => {
          const subtotal = prod.precio != null ? prod.precio * (prod.cantidad ?? 0) : null;
          productoRows += `
            <tr>
              <td>
                <div class="prod-name">${esc(prod.nombre ?? "-")}</div>
                <div class="prod-marca">${esc(prod.marca ?? "-")}</div>
              </td>
              <td class="prod-qty">&times;${esc(prod.cantidad ?? 0)}</td>
              <td class="prod-price">${prod.precio != null ? formatPrice(prod.precio) : "-"}</td>
              <td class="prod-price">${subtotal != null ? formatPrice(subtotal) : "-"}</td>
            </tr>`;
        });
      }
 
      const esFinal = pedido.estadoPedido === "ENTREGADO" || pedido.estadoPedido === "CANCELADO";
 
      const opcionesEstado = ESTADOS.map(e =>
        `<option value="${e}" ${e === pedido.estadoPedido ? "selected" : ""}>${ESTADOS_LABELS[e]}</option>`
      ).join("");
 
      const mensajeFinal = {
        ENTREGADO: "Este pedido ya fue entregado. No se puede modificar.",
        CANCELADO: "Este pedido fue cancelado y el stock fue repuesto. No se puede modificar."
      };

      // Bloque de motivo de cancelación (solo visible si fue cancelado y tiene motivo)
      const motivoHtml = (pedido.estadoPedido === "CANCELADO" && pedido.motivoCancelacion)
        ? `<div class="motivo-cancelacion-box">
             <span class="motivo-label">&#128683; Motivo de cancelación</span>
             <p class="motivo-texto">${esc(pedido.motivoCancelacion)}</p>
           </div>`
        : "";
 
      const gestionEstadoHtml = esFinal
        ? `<div style="background:rgba(56,182,204,.07);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;font-size:.84rem;color:var(--muted);line-height:1.5;">
             &#128274; ${mensajeFinal[pedido.estadoPedido]}
           </div>
           ${motivoHtml}`
        : `<div>
             <label style="font-size:.77rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);display:block;margin-bottom:6px">Nuevo estado</label>
             <div class="estado-select-wrap">
               <select class="estado-select" id="select-estado-${pedido.id}">
                 ${opcionesEstado}
               </select>
               <span class="select-arrow-ico">&#9662;</span>
             </div>
           </div>
           <button
             class="btn-cambiar-estado"
             id="btn-estado-${pedido.id}"
             type="button"
             onclick="cambiarEstado(${pedido.id})"
           >
             Guardar cambio de estado
           </button>`;
 
      return `
        <div class="detail-grid">
          <div>
            <div class="detail-section-title">&#128722; Productos del pedido</div>
            <table class="detail-products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>${productoRows}</tbody>
            </table>
            <div class="detail-meta" style="margin-top:16px">
              <div class="detail-meta-row">
                <span>Fecha de pedido</span>
                <span>${esc(formatDate(pedido.fechaDePedido))}</span>
              </div>
              <div class="detail-meta-row">
                <span>ID cliente</span>
                <span>${esc(pedido.id_cliente ?? "-")}</span>
              </div>
              <div class="detail-meta-row total-row">
                <span>Total</span>
                <span>${formatPrice(pedido.total)}</span>
              </div>
            </div>
          </div>
 
          <div>
            <div class="detail-section-title">&#9881;&#65039; Gestionar estado</div>
            <div class="estado-section">
              <div class="estado-current">
                Estado actual: ${estadoChip(pedido.estadoPedido)}
              </div>
              ${gestionEstadoHtml}
            </div>
          </div>
        </div>
      `;
    }
 
    function toggleDetalle(pedidoId, trMain) {
      const $detail = document.getElementById(`detail-${pedidoId}`);
      const isOpen  = $detail.classList.contains("open");
 
      document.querySelectorAll(".detail-content.open").forEach(el => el.classList.remove("open"));
      document.querySelectorAll(".order-row.expanded").forEach(el => el.classList.remove("expanded"));
 
      if (!isOpen) {
        $detail.classList.add("open");
        trMain.classList.add("expanded");
      }
    }
 
    async function cambiarEstado(pedidoId) {
      const $select     = document.getElementById(`select-estado-${pedidoId}`);
      const nuevoEstado = $select.value;

      // Si se seleccionó CANCELADO, abrir modal para pedir el motivo
      if (nuevoEstado === "CANCELADO") {
        abrirModalCancelacion(pedidoId);
        return;
      }

      await ejecutarCambioEstado(pedidoId, nuevoEstado, null);
    }

    async function ejecutarCambioEstado(pedidoId, nuevoEstado, motivoCancelacion) {
      const $btn = document.getElementById(`btn-estado-${pedidoId}`);
      if ($btn) {
        $btn.disabled    = true;
        $btn.textContent = "Guardando...";
      }
 
      try {
        const body = { estado: nuevoEstado };
        if (motivoCancelacion) body.motivoCancelacion = motivoCancelacion;

        const res = await fetch(`${URL_API}/api/pedidos/${pedidoId}/estado`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
 
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const errMsg = errData?.message ?? `HTTP ${res.status}`;
          throw new Error(errMsg);
        }
 
        mostrarToast(`Estado del pedido #${pedidoId} actualizado a "${ESTADOS_LABELS[nuevoEstado]}".`);
        setTimeout(() => cargarPedidos(), 800);
 
      } catch (err) {
        mostrarToast(`Error al cambiar estado: ${err.message}`, true);
        if ($btn) {
          $btn.disabled    = false;
          $btn.textContent = "Guardar cambio de estado";
        }
      }
    }
 
    $btnReload.addEventListener("click", cargarPedidos);
    cargarPedidos();