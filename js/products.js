(function () {
  const STORAGE_PRODUCTS_KEY = "suttil-products-sheet-cache-v1";
  const WHATSAPP_PHONE = "3464624227";
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTCiZyzCSU3bjNEY-rfgu_FmZSpcdQ7KzBvzbCgkCQiapQTjkAB5NJnXs8V5OqDZJJJKfcGLmR2YxjA/pub?output=csv";
  const SHEET_CSV_PROXY_URL = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(SHEET_CSV_URL)}`;
  const SHEET_FETCH_URLS = [SHEET_CSV_URL, SHEET_CSV_PROXY_URL];
  const SHEET_FETCH_TIMEOUT_MS = 8000;
  const DEFAULT_IMAGE = "assets/sticker.png";
  const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];
  const FALLBACK_CSV = `Producto,Talle XL,Talle L,Talle M,Talle S,Precio,Imagen,Descripcion,Categoria
SUTTIL TONE 01,FALSE,FALSE,TRUE,TRUE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777830396/001_edlliu.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684579/_MEC0416_y7lxrf.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Verde. Logo Amarillo.,Remeras
SUTTIL TONE 02,FALSE,FALSE,FALSE,TRUE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853380/002_rznmwy.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778693366/_MEC0355_glph6s.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Celeste. Logo Marron.,Remeras
SUTTIL TONE 03,FALSE,TRUE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853526/003_nebjfy.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Celeste. Logo Gris.,Remeras
SUTTIL TONE 04,TRUE,FALSE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853572/004_eh4pw3.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Beige. Logo Marron.,Remeras
SILENT WAVE 01,FALSE,FALSE,TRUE,FALSE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853652/005_wrzhzj.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778693364/_MEC0442_ajgrjw.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno SILENT WAVE con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Marron.,Remeras
COMBAT SKATE 01,TRUE,FALSE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853746/006_hzqrtj.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno COMBAT SKATE con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Marron.,Remeras
SUTTIL TONE 05,FALSE,FALSE,FALSE,TRUE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853789/007_tpmjdb.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Marron. Logo Amarillo.,Remeras
PIZZA LIBERTY 01,FALSE,FALSE,TRUE,FALSE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853809/008_whv00t.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778693366/_MEC0434_kq47pe.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno PIZZA LIBERTY con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro Washed.,Remeras
SUTTIL TONE 06,TRUE,FALSE,TRUE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853828/009_gkgx9v.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro Washed. Logo Negro.,Remeras
E=mc\u00b2,FALSE,FALSE,TRUE,FALSE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853837/010_nr5p3c.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778693385/_MEC0338_ocggpn.jpg, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778693370/_MEC0351_x4awtz.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno E=mc2 con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro Washed.,Remeras
SUTTIL TONE 07,TRUE,FALSE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853858/011_kubtgw.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro Washed. Logo Gris.,Remeras
SUTTIL TONE 08,FALSE,TRUE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853882/012_xtelbi.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro Washed. Logo Bordo.,Remeras
SUTTIL TONE 09,FALSE,FALSE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853923/013_ggyejr.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro Washed. Logo Amarillo.,Remeras
COMBAT SKATE 02,FALSE,FALSE,FALSE,TRUE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853926/014_armrwq.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778696070/_MEC0389_dbnzhr.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno COMBAT SKATE con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro.,Remeras
CONFUSED,FALSE,FALSE,TRUE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853928/015_b6xhou.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno CONFUSED con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro.,Remeras
SUTTIL TONE 10,TRUE,FALSE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853937/016_kjbd2z.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro. Logo Gris.,Remeras
PIZZA LIBERTY 02,FALSE,FALSE,FALSE,TRUE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853944/017_uielpd.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684593/_MEC0396_c4de5f.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno PIZZA LIBERTY con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Crudo.,Remeras
SUTTIL TONE 11,FALSE,FALSE,TRUE,FALSE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853956/018_q2mors.png,https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778693376/_MEC0368_y2fkgk.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Crudo. Logo Negro.,Remeras
SUTTIL TONE 12,FALSE,TRUE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853966/019_vgrijp.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Crudo. Logo Marron.,Remeras
SUTTIL TONE 13,FALSE,TRUE,FALSE,TRUE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777853986/020_ffdpbb.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Crudo. Logo Bordo.,Remeras
DESERT WAVE,FALSE,FALSE,TRUE,FALSE,"$28,500.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777854004/021_kp97he.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684578/_MEC0464_lxdpeq.jpg",Remera oversize SUTTIL. Hecha en algodon premium. Diseno DESERT WAVE con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Crudo.,Remeras
SILENT WAVE 02,TRUE,FALSE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777854832/022_kezmog.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno SILENT WAVE con logo frontal estampado. Corte relajado y comodo para el uso diario. Color crudo.,Remeras
SUTTIL TONE 14,FALSE,TRUE,FALSE,FALSE,"$28,500.00",https://res.cloudinary.com/dcg5qxzxq/image/upload/v1777854875/023_nuepfc.png,Remera oversize SUTTIL. Hecha en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Tiza. Logo Marron.,Remeras
OG HOODIE,FALSE,TRUE,FALSE,TRUE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630187/002_uqy1dh.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684108/_MEC0534_unoa8t.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro. Logo Blanco.,Buzos
TRACE HOODIE,FALSE,FALSE,TRUE,TRUE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630162/001_mihk2k.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630123/001.1_lqb1ul.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684558/_MEC0547_y9uveb.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno TRACE HOODIE con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro. Logo Gris.,Buzos
OG GREEN,FALSE,FALSE,TRUE,FALSE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630198/003_l02x5r.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684568/_MEC0520_pw9xup.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Verde. Logo Amarillo.,Buzos
HOODIE E=mc\u00b2,FALSE,FALSE,TRUE,TRUE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630218/004_miumi1.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630229/004.1_lbwqtd.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684561/_MEC0530_yfwkxk.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno E=mc2 con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro.,Buzos
SILENT WAVE HOODIE,FALSE,FALSE,FALSE,TRUE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630244/005_eupoi7.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778687455/_MEC0559_zgmnjx.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno SILENT WAVE con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro.,Buzos
ESSENTIAL HOODIE,TRUE,TRUE,TRUE,TRUE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630254/006_gkdp7u.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684558/_MEC0567_vlfjeb.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Negro. Logo Gris.,Buzos
ESSENTIAL BEIGE 01,FALSE,FALSE,TRUE,TRUE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630308/010_cjupci.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684576/_MEC0499_fdo1jr.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Beige. Logo Marron.,Buzos
OG BEIGE,FALSE,FALSE,TRUE,FALSE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630296/009_qj4ula.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684572/_MEC0505_ntvlwx.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Beige. Logo Marron.,Buzos
ESSENTIAL BEIGE 02,FALSE,FALSE,FALSE,TRUE,"$45,000.00","https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778630284/008_bbljhi.png, https://res.cloudinary.com/dcg5qxzxq/image/upload/v1778684572/_MEC0515_uc1qam.jpg",Buzo oversize SUTTIL. Hecho en algodon premium. Diseno minimalista con logo frontal estampado. Corte relajado y comodo para el uso diario. Color Beige. Logo Gris.,Buzos`;

  const SHEET_COLUMNS = {
    id: ["ID", "Id", "id", "Codigo", "codigo", "SKU", "sku"],
    name: ["Producto", "producto", "Product", "product", "Nombre", "nombre", "Name", "name"],
    size: ["Talle", "talle", "Size", "size"],
    sizes: ["Talles", "talles", "Sizes", "sizes"],
    stock: ["Stock", "stock", "Cantidad", "cantidad", "Unidades", "unidades"],
    price: ["Precio", "precio", "Price", "price"],
    image: ["Imagen", "imagen", "Image", "image", "Img", "img", "Foto", "foto", "URL imagen", "url imagen"],
    category: ["Categoria", "categoria", "Categoría", "categoría", "Category", "category", "Tipo", "tipo"],
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
    const images = normalizeImages(product?.images || product?.image);

    return {
      id: String(product?.id || slugify(name)).trim(),
      name,
      price: Math.max(0, Number(product?.price) || 0),
      image: images[0],
      images,
      category: String(product?.category || "").trim(),
      tag: String(product?.tag || name).trim(),
      tone: String(product?.tone || "Drop SUTTIL").trim(),
      description: String(product?.description || "Prenda disponible en la coleccion actual.").trim(),
      visible: product?.visible !== false,
      sizes: normalizeSizes(product?.sizes),
      sheetManaged: Boolean(product?.sheetManaged),
      sheetRows: Math.max(0, Number(product?.sheetRows) || 0)
    };
  }

  function normalizeImages(value, fallback = DEFAULT_IMAGE) {
    const fallbackImages = Array.isArray(fallback) ? fallback : [fallback];
    const parts = Array.isArray(value)
      ? value
      : String(value || "").split(",");
    const images = parts
      .map((part) => String(part || "").trim())
      .filter(Boolean);

    if (images.length) {
      return Array.from(new Set(images));
    }

    return fallbackImages
      .map((part) => String(part || "").trim())
      .filter(Boolean);
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

      const text = await response.text();
      validateCsvText(text, url);
      return text;
    } finally {
      if (timer) {
        window.clearTimeout(timer);
      }
    }
  }

  function validateCsvText(text, url) {
    const content = String(text || "").trim();
    const firstLine = content.split(/\r?\n/, 1)[0] || "";
    const normalizedFirstLine = firstLine.toLowerCase();

    if (!content) {
      throw new Error(`Respuesta vacia desde ${url}`);
    }

    if (normalizedFirstLine.startsWith("<!doctype") || normalizedFirstLine.startsWith("<html")) {
      throw new Error(`La fuente ${url} devolvio HTML en vez de CSV`);
    }

    const headers = firstLine.split(",").map((header) => header.replace(/^\uFEFF/, "").trim().toLowerCase());
    const hasProductHeader = SHEET_COLUMNS.name
      .some((name) => headers.includes(String(name).trim().toLowerCase()));

    if (!hasProductHeader) {
      throw new Error(`La fuente ${url} no tiene encabezado de productos`);
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
          images: [DEFAULT_IMAGE],
          category: "",
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
      const categoryValue = String(getSheetCell(row, SHEET_COLUMNS.category) || "").trim();
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
        const images = normalizeImages(imageValue, []);
        if (images.length) {
          group.image = images[0];
          group.images = images;
        }
      }

      if (categoryValue) {
        group.category = categoryValue;
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
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products.map(normalizeProduct)));
    } catch (error) {
      // La tienda debe seguir funcionando aunque el navegador bloquee storage.
    }
  }

  function resetProducts() {
    try {
      localStorage.removeItem(STORAGE_PRODUCTS_KEY);
    } catch (error) {
      // Sin accion: el cache es una mejora, no una dependencia critica.
    }
    return [];
  }

  function getFallbackProducts() {
    return mergeSheetRowsIntoProducts(parseCsv(FALLBACK_CSV));
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
      const fallbackProducts = cachedProducts.length ? cachedProducts : getFallbackProducts();

      return {
        products: fallbackProducts,
        meta: {
          rows: 0,
          syncedProductsCount: fallbackProducts.length,
          managedProductsCount: fallbackProducts.length,
          sourceUrl: SHEET_CSV_URL,
          state: "error",
          usingCache: cachedProducts.length > 0,
          usingFallback: cachedProducts.length === 0,
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
    syncProductsFromSheet
  };
})();
