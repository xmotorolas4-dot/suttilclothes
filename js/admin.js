(function () {
  const {
    SHEET_CSV_URL,
    formatPrice,
    totalStock,
    stringifySizes,
    escapeHtml,
    syncProductsFromSheet,
    login,
    logout,
    isAuthenticated
  } = window.SuttilProducts;

  const loginView = document.getElementById("loginView");
  const adminView = document.getElementById("adminView");
  const loginForm = document.getElementById("loginForm");
  const loginPassword = document.getElementById("loginPassword");
  const loginFeedback = document.getElementById("loginFeedback");
  const adminList = document.getElementById("adminList");
  const createForm = document.getElementById("createForm");
  const resetButton = document.getElementById("resetButton");
  const logoutButton = document.getElementById("logoutButton");
  const sheetRefreshButton = document.getElementById("sheetRefreshButton");
  const visibleCount = document.getElementById("visibleCount");
  const hiddenCount = document.getElementById("hiddenCount");
  const totalCount = document.getElementById("totalCount");
  const totalUnits = document.getElementById("totalUnits");
  const sheetStatusPill = document.getElementById("sheetStatusPill");
  const sheetStatusMessage = document.getElementById("sheetStatusMessage");
  const sheetStatusMeta = document.getElementById("sheetStatusMeta");
  const sheetStatusLink = document.getElementById("sheetStatusLink");

  let products = [];
  let sheetMeta = null;

  sheetStatusLink.href = SHEET_CSV_URL;

  function sheetMetaPill(type, text) {
    return `<span class="pill ${type}">${escapeHtml(text)}</span>`;
  }

  function renderSheetStatus() {
    if (!sheetMeta) {
      sheetStatusPill.className = "pill muted";
      sheetStatusPill.textContent = "Esperando";
      sheetStatusMessage.textContent = "Todavia no se reviso la hoja publicada.";
      sheetStatusMeta.innerHTML = "";
      return;
    }

    if (sheetMeta.state === "error") {
      sheetStatusPill.className = "pill danger";
      sheetStatusPill.textContent = "Error";
      sheetStatusMessage.textContent = sheetMeta.usingCache
        ? "No se pudo leer la hoja publicada. La tienda queda mostrando la ultima copia sincronizada."
        : "No se pudo leer la hoja publicada. Revisa que este publicada como CSV.";
      sheetStatusMeta.innerHTML = [
        sheetMetaPill("danger", sheetMeta.error || "Sin detalle"),
        sheetMeta.usingCache ? sheetMetaPill("muted", `${sheetMeta.managedProductsCount} productos en cache`) : ""
      ].join("");
      return;
    }

    if (sheetMeta.state === "empty") {
      sheetStatusPill.className = "pill muted";
      sheetStatusPill.textContent = "Vacia";
      sheetStatusMessage.textContent = "La hoja esta conectada, pero por ahora solo tiene encabezados. Cuando cargues filas, la tienda va a publicar esos productos.";
      sheetStatusMeta.innerHTML = sheetMetaPill("muted", "0 filas");
      return;
    }

    if (sheetMeta.state === "unmatched") {
      sheetStatusPill.className = "pill muted";
      sheetStatusPill.textContent = "Sin productos";
      sheetStatusMessage.textContent = "Se leyeron filas, pero ninguna tiene nombre de producto. Completa la columna Producto o ID.";
      sheetStatusMeta.innerHTML = [
        sheetMetaPill("muted", `${sheetMeta.rows} filas`),
        sheetMetaPill("muted", "0 productos publicados")
      ].join("");
      return;
    }

    sheetStatusPill.className = "pill success";
    sheetStatusPill.textContent = "Activa";
    sheetStatusMessage.textContent = "El catalogo completo se esta leyendo desde Google Sheets.";
    sheetStatusMeta.innerHTML = [
      sheetMetaPill("success", `${sheetMeta.rows} filas`),
      sheetMetaPill("success", `${sheetMeta.managedProductsCount} productos publicados`)
    ].join("");
  }

  async function reloadProducts() {
    const result = await syncProductsFromSheet();
    products = result.products;
    sheetMeta = result.meta;
  }

  function syncLayout() {
    const auth = isAuthenticated();
    loginView.hidden = auth;
    adminView.hidden = !auth;

    if (!auth) {
      loginPassword.value = "";
    }

    createForm.hidden = true;
    resetButton.hidden = true;
  }

  function renderStats() {
    const visible = products.filter((product) => product.visible).length;
    const hidden = products.filter((product) => !product.visible).length;
    const units = products.reduce((sum, product) => sum + totalStock(product), 0);

    visibleCount.textContent = String(visible);
    hiddenCount.textContent = String(hidden);
    totalCount.textContent = String(products.length);
    totalUnits.textContent = String(units);
  }

  function renderProductCard(product) {
    const imageList = Array.isArray(product.images) && product.images.length
      ? product.images.join(", ")
      : product.image;

    return `
      <article class="product-edit-card" data-id="${escapeHtml(product.id)}">
        <div class="product-edit-preview">
          <div class="panel">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
          </div>
          <div class="product-edit-meta">
            <strong>${escapeHtml(product.name)}</strong>
            <p>${formatPrice(product.price)} - ${escapeHtml(product.tone)}</p>
            <span class="pill ${product.visible ? "success" : "muted"}">${product.visible ? "Visible en tienda" : "Oculta en tienda"}</span>
            <span class="pill success">Desde Google Sheets</span>
          </div>
        </div>

        <form class="product-edit-form">
          <div class="product-edit-grid">
            <label>
              <span>Nombre</span>
              <input name="name" type="text" value="${escapeHtml(product.name)}" readonly>
            </label>
            <label>
              <span>Precio</span>
              <input name="price" type="number" min="0" step="500" value="${product.price}" readonly>
            </label>
            <label>
              <span>Tag</span>
              <input name="tag" type="text" value="${escapeHtml(product.tag)}" readonly>
            </label>
            <label>
              <span>Categoria</span>
              <input name="category" type="text" value="${escapeHtml(product.category)}" readonly>
            </label>
            <label>
              <span>Tono</span>
              <input name="tone" type="text" value="${escapeHtml(product.tone)}" readonly>
            </label>
            <label class="full">
              <span>Descripcion</span>
              <textarea name="description" rows="3" readonly>${escapeHtml(product.description)}</textarea>
            </label>
            <label class="full">
              <span>Ruta o URL de imagen</span>
              <input name="image" type="text" value="${escapeHtml(imageList)}" readonly>
            </label>
            <label class="full field-readonly">
              <span>Talles y stock</span>
              <input name="sizes" type="text" value="${escapeHtml(stringifySizes(product.sizes))}" readonly>
            </label>
          </div>

          <p class="product-sync-note">Edita este producto desde Google Sheets y toca "Sincronizar hoja" para verlo actualizado.</p>

          <div class="product-edit-actions">
            <label class="toggle-row">
              <input name="visible" type="checkbox" ${product.visible ? "checked" : ""} disabled>
              <span>Mostrar en tienda</span>
            </label>
            <div class="admin-header-actions">
              <a class="btn btn-secondary" href="${SHEET_CSV_URL}" target="_blank" rel="noreferrer">Abrir hoja</a>
            </div>
          </div>
        </form>
      </article>
    `;
  }

  function renderAdmin() {
    renderStats();
    renderSheetStatus();

    if (!products.length) {
      adminList.innerHTML = `
        <article class="product-edit-card">
          <div class="product-edit-meta">
            <strong>No hay productos publicados</strong>
            <p>Carga filas en Google Sheets con al menos Producto, columnas de talle, Precio, Imagen y Descripcion.</p>
          </div>
        </article>
      `;
      return;
    }

    adminList.innerHTML = products.map(renderProductCard).join("");
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!login(loginPassword.value)) {
      loginFeedback.textContent = "Clave incorrecta.";
      return;
    }

    loginFeedback.textContent = "";
    syncLayout();
    await reloadProducts();
    renderAdmin();
  });

  logoutButton.addEventListener("click", () => {
    logout();
    syncLayout();
  });

  sheetRefreshButton.addEventListener("click", async () => {
    sheetRefreshButton.disabled = true;
    sheetRefreshButton.textContent = "Sincronizando...";
    await reloadProducts();
    renderAdmin();
    sheetRefreshButton.disabled = false;
    sheetRefreshButton.textContent = "Sincronizar hoja";
  });

  window.addEventListener("storage", async () => {
    if (!isAuthenticated()) {
      return;
    }

    await reloadProducts();
    renderAdmin();
  });

  async function init() {
    syncLayout();
    if (!isAuthenticated()) {
      renderSheetStatus();
      return;
    }

    await reloadProducts();
    renderAdmin();
  }

  init();
})();
