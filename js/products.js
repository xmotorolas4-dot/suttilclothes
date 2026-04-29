(function () {
  const STORAGE_PRODUCTS_KEY = "suttil-products-sheet-cache-v1";
  const ADMIN_SESSION_KEY = "suttil-admin-session-v1";
  const ADMIN_PASSWORD = "suttil2026";
  const WHATSAPP_PHONE = "5493464636708";
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTCiZyzCSU3bjNEY-rfgu_FmZSpcdQ7KzBvzbCgkCQiapQTjkAB5NJnXs8V5OqDZJJJKfcGLmR2YxjA/pub?output=csv";
  const SHEET_CSV_PROXY_URL = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(SHEET_CSV_URL)}`;
  const SHEET_FETCH_URLS = [SHEET_CSV_PROXY_URL, SHEET_CSV_URL];
  const SHEET_FETCH_TIMEOUT_MS = 8000;
  const DEFAULT_IMAGE = "assets/sticker.png";
  const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

  const SHEET_COLUMNS = {
    id: ["ID", "Id", "id", "Codigo", "codigo", "SKU", "sku"],
    name: ["Producto", "producto", "Product", "product", "Nombre", "nombre", "Name", "name"],
    size: ["Talle", "talle", "Size", "size"],
    sizes: ["Talles", "talles", "Sizes", "sizes"],
    stock: ["Stock", "stock", "Cantidad", "cantidad", "Unidades", "unidades"],
    price: ["Precio", "precio", "Price", "price"],
    image: ["Imagen", "imagen", "Image", "image", "Foto", "foto", "URL imagen", "url imagen"],
    tag: ["Tag", "tag", "Etiqueta", "etiqueta"],
    tone: ["Tono", "tono", "Color", "color", "Detalle", "detalle"],
    description: ["Descripcion", "descripcion", "Description", "description", "Detalle largo", "detalle largo"],
    visible: ["Visible", "visible", "Publicado", "publicado", "Activo", "activo"],
    order: ["Orden", "orden", "Order", "order"]
  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `producto-${Date.now()}`;
  }

  function normalizeSizes(sizes) {
    if (!Array.isArray(sizes) || !sizes.length) {
      return [];
    }

    const sizeMap = new Map();

    sizes.forEach((size, index) => {
      const label = normalizeSizeLabel(size?.label || `T${index + 1}`);
      if (!label) {
        return;
      }

      sizeMap.set(label, {
        label,
        stock: Math.max(0, Number(size?.stock) || 0)
      });
    });

    return Array.from(sizeMap.values()).sort(compareSizes);
  }

  function normalizeSizeLabel(value) {
    return String(value || "")
      .replace(/^talle\s+/i, "")
      .trim()
      .toUpperCase();
  }

  function compareSizes(a, b) {
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    const aIndex = sizeOrder.indexOf(a.label);
    const bIndex = sizeOrder.indexOf(b.label);

    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex)
        - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
    }

    return a.label.localeCompare(b.label, "es");
  }

  function normalizeProduct(product, index) {
    const name = String(product?.name || `Producto ${index + 1}`).trim();

    return {
      id: String(product?.id || slugify(name)).trim(),
      name,
      price: Math.max(0, Number(product?.price) || 0),
      image: String(product?.image || DEFAULT_IMAGE).trim() || DEFAULT_IMAGE,
      tag: String(product?.tag || name).trim(),
      tone: String(product?.tone || "Drop SUTTIL").trim(),
      description: String(product?.description || "Prenda disponible en la coleccion actual.").trim(),
      visible: product?.visible !== false,
      sizes: normalizeSizes(product?.sizes),
      sheetManaged: Boolean(product?.sheetManaged),
      sheetRows: Math.max(0, Number(product?.sheetRows) || 0)
    };
  }

  function parseLooseNumber(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return NaN;
    }

    const cleaned = raw
      .replace(/\s+/g, "")
      .replace(/[$]/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(/,(?=\d{3}(?:\D|$))/g, "")
      .replace(/,(\d{1,2})$/g, ".$1")
      .replace(/[^\d.-]/g, "");

    return Number(cleaned);
  }

  function parseBoolean(value, fallback = true) {
    const text = String(value || "").trim().toLowerCase();
    if (!text) {
      return fallback;
    }

    if (["no", "false", "0", "oculto", "oculta", "inactivo", "inactiva"].includes(text)) {
      return false;
    }

    if (["si", "true", "1", "visible", "activo", "activa", "publicado", "publicada"].includes(text)) {
      return true;
    }

    return fallback;
  }

  function parseStockQuantity(value) {
    const text = String(value || "").trim().toLowerCase();

    if (!text) {
      return 0;
    }

    if (["true", "si", "yes", "y", "x", "ok", "disponible", "en stock"].includes(text)) {
      return 1;
    }

    if (["false", "no", "n", "sin stock", "agotado", "agotada", "0"].includes(text)) {
      return 0;
    }

    const parsed = parseLooseNumber(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];

      if (inQuotes) {
        if (char === "\"") {
          if (text[index + 1] === "\"") {
            field += "\"";
            index += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === "\"") {
        inQuotes = true;
        continue;
      }

      if (char === ",") {
        row.push(field);
        field = "";
        continue;
      }

      if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        continue;
      }

      if (char !== "\r") {
        field += char;
      }
    }

    row.push(field);
    rows.push(row);

    const headers = (rows[0] || []).map((header) => String(header || "").trim());

    return rows
      .slice(1)
      .filter((cells) => cells.some((cell) => String(cell || "").trim()))
      .map((cells) => headers.reduce((entry, header, headerIndex) => {
        if (header) {
          entry[header] = String(cells[headerIndex] || "").trim();
        }
        return entry;
      }, {}));
  }

  async function fetchTextWithTimeout(url) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller
      ? window.setTimeout(() => controller.abort(), SHEET_FETCH_TIMEOUT_MS)
      : null;

    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } finally {
      if (timer) {
        window.clearTimeout(timer);
      }
    }
  }

  async function fetchSheetCsvText() {
    let lastError = null;

    for (const url of SHEET_FETCH_URLS) {
      try {
        return await fetchTextWithTimeout(url);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("No se pudo leer la hoja.");
  }

  function getSheetCell(row, names) {
    const entries = Object.entries(row);

    for (const name of names) {
      if (Object.prototype.hasOwnProperty.call(row, name)) {
        return row[name];
      }

      const normalizedName = String(name || "").trim().toLowerCase();
      const match = entries.find(([key]) => String(key || "").trim().toLowerCase() === normalizedName);
      if (match) {
        return match[1];
      }
    }

    return "";
  }

  function getFirstFilledSheetCell(row, groups) {
    for (const names of groups) {
      const value = String(getSheetCell(row, names) || "").trim();
      if (value) {
        return value;
      }
    }

    return "";
  }

  function parseSizesInput(value) {
    return String(value || "")
      .split(",")
      .map((part) => {
        const [label, stock] = part.split(":");
        return {
          label: normalizeSizeLabel(label),
          stock: parseStockQuantity(stock)
        };
      })
      .filter((size) => size.label);
  }

  function getSizesFromSheetRow(row) {
    const sizes = [];
    const explicitSizes = getSheetCell(row, SHEET_COLUMNS.sizes);

    if (explicitSizes) {
      sizes.push(...parseSizesInput(explicitSizes));
    }

    const sizeLabel = String(getSheetCell(row, SHEET_COLUMNS.size) || "").trim().toUpperCase();
    if (sizeLabel) {
      const stockValue = parseStockQuantity(getSheetCell(row, SHEET_COLUMNS.stock));
      sizes.push({
        label: normalizeSizeLabel(sizeLabel),
        stock: stockValue
      });
    }

    DEFAULT_SIZES.forEach((label) => {
      const stockText = getSheetCell(row, [label, label.toLowerCase()]);
      if (String(stockText || "").trim()) {
        sizes.push({
          label,
          stock: parseStockQuantity(stockText)
        });
      }
    });

    Object.entries(row).forEach(([header, value]) => {
      const match = String(header || "").trim().match(/^(?:talle|stock|cantidad)\s+(.+)$/i);
      if (!match) {
        return;
      }

      const label = normalizeSizeLabel(match[1]);
      if (!label) {
        return;
      }

      sizes.push({
        label,
        stock: parseStockQuantity(value)
      });
    });

    return sizes;
  }

  function mergeSheetRowsIntoProducts(rows) {
    const groups = new Map();

    rows.forEach((row, rowIndex) => {
      const idValue = String(getSheetCell(row, SHEET_COLUMNS.id) || "").trim();
      const nameValue = String(getSheetCell(row, SHEET_COLUMNS.name) || "").trim();
      const productName = nameValue || idValue;

      if (!productName) {
        return;
      }

      const productKey = slugify(idValue || productName);

      if (!groups.has(productKey)) {
        groups.set(productKey, {
          id: productKey,
          name: productName,
          price: 0,
          image: DEFAULT_IMAGE,
          tag: productName,
          tone: "Drop SUTTIL",
          description: "Prenda disponible en la coleccion actual.",
          visible: true,
          order: rowIndex,
          rows: 0,
          sizes: []
        });
      }

      const group = groups.get(productKey);
      group.rows += 1;

      const priceValue = parseLooseNumber(getSheetCell(row, SHEET_COLUMNS.price));
      const orderValue = parseLooseNumber(getSheetCell(row, SHEET_COLUMNS.order));
      const imageValue = String(getSheetCell(row, SHEET_COLUMNS.image) || "").trim();
      const tagValue = String(getSheetCell(row, SHEET_COLUMNS.tag) || "").trim();
      const toneValue = String(getSheetCell(row, SHEET_COLUMNS.tone) || "").trim();
      const descriptionValue = String(getSheetCell(row, SHEET_COLUMNS.description) || "").trim();
      const visibleValue = getSheetCell(row, SHEET_COLUMNS.visible);

      group.name = getFirstFilledSheetCell(row, [SHEET_COLUMNS.name, SHEET_COLUMNS.id]) || group.name;

      if (Number.isFinite(priceValue)) {
        group.price = Math.max(0, priceValue);
      }

      if (Number.isFinite(orderValue)) {
        group.order = orderValue;
      }

      if (imageValue) {
        group.image = imageValue;
      }

      if (tagValue) {
        group.tag = tagValue;
      }

      if (toneValue) {
        group.tone = toneValue;
      }

      if (descriptionValue) {
        group.description = descriptionValue;
      }

      if (String(visibleValue || "").trim()) {
        group.visible = parseBoolean(visibleValue, group.visible);
      }

      group.sizes.push(...getSizesFromSheetRow(row));
    });

    return Array.from(groups.values())
      .sort((a, b) => a.order - b.order)
      .map((group, index) => normalizeProduct({
        ...group,
        sheetManaged: true,
        sheetRows: group.rows
      }, index));
  }

  function loadProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(normalizeProduct);
    } catch (error) {
      return [];
    }
  }

  function saveProducts(products) {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products.map(normalizeProduct)));
  }

  function resetProducts() {
    localStorage.removeItem(STORAGE_PRODUCTS_KEY);
    return [];
  }

  async function syncProductsFromSheet() {
    const cachedProducts = loadProducts();

    try {
      const csvText = await fetchSheetCsvText();
      const rows = parseCsv(csvText);
      const products = mergeSheetRowsIntoProducts(rows);

      saveProducts(products);

      if (!rows.length) {
        return {
          products,
          meta: {
            rows: 0,
            syncedProductsCount: 0,
            managedProductsCount: 0,
            sourceUrl: SHEET_CSV_URL,
            state: "empty"
          }
        };
      }

      return {
        products,
        meta: {
          rows: rows.length,
          syncedProductsCount: products.length,
          managedProductsCount: products.length,
          sourceUrl: SHEET_CSV_URL,
          state: products.length ? "ready" : "unmatched"
        }
      };
    } catch (error) {
      return {
        products: cachedProducts,
        meta: {
          rows: 0,
          syncedProductsCount: cachedProducts.length,
          managedProductsCount: cachedProducts.length,
          sourceUrl: SHEET_CSV_URL,
          state: "error",
          usingCache: cachedProducts.length > 0,
          error: error instanceof Error ? error.message : "No se pudo leer la hoja."
        }
      };
    }
  }

  function totalStock(product) {
    return (product?.sizes || []).reduce((sum, size) => sum + Math.max(0, Number(size.stock) || 0), 0);
  }

  function hasAvailableSizes(product) {
    return (product?.sizes || []).some((size) => Number(size.stock) > 0);
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function stringifySizes(sizes) {
    return normalizeSizes(sizes)
      .map((size) => `${size.label}:${size.stock}`)
      .join(", ");
  }

  function login(password) {
    if (password !== ADMIN_PASSWORD) {
      return false;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    return true;
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }

  function isAuthenticated() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  }

  window.SuttilProducts = {
    SHEET_CSV_URL,
    WHATSAPP_PHONE,
    deepClone,
    escapeHtml,
    slugify,
    normalizeProduct,
    normalizeSizes,
    loadProducts,
    saveProducts,
    resetProducts,
    totalStock,
    hasAvailableSizes,
    formatPrice,
    parseSizesInput,
    stringifySizes,
    syncProductsFromSheet,
    login,
    logout,
    isAuthenticated
  };
})();
