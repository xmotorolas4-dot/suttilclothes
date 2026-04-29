(function () {
  const {
    syncProductsFromSheet,
    hasAvailableSizes,
    formatPrice,
    escapeHtml,
    WHATSAPP_PHONE
  } = window.SuttilProducts;

  const productGrid = document.getElementById("productGrid");
  const heroProductImage = document.getElementById("heroProductImage");
  const heroTag = document.getElementById("heroTag");
  const heroTagText = document.getElementById("heroTagText");
  const heroTitle = document.getElementById("heroTitle");
  const heroDropCount = document.getElementById("heroDropCount");
  const collectionTitle = document.getElementById("collectionTitle");
  const spotlightVisual = document.getElementById("spotlightVisual");

  const overlay = document.getElementById("overlay");
  const cartPanel = document.getElementById("cartPanel");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartButton = document.getElementById("cartButton");
  const closeCart = document.getElementById("closeCart");
  const checkoutButton = document.getElementById("checkoutButton");

  const zoomModal = document.getElementById("zoomModal");
  const zoomImage = document.getElementById("zoomImage");
  const zoomTitle = document.getElementById("zoomTitle");
  const zoomPrice = document.getElementById("zoomPrice");
  const zoomStock = document.getElementById("zoomStock");
  const zoomTone = document.getElementById("zoomTone");
  const zoomDescription = document.getElementById("zoomDescription");
  const zoomSizes = document.getElementById("zoomSizes");
  const zoomAdd = document.getElementById("zoomAdd");
  const zoomWhatsapp = document.getElementById("zoomWhatsapp");
  const zoomClose = document.getElementById("zoomClose");

  let products = [];
  let selectedSizes = {};
  let activeProductId = "";
  let openProductId = "";
  let zoomProductId = "";
  const cart = [];

  async function refreshProducts() {
    const { products: syncedProducts } = await syncProductsFromSheet();
    products = syncedProducts.filter((product) => product.visible);

    const validIds = new Set(products.map((product) => product.id));
    selectedSizes = Object.fromEntries(
      Object.entries(selectedSizes).filter(([productId]) => validIds.has(productId))
    );

    if (!validIds.has(activeProductId)) {
      activeProductId = products[0]?.id || "";
    }

    if (!validIds.has(openProductId)) {
      openProductId = "";
    }

    if (!validIds.has(zoomProductId)) {
      closeZoom();
    }
  }

  function getProduct(productId) {
    return products.find((product) => product.id === productId);
  }

  function getAvailabilityCopy(product) {
    const selectedSize = selectedSizes[product.id] || "";
    const selectedEntry = product.sizes.find((size) => size.label === selectedSize);

    if (selectedEntry && selectedEntry.stock > 0) {
      return `Talle ${selectedEntry.label} disponible.`;
    }

    if (!hasAvailableSizes(product)) {
      return "No disponible en este momento.";
    }

    return "Selecciona un talle para ver disponibilidad.";
  }

  function buildWhatsappLink(product, size) {
    const availabilityLine = hasAvailableSizes(product)
      ? "* quisiera confirmar disponibilidad\n"
      : "* ahora figura no disponible\n";
    const sizeLine = size ? `* talle que quiero: ${size}\n` : "";
    const text = `Hola SUTTIL, quiero consultar por ${product.name}.\n\n${availabilityLine}${sizeLine}* precio publicado: ${formatPrice(product.price)}\n* medios de pago\n\nGracias.`;
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`;
  }

  function renderSizeButtons(product) {
    return product.sizes.map((size) => {
      const active = selectedSizes[product.id] === size.label;
      return `
        <button
          class="size-btn${active ? " active" : ""}"
          type="button"
          data-size="${escapeHtml(size.label)}"
          ${size.stock > 0 ? "" : "disabled"}
        >${escapeHtml(size.label)}</button>
      `;
    }).join("");
  }

  function renderProductCard(product) {
    const selectedSize = selectedSizes[product.id] || "";
    const canAdd = product.sizes.some((size) => size.label === selectedSize && size.stock > 0);
    const availabilityClass = hasAvailableSizes(product) ? "success" : "danger";
    const availabilityLabel = hasAvailableSizes(product) ? "Disponible" : "No disponible";

    return `
      <article class="product-card${activeProductId === product.id ? " is-active" : ""}${openProductId === product.id ? " is-open" : ""}" data-id="${escapeHtml(product.id)}">
        <div class="product-media">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
        </div>
        <div class="product-body">
          <div class="product-topline">
            <span class="stock-badge ${availabilityClass}">${availabilityLabel}</span>
            <span class="product-open">+</span>
          </div>
          <div class="product-head">
            <div>
              <h3 class="product-name">${escapeHtml(product.name)}</h3>
              <p class="product-tone">${escapeHtml(product.tone)}</p>
            </div>
            <span class="product-price">${formatPrice(product.price)}</span>
          </div>
          <div class="product-expand">
            <div class="product-expand-inner">
              <p class="product-copy">${escapeHtml(product.description)}</p>
              <div class="stock-row">
                <span class="stock-note">${escapeHtml(getAvailabilityCopy(product))}</span>
              </div>
              <div class="size-row" role="group" aria-label="Talles ${escapeHtml(product.name)}">
                ${renderSizeButtons(product)}
              </div>
              <div class="product-actions">
                <button class="btn btn-primary add-btn" type="button" ${canAdd ? "" : "disabled"}>Agregar</button>
                <a class="btn btn-secondary consult-btn" target="_blank" rel="noreferrer" href="${buildWhatsappLink(product, selectedSize)}">Consultar</a>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderSpotlight() {
    spotlightVisual.innerHTML = products.slice(0, 2).map((product) => `
      <div class="spotlight-tile">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      </div>
    `).join("");
  }

  function syncHero() {
    const product = getProduct(activeProductId) || products[0];
    if (!product) {
      heroProductImage.src = "assets/sticker.png";
      heroProductImage.alt = "Logo SUTTIL";
      heroTag.innerHTML = '<span class="pulse-dot"></span> Drop SUTTIL';
      heroTagText.textContent = "La coleccion va cambiando segun lo que cargues desde administracion.";
      heroTitle.innerHTML = 'Remeras con <span class="accent">identidad</span> real.';
      return;
    }

    heroProductImage.src = product.image;
    heroProductImage.alt = product.name;
    heroTag.innerHTML = `<span class="pulse-dot"></span> ${escapeHtml(product.tag)}`;
    heroTagText.textContent = `${product.description} ${getAvailabilityCopy(product)}`;
    heroTitle.innerHTML = `Remeras con <span class="accent">${escapeHtml(product.tag)}</span>.`;
  }

  function renderProducts() {
    if (!products.length) {
      productGrid.innerHTML = `
        <article class="product-card is-open">
          <div class="product-body">
            <h3 class="product-name">No hay prendas visibles</h3>
            <p class="product-copy">Carga productos visibles en Google Sheets para que aparezcan en la tienda.</p>
          </div>
        </article>
      `;
      heroDropCount.textContent = "0";
      collectionTitle.textContent = "Sin prendas visibles";
      syncHero();
      renderSpotlight();
      return;
    }

    heroDropCount.textContent = String(products.length);
    collectionTitle.textContent = `${products.length} modelos listos para destacar`;
    productGrid.innerHTML = products.map(renderProductCard).join("");
    syncHero();
    renderSpotlight();
  }

  function syncCardState() {
    productGrid.querySelectorAll(".product-card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.id === activeProductId);
      card.classList.toggle("is-open", card.dataset.id === openProductId);
    });
  }

  function setActiveProduct(productId) {
    activeProductId = productId;
    syncHero();
    syncCardState();
  }

  function openCard(productId) {
    openProductId = productId;
    setActiveProduct(productId);
  }

  function addToCart(productId) {
    const product = getProduct(productId);
    const size = selectedSizes[productId] || "";
    if (!product || !size) {
      return;
    }

    cart.push({
      name: product.name,
      size,
      price: product.price
    });

    renderCart();
    openCart();
  }

  function renderCart() {
    cartButton.textContent = `Selecciones (${cart.length})`;
    cartTotal.textContent = formatPrice(cart.reduce((sum, item) => sum + item.price, 0));

    if (!cart.length) {
      cartItems.innerHTML = '<p class="cart-empty">Todavia no agregaste productos. Elegi un modelo, selecciona el talle y arma la consulta.</p>';
      return;
    }

    cartItems.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <span>Talle: ${escapeHtml(item.size)}</span>
          <span>${formatPrice(item.price)}</span>
        </div>
        <button class="remove-btn" type="button" data-index="${index}">Quitar</button>
      </div>
    `).join("");
  }

  function openCart() {
    overlay.classList.add("open");
    cartPanel.classList.add("open");
  }

  function closeCartPanel() {
    overlay.classList.remove("open");
    cartPanel.classList.remove("open");
  }

  function renderZoom() {
    const product = getProduct(zoomProductId);
    if (!product) {
      return;
    }

    const selectedSize = selectedSizes[product.id] || "";
    const canAdd = product.sizes.some((size) => size.label === selectedSize && size.stock > 0);

    zoomImage.src = product.image;
    zoomImage.alt = product.name;
    zoomTitle.textContent = product.name;
    zoomPrice.textContent = formatPrice(product.price);
    zoomStock.textContent = getAvailabilityCopy(product);
    zoomTone.textContent = product.tone;
    zoomDescription.textContent = product.description;
    zoomSizes.innerHTML = renderSizeButtons(product);
    zoomAdd.disabled = !canAdd;
    zoomWhatsapp.href = buildWhatsappLink(product, selectedSize);
  }

  function openZoom(productId) {
    zoomProductId = productId;
    renderZoom();
    zoomModal.classList.add("open");
  }

  function closeZoom() {
    zoomProductId = "";
    zoomModal.classList.remove("open");
  }

  productGrid.addEventListener("mouseover", (event) => {
    const card = event.target.closest(".product-card");
    if (!card) {
      return;
    }

    setActiveProduct(card.dataset.id);
  });

  productGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".product-card");
    if (!card) {
      return;
    }

    const productId = card.dataset.id;
    const sizeButton = event.target.closest(".size-btn");
    const addButton = event.target.closest(".add-btn");
    const consultButton = event.target.closest(".consult-btn");

    if (event.target.closest(".product-media")) {
      openZoom(productId);
      return;
    }

    if (sizeButton) {
      if (sizeButton.disabled) {
        return;
      }
      selectedSizes[productId] = sizeButton.dataset.size;
      openCard(productId);
      return;
    }

    if (addButton) {
      addToCart(productId);
      return;
    }

    if (consultButton) {
      consultButton.href = buildWhatsappLink(getProduct(productId), selectedSizes[productId] || "");
      return;
    }

    openCard(productId);
  });

  cartItems.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-btn");
    if (!button) {
      return;
    }

    cart.splice(Number(button.dataset.index), 1);
    renderCart();
  });

  zoomSizes.addEventListener("click", (event) => {
    const button = event.target.closest(".size-btn");
    if (!button || button.disabled || !zoomProductId) {
      return;
    }

    selectedSizes[zoomProductId] = button.dataset.size;
    renderProducts();
    renderZoom();
  });

  cartButton.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartPanel);
  overlay.addEventListener("click", closeCartPanel);
  zoomClose.addEventListener("click", closeZoom);

  zoomModal.addEventListener("click", (event) => {
    if (event.target === zoomModal) {
      closeZoom();
    }
  });

  zoomAdd.addEventListener("click", () => {
    if (!zoomProductId) {
      return;
    }

    addToCart(zoomProductId);
    closeZoom();
  });

  checkoutButton.addEventListener("click", () => {
    if (!cart.length) {
      openCart();
      return;
    }

    const total = formatPrice(cart.reduce((sum, item) => sum + item.price, 0));
    const lines = cart.map((item, index) => `${index + 1}. ${item.name}\n   Talle: ${item.size}\n   Precio: ${formatPrice(item.price)}`);
    const text = `Hola SUTTIL, quiero avanzar con este pedido:\n\n${lines.join("\n\n")}\n\nTotal estimado: ${total}\n\nMe pueden confirmar disponibilidad, forma de pago y envio?\n\nGracias.`;
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`, "_blank");
  });

  window.addEventListener("storage", async () => {
    await refreshProducts();
    renderProducts();
  });

  async function init() {
    await refreshProducts();
    renderProducts();
    renderCart();
  }

  init();
})();
