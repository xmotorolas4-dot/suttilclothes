(function () {
  const {
    syncProductsFromSheet,
    hasAvailableSizes,
    formatPrice,
    escapeHtml,
    optimizeImageUrl,
    WHATSAPP_PHONE
  } = window.SuttilProducts;

  const productGrid = document.getElementById("productGrid");
  const heroProductImage = document.getElementById("heroProductImage");
  const heroTag = document.getElementById("heroTag");
  const heroTagText = document.getElementById("heroTagText");
  const heroTitle = document.getElementById("heroTitle");
  const collectionTitle = document.getElementById("collectionTitle");
  const categoryFilter = document.getElementById("categoryFilter");
  const sizeFilter = document.getElementById("sizeFilter");
  const spotlightVisual = document.getElementById("spotlightVisual");
  const storeMain = document.getElementById("storeMain");
  const productDetailView = document.getElementById("productDetailView");
  const detailBack = document.getElementById("detailBack");
  const detailCartButton = document.getElementById("detailCartButton");
  const detailPhotoButton = document.getElementById("detailPhotoButton");
  const detailPrevButton = document.getElementById("detailPrevButton");
  const detailNextButton = document.getElementById("detailNextButton");
  const detailMainImage = document.getElementById("detailMainImage");
  const detailDots = document.getElementById("detailDots");
  const detailCategory = document.getElementById("detailCategory");
  const detailName = document.getElementById("detailName");
  const detailWhatsapp = document.getElementById("detailWhatsapp");
  const detailPrice = document.getElementById("detailPrice");
  const detailDescription = document.getElementById("detailDescription");
  const detailStock = document.getElementById("detailStock");
  const detailSizes = document.getElementById("detailSizes");
  const detailAddButton = document.getElementById("detailAddButton");
  const detailConsultButton = document.getElementById("detailConsultButton");
  const detailRelated = document.getElementById("detailRelated");

  const overlay = document.getElementById("overlay");
  const cartPanel = document.getElementById("cartPanel");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartButton = document.getElementById("cartButton");
  const closeCart = document.getElementById("closeCart");
  const checkoutButton = document.getElementById("checkoutButton");

  const zoomModal = document.getElementById("zoomModal");
  const zoomImage = document.getElementById("zoomImage");
  const zoomThumbs = document.getElementById("zoomThumbs");
  const zoomClose = document.getElementById("zoomClose");
  const siteHeader = document.querySelector(".site-header");
  const siteFooter = document.querySelector(".site-footer");
  const ticker = document.querySelector(".ticker");
  const mobileCta = document.querySelector(".mobile-cta");

  let products = [];
  let selectedSizes = {};
  let activeProductId = "";
  let openProductId = "";
  let zoomProductId = "";
  let activeDetailProductId = "";
  let activeDetailImageIndex = 0;
  let activeZoomImageIndex = 0;
  let activeCategory = "all";
  let activeSize = "all";
  let lastScrollY = window.scrollY;
  let lockedScrollY = 0;
  const cart = [];
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

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

  function getProductCategory(product) {
    return String(product?.category || "").trim();
  }

  function getCategories() {
    const categories = new Map();

    products.forEach((product) => {
      const category = getProductCategory(product);
      const key = category.toLowerCase();

      if (category && !categories.has(key)) {
        categories.set(key, category);
      }
    });

    return Array.from(categories.values());
  }

  function compareSizeLabels(a, b) {
    const aIndex = sizeOrder.indexOf(a);
    const bIndex = sizeOrder.indexOf(b);

    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex)
        - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
    }

    return a.localeCompare(b, "es");
  }

  function productHasAvailableSize(product, sizeLabel) {
    return (product?.sizes || []).some((size) => (
      String(size.label || "").toLowerCase() === String(sizeLabel || "").toLowerCase()
        && Number(size.stock) > 0
    ));
  }

  function getProductsByCategory() {
    if (activeCategory === "all") {
      return products;
    }

    const activeKey = activeCategory.toLowerCase();
    return products.filter((product) => getProductCategory(product).toLowerCase() === activeKey);
  }

  function getAvailableSizesForCategory() {
    const sizes = new Set();

    getProductsByCategory().forEach((product) => {
      (product.sizes || []).forEach((size) => {
        if (Number(size.stock) > 0 && size.label) {
          sizes.add(size.label);
        }
      });
    });

    return Array.from(sizes).sort(compareSizeLabels);
  }

  function getFilteredProducts() {
    const categoryProducts = getProductsByCategory();

    if (activeSize === "all") {
      return categoryProducts;
    }

    return categoryProducts.filter((product) => productHasAvailableSize(product, activeSize));
  }

  function syncActiveProductForFilter(filteredProducts) {
    const filteredIds = new Set(filteredProducts.map((product) => product.id));

    if (!filteredIds.has(activeProductId)) {
      activeProductId = filteredProducts[0]?.id || "";
    }

    if (!filteredIds.has(openProductId)) {
      openProductId = "";
    }
  }

  function getProduct(productId) {
    return products.find((product) => product.id === productId);
  }

  function getProductImages(product) {
    const images = Array.isArray(product?.images) && product.images.length
      ? product.images
      : [product?.image || "assets/sticker.png"];

    return images
      .map((image) => String(image || "").trim())
      .filter(Boolean);
  }

  function imageSrc(url, width) {
    return optimizeImageUrl(url, width);
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

  function getDetailProductIdFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.toLowerCase().startsWith("producto/")) {
      return "";
    }

    try {
      return decodeURIComponent(hash.slice("producto/".length));
    } catch (error) {
      return hash.slice("producto/".length);
    }
  }

  function setStoreVisibility(showDetail) {
    if (storeMain) {
      storeMain.hidden = showDetail;
    }

    if (productDetailView) {
      productDetailView.hidden = !showDetail;
    }

    document.body.classList.toggle("product-detail-active", showDetail);

    [siteHeader, siteFooter, ticker, mobileCta].forEach((element) => {
      if (element) {
        element.hidden = showDetail;
      }
    });
  }

  function navigateToProduct(productId) {
    if (!productId) {
      return;
    }

    const nextHash = `producto/${encodeURIComponent(productId)}`;
    if (window.location.hash.replace(/^#/, "") === nextHash) {
      handleRouteChange();
      return;
    }

    window.location.hash = nextHash;
  }

  function navigateToStore() {
    activeDetailProductId = "";
    activeDetailImageIndex = 0;
    window.location.hash = "inicio";
  }

  function getRelatedProducts(product) {
    const category = getProductCategory(product).toLowerCase();
    const sameCategory = category
      ? products.filter((item) => item.id !== product.id && getProductCategory(item).toLowerCase() === category)
      : [];
    const fallback = products.filter((item) => item.id !== product.id && !sameCategory.includes(item));

    return [...sameCategory, ...fallback].slice(0, 4);
  }

  function renderDetailDots(product, images, selectedImageIndex) {
    if (!detailDots) {
      return;
    }

    detailDots.hidden = images.length <= 1;
    detailDots.innerHTML = images.map((image, index) => `
      <button
        class="detail-dot${index === selectedImageIndex ? " active" : ""}"
        type="button"
        data-index="${index}"
        aria-label="Ver foto ${index + 1} de ${escapeHtml(product.name)}"
      ></button>
    `).join("");
  }

  function renderDetailGalleryControls(images) {
    const shouldShowArrows = images.length > 1;

    [detailPrevButton, detailNextButton].forEach((button) => {
      if (!button) {
        return;
      }

      button.hidden = !shouldShowArrows;
      button.disabled = !shouldShowArrows;
    });
  }

  function navigateDetailImage(direction) {
    const product = getProduct(activeDetailProductId);
    if (!product) {
      return;
    }

    const images = getProductImages(product);
    if (images.length <= 1) {
      return;
    }

    activeDetailImageIndex = (activeDetailImageIndex + direction + images.length) % images.length;
    renderProductDetail();
  }

  function renderRelatedProducts(product) {
    if (!detailRelated) {
      return;
    }

    const relatedProducts = getRelatedProducts(product);

    if (!relatedProducts.length) {
      detailRelated.innerHTML = "";
      return;
    }

    detailRelated.innerHTML = relatedProducts.map((item) => `
      <article class="detail-related-card" data-id="${escapeHtml(item.id)}">
        <div class="detail-related-media">
          <img src="${escapeHtml(imageSrc(item.image, 700))}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">
        </div>
        <h3>${escapeHtml(item.name)}</h3>
        <div class="detail-related-price">${formatPrice(item.price)}</div>
      </article>
    `).join("");
  }

  function renderProductDetail() {
    const product = getProduct(activeDetailProductId);
    if (!product || !productDetailView) {
      return;
    }

    const images = getProductImages(product);
    const selectedImageIndex = Math.min(activeDetailImageIndex, images.length - 1);
    const selectedSize = selectedSizes[product.id] || "";
    const canAdd = product.sizes.some((size) => size.label === selectedSize && size.stock > 0);
    const whatsappLink = buildWhatsappLink(product, selectedSize);

    activeDetailImageIndex = selectedImageIndex;
    detailMainImage.src = imageSrc(images[selectedImageIndex] || product.image, 1800);
    detailMainImage.alt = product.name;
    detailCategory.textContent = getProductCategory(product) || product.tone || "SUTTIL";
    detailName.textContent = product.name;
    detailWhatsapp.href = whatsappLink;
    detailPrice.textContent = formatPrice(product.price);
    detailDescription.textContent = product.description;
    detailStock.textContent = getAvailabilityCopy(product);
    detailSizes.innerHTML = renderSizeButtons(product);
    detailAddButton.disabled = !canAdd;
    detailConsultButton.href = whatsappLink;
    renderDetailDots(product, images, selectedImageIndex);
    renderDetailGalleryControls(images);
    renderRelatedProducts(product);
  }

  function showProductDetail(productId) {
    const product = getProduct(productId);
    if (!product) {
      setStoreVisibility(false);
      if (window.location.hash) {
        window.location.hash = "inicio";
      }
      return;
    }

    activeDetailProductId = product.id;
    activeDetailImageIndex = 0;
    setActiveProduct(product.id);
    setStoreVisibility(true);
    renderProductDetail();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function handleRouteChange() {
    const detailProductId = getDetailProductIdFromHash();

    if (detailProductId) {
      showProductDetail(detailProductId);
      return;
    }

    activeDetailProductId = "";
    activeDetailImageIndex = 0;
    setStoreVisibility(false);
  }

  function renderProductCard(product) {
    const selectedSize = selectedSizes[product.id] || "";
    const canAdd = product.sizes.some((size) => size.label === selectedSize && size.stock > 0);
    const availabilityClass = hasAvailableSizes(product) ? "success" : "danger";
    const availabilityLabel = hasAvailableSizes(product) ? "Disponible" : "No disponible";
    const categoryLabel = getProductCategory(product);

    return `
      <article class="product-card${activeProductId === product.id ? " is-active" : ""}${openProductId === product.id ? " is-open" : ""}" data-id="${escapeHtml(product.id)}">
        <div class="product-media">
          <img src="${escapeHtml(imageSrc(product.image, 900))}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">
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
              ${categoryLabel ? `<p class="product-category">${escapeHtml(categoryLabel)}</p>` : ""}
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
    spotlightVisual.innerHTML = getFilteredProducts().slice(0, 2).map((product) => `
      <div class="spotlight-tile">
        <img src="${escapeHtml(imageSrc(product.image, 1100))}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">
      </div>
    `).join("");
  }

  function syncHero() {
    const filteredProducts = getFilteredProducts();
    const product = filteredProducts.find((item) => item.id === activeProductId) || filteredProducts[0];
    if (!product) {
      if (heroProductImage) {
        heroProductImage.src = "assets/sticker.png";
        heroProductImage.alt = "Logo SUTTIL";
      }

      if (heroTag) {
        heroTag.innerHTML = '<span class="pulse-dot"></span> Drop SUTTIL';
      }

      if (heroTagText) {
        heroTagText.textContent = "La coleccion va cambiando segun lo publicado en el catalogo.";
      }

      if (heroTitle) {
        heroTitle.innerHTML = 'Remeras con <span class="accent">identidad</span> real.';
      }
      return;
    }

    if (heroProductImage) {
      heroProductImage.src = imageSrc(product.image, 1400);
      heroProductImage.alt = product.name;
    }

    if (heroTag) {
      heroTag.innerHTML = `<span class="pulse-dot"></span> ${escapeHtml(product.tag)}`;
    }

    if (heroTagText) {
      heroTagText.textContent = `${product.description} ${getAvailabilityCopy(product)}`;
    }

    if (heroTitle) {
      heroTitle.innerHTML = `Remera <span class="accent">${escapeHtml(product.tag)}</span>.`;
    }
  }

  function renderCategoryFilter() {
    if (!categoryFilter) {
      return;
    }

    const categoryFilterShell = categoryFilter.closest(".category-filter-shell");
    const categories = getCategories();
    const categoryKeys = new Set(categories.map((category) => category.toLowerCase()));

    if (activeCategory !== "all" && !categoryKeys.has(activeCategory.toLowerCase())) {
      activeCategory = "all";
    }

    if (!categories.length) {
      if (categoryFilterShell) {
        categoryFilterShell.hidden = true;
      }
      categoryFilter.innerHTML = "";
      return;
    }

    if (categoryFilterShell) {
      categoryFilterShell.hidden = false;
    }
    categoryFilter.innerHTML = [
      `<button class="category-filter-btn${activeCategory === "all" ? " active" : ""}" type="button" data-category="all">Todos</button>`,
      ...categories.map((category) => `
        <button
          class="category-filter-btn${activeCategory.toLowerCase() === category.toLowerCase() ? " active" : ""}"
          type="button"
          data-category="${escapeHtml(category)}"
        >${escapeHtml(category)}</button>
      `)
    ].join("");
  }

  function renderSizeFilter() {
    if (!sizeFilter) {
      return;
    }

    const sizeFilterShell = sizeFilter.closest(".size-filter-shell");
    const sizes = getAvailableSizesForCategory();
    const sizeKeys = new Set(sizes.map((size) => size.toLowerCase()));

    if (activeSize !== "all" && !sizeKeys.has(activeSize.toLowerCase())) {
      activeSize = "all";
    }

    if (!sizes.length) {
      if (sizeFilterShell) {
        sizeFilterShell.hidden = true;
      }
      sizeFilter.innerHTML = "";
      return;
    }

    if (sizeFilterShell) {
      sizeFilterShell.hidden = false;
    }

    sizeFilter.innerHTML = [
      `<button class="size-filter-btn${activeSize === "all" ? " active" : ""}" type="button" data-size-filter="all">Todos</button>`,
      ...sizes.map((size) => `
        <button
          class="size-filter-btn${activeSize.toLowerCase() === size.toLowerCase() ? " active" : ""}"
          type="button"
          data-size-filter="${escapeHtml(size)}"
        >${escapeHtml(size)}</button>
      `)
    ].join("");
  }

  function renderProducts() {
    renderCategoryFilter();
    renderSizeFilter();

    if (!products.length) {
      productGrid.innerHTML = `
        <article class="product-card is-open">
          <div class="product-body">
            <h3 class="product-name">No hay prendas visibles</h3>
            <p class="product-copy">Carga productos visibles en Google Sheets para que aparezcan en la tienda.</p>
          </div>
        </article>
      `;
      collectionTitle.textContent = "Sin prendas visibles";
      syncHero();
      renderSpotlight();
      return;
    }

    const filteredProducts = getFilteredProducts();
    syncActiveProductForFilter(filteredProducts);

    if (!filteredProducts.length) {
      const activeFiltersText = [
        activeCategory !== "all" ? `categoria ${activeCategory}` : "",
        activeSize !== "all" ? `talle ${activeSize}` : ""
      ].filter(Boolean).join(" y ");

      productGrid.innerHTML = `
        <article class="product-card is-open">
          <div class="product-body">
            <h3 class="product-name">No hay prendas para este filtro</h3>
            <p class="product-copy">Proba con otro filtro${activeFiltersText ? `: ${escapeHtml(activeFiltersText)}` : ""}.</p>
          </div>
        </article>
      `;
      collectionTitle.textContent = "Sin prendas para este filtro";
      syncHero();
      renderSpotlight();
      return;
    }

    collectionTitle.textContent = activeCategory === "all"
      ? `${filteredProducts.length} modelos listos para destacar${activeSize === "all" ? "" : ` en talle ${activeSize}`}`
      : `${filteredProducts.length} modelos en ${activeCategory}${activeSize === "all" ? "" : ` talle ${activeSize}`}`;
    productGrid.innerHTML = filteredProducts.map(renderProductCard).join("");
    syncHero();
    renderSpotlight();

    if (activeDetailProductId) {
      renderProductDetail();
    }
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
    const cartLabel = `Selecciones (${cart.length})`;
    cartButton.textContent = cartLabel;
    if (detailCartButton) {
      detailCartButton.textContent = cartLabel;
    }
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

    const images = getProductImages(product);
    const selectedImageIndex = Math.min(activeZoomImageIndex, images.length - 1);

    activeZoomImageIndex = selectedImageIndex;
    zoomImage.src = imageSrc(images[selectedImageIndex] || product.image, 1800);
    zoomImage.alt = product.name;
    zoomThumbs.hidden = images.length <= 1;
    zoomThumbs.innerHTML = images.map((image, index) => `
      <button
        class="zoom-thumb${index === selectedImageIndex ? " active" : ""}"
        type="button"
        data-index="${index}"
        aria-label="Ver foto ${index + 1} de ${escapeHtml(product.name)}"
      >
        <img src="${escapeHtml(imageSrc(image, 260))}" alt="" loading="lazy" decoding="async">
      </button>
    `).join("");
  }

  function openZoom(productId, imageIndex = 0) {
    zoomProductId = productId;
    activeZoomImageIndex = imageIndex;
    renderZoom();
    lockedScrollY = window.scrollY;
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.classList.add("modal-open");
    zoomModal.classList.add("open");
  }

  function closeZoom() {
    const wasOpen = zoomModal.classList.contains("open");
    zoomProductId = "";
    activeZoomImageIndex = 0;
    zoomModal.classList.remove("open");
    if (!wasOpen) {
      return;
    }

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.classList.remove("modal-open");
    document.body.style.top = "";
    window.scrollTo(0, lockedScrollY);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  }

  function syncScrollUi() {
    const currentScrollY = window.scrollY;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const isNearBottom = window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 90;
    const shouldHideHeader = isMobile && currentScrollY > 90 && currentScrollY > lastScrollY;

    if (siteHeader) {
      siteHeader.classList.toggle("is-hidden", shouldHideHeader);
    }

    if (mobileCta) {
      mobileCta.classList.toggle("is-visible", isMobile && isNearBottom);
    }

    lastScrollY = currentScrollY;
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

    event.preventDefault();
    navigateToProduct(card.dataset.id);
  });

  categoryFilter?.addEventListener("click", (event) => {
    const button = event.target.closest(".category-filter-btn");
    if (!button) {
      return;
    }

    activeCategory = button.dataset.category || "all";
    renderProducts();
  });

  sizeFilter?.addEventListener("click", (event) => {
    const button = event.target.closest(".size-filter-btn");
    if (!button) {
      return;
    }

    activeSize = button.dataset.sizeFilter || "all";
    renderProducts();
  });

  cartItems.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-btn");
    if (!button) {
      return;
    }

    cart.splice(Number(button.dataset.index), 1);
    renderCart();
  });

  zoomThumbs.addEventListener("click", (event) => {
    const button = event.target.closest(".zoom-thumb");
    if (!button || !zoomProductId) {
      return;
    }

    activeZoomImageIndex = Number(button.dataset.index) || 0;
    renderZoom();
  });

  detailBack?.addEventListener("click", navigateToStore);
  detailCartButton?.addEventListener("click", openCart);
  detailPrevButton?.addEventListener("click", () => navigateDetailImage(-1));
  detailNextButton?.addEventListener("click", () => navigateDetailImage(1));

  detailPhotoButton?.addEventListener("click", () => {
    if (!activeDetailProductId) {
      return;
    }

    openZoom(activeDetailProductId, activeDetailImageIndex);
  });

  detailDots?.addEventListener("click", (event) => {
    const button = event.target.closest(".detail-dot");
    if (!button || !activeDetailProductId) {
      return;
    }

    activeDetailImageIndex = Number(button.dataset.index) || 0;
    renderProductDetail();
  });

  detailSizes?.addEventListener("click", (event) => {
    const button = event.target.closest(".size-btn");
    if (!button || button.disabled || !activeDetailProductId) {
      return;
    }

    selectedSizes[activeDetailProductId] = button.dataset.size;
    renderProducts();
    renderProductDetail();
  });

  detailAddButton?.addEventListener("click", () => {
    if (!activeDetailProductId) {
      return;
    }

    addToCart(activeDetailProductId);
    renderProductDetail();
  });

  detailRelated?.addEventListener("click", (event) => {
    const card = event.target.closest(".detail-related-card");
    if (!card) {
      return;
    }

    navigateToProduct(card.dataset.id);
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
    handleRouteChange();
  });

  window.addEventListener("hashchange", handleRouteChange);
  window.addEventListener("scroll", syncScrollUi, { passive: true });
  window.addEventListener("resize", syncScrollUi);

  async function init() {
    await refreshProducts();
    renderProducts();
    renderCart();
    handleRouteChange();
    syncScrollUi();
  }

  init();
})();
