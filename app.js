const OUTPUT_SPECS = Object.freeze([
  { usage: "hero", folder: "hero", width: 1200, height: 360, source: "main" },
  { usage: "hero", folder: "hero", width: 600, height: 180, source: "main" },
  { usage: "hero", folder: "hero", width: 640, height: 192, source: "main" },
  { usage: "header", folder: "header", width: 280, height: 84, source: "main" },
  { usage: "header", folder: "header", width: 240, height: 72, source: "main" },
  { usage: "header", folder: "header", width: 220, height: 66, source: "main" },
  { usage: "header", folder: "header", width: 180, height: 54, source: "main" },
  { usage: "header", folder: "header", width: 160, height: 48, source: "main" },
  { usage: "header", folder: "header", width: 120, height: 36, source: "main" },
  { usage: "favicon", folder: "favicon", width: 16, height: 16, source: "square" },
  { usage: "favicon", folder: "favicon", width: 32, height: 32, source: "square" },
  { usage: "favicon", folder: "favicon", width: 48, height: 48, source: "square" },
  { usage: "icon", folder: "icon", width: 64, height: 64, source: "square" },
  { usage: "icon", folder: "icon", width: 128, height: 128, source: "square" },
  { usage: "icon", folder: "icon", width: 180, height: 180, source: "square" },
  { usage: "icon", folder: "icon", width: 192, height: 192, source: "square" },
  { usage: "icon", folder: "icon", width: 256, height: 256, source: "square" },
  { usage: "icon", folder: "icon", width: 512, height: 512, source: "square" },
  { usage: "icon", folder: "icon", width: 1024, height: 1024, source: "square" },
]);

const REQUIRED_FAVICON_SIZES = [16, 32, 48];
const CUSTOM_USAGE_OPTIONS = Object.freeze(["hero", "header", "favicon", "icon"]);
const MAX_CUSTOM_ROWS = 50;
const MAX_CUSTOM_DIMENSION = 8192;

const CUSTOM_PRESETS = Object.freeze({
  responsive: Object.freeze([
    { usage: "hero", width: 1440, height: 432 },
    { usage: "hero", width: 960, height: 288 },
    { usage: "header", width: 320, height: 96 },
    { usage: "header", width: 200, height: 60 },
  ]),
  social: Object.freeze([
    { usage: "hero", width: 1200, height: 630 },
    { usage: "hero", width: 1200, height: 675 },
    { usage: "hero", width: 1080, height: 1080 },
  ]),
  app: Object.freeze([
    { usage: "icon", width: 72, height: 72 },
    { usage: "icon", width: 96, height: 96 },
    { usage: "icon", width: 144, height: 144 },
    { usage: "icon", width: 384, height: 384 },
    { usage: "favicon", width: 64, height: 64 },
  ]),
});

const USAGE_ORDER = Object.freeze({
  hero: 0,
  header: 1,
  favicon: 2,
  icon: 3,
});

const dom = {
  mainDropzone: document.getElementById("mainDropzone"),
  iconDropzone: document.getElementById("iconDropzone"),
  mainInput: document.getElementById("mainInput"),
  iconInput: document.getElementById("iconInput"),
  mainMeta: document.getElementById("mainMeta"),
  iconMeta: document.getElementById("iconMeta"),
  mainSourcePreview: document.getElementById("mainSourcePreview"),
  iconSourcePreview: document.getElementById("iconSourcePreview"),
  fitMode: document.getElementById("fitMode"),
  allowUpscale: document.getElementById("allowUpscale"),
  customPreset: document.getElementById("customPreset"),
  addPresetBtn: document.getElementById("addPresetBtn"),
  addCustomBtn: document.getElementById("addCustomBtn"),
  clearCustomBtn: document.getElementById("clearCustomBtn"),
  customRows: document.getElementById("customRows"),
  customSummary: document.getElementById("customSummary"),
  customError: document.getElementById("customError"),
  resizeBtn: document.getElementById("resizeBtn"),
  downloadAllBtn: document.getElementById("downloadAllBtn"),
  progressPanel: document.getElementById("progressPanel"),
  progressLabel: document.getElementById("progressLabel"),
  progressPercent: document.getElementById("progressPercent"),
  progressBar: document.getElementById("progressBar"),
  statusLine: document.getElementById("statusLine"),
  resultSummary: document.getElementById("resultSummary"),
  skippedPanel: document.getElementById("skippedPanel"),
  skippedList: document.getElementById("skippedList"),
  previewGrid: document.getElementById("previewGrid"),
};

const state = {
  mainSource: null,
  iconSource: null,
  results: [],
  skipped: [],
  isProcessing: false,
  isZipping: false,
  customRows: [],
  nextCustomRowId: 1,
};

const picaInstance =
  typeof window.pica === "function"
    ? window.pica({ features: ["js", "wasm", "ww"] })
    : null;

initialize();

function initialize() {
  if (!picaInstance || typeof window.JSZip !== "function") {
    setStatus("Required libraries failed to load. Check your network and reload.", true);
    dom.resizeBtn.disabled = true;
    dom.downloadAllBtn.disabled = true;
    return;
  }

  bindDropzone(dom.mainDropzone, dom.mainInput, "main");
  bindDropzone(dom.iconDropzone, dom.iconInput, "icon");
  initializeCustomRows();

  dom.resizeBtn.addEventListener("click", () => {
    void handleResizeAll();
  });

  dom.downloadAllBtn.addEventListener("click", () => {
    void handleDownloadAllZip();
  });
}

function initializeCustomRows() {
  dom.addCustomBtn.addEventListener("click", () => {
    addCustomRow();
  });

  dom.clearCustomBtn.addEventListener("click", () => {
    state.customRows = [];
    renderCustomRows();
    clearCustomError();
    setStatus("Custom sizes cleared.");
  });

  dom.addPresetBtn.addEventListener("click", () => {
    const presetKey = dom.customPreset.value;
    const preset = CUSTOM_PRESETS[presetKey] || [];
    if (preset.length === 0) {
      setStatus("No preset entries available.", true);
      return;
    }

    const existingKeys = gatherExistingSpecKeys();
    let added = 0;

    for (const entry of preset) {
      const key = specKey(entry.usage, entry.width, entry.height);
      if (existingKeys.has(key)) {
        continue;
      }

      if (state.customRows.length >= MAX_CUSTOM_ROWS) {
        break;
      }

      addCustomRow({
        usage: entry.usage,
        width: String(entry.width),
        height: String(entry.height),
      });
      existingKeys.add(key);
      added += 1;
    }

    if (added === 0) {
      setStatus("Preset sizes are already present or row limit reached.", true);
      return;
    }

    clearCustomError();
    setStatus(`Added ${added} preset size${added === 1 ? "" : "s"}.`);
  });

  dom.customRows.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const rowElement = target.closest("[data-row-id]");
    if (!rowElement) {
      return;
    }

    const rowId = Number.parseInt(rowElement.getAttribute("data-row-id") || "", 10);
    if (!Number.isInteger(rowId)) {
      return;
    }

    const row = state.customRows.find((item) => item.id === rowId);
    if (!row) {
      return;
    }

    if (target instanceof HTMLSelectElement && target.dataset.field === "usage") {
      row.usage = target.value;
      clearCustomError();
      updateCustomSummary();
      return;
    }

    if (target instanceof HTMLInputElement && target.dataset.field === "width") {
      row.width = target.value.replace(/[^\d]/g, "");
      if (target.value !== row.width) {
        target.value = row.width;
      }
      clearCustomError();
      updateCustomSummary();
      return;
    }

    if (target instanceof HTMLInputElement && target.dataset.field === "height") {
      row.height = target.value.replace(/[^\d]/g, "");
      if (target.value !== row.height) {
        target.value = row.height;
      }
      clearCustomError();
      updateCustomSummary();
    }
  });

  dom.customRows.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest("button[data-action='remove-custom-row']");
    if (!button) {
      return;
    }

    const rowElement = button.closest("[data-row-id]");
    if (!rowElement) {
      return;
    }

    const rowId = Number.parseInt(rowElement.getAttribute("data-row-id") || "", 10);
    if (!Number.isInteger(rowId)) {
      return;
    }

    state.customRows = state.customRows.filter((row) => row.id !== rowId);
    renderCustomRows();
    clearCustomError();
  });

  renderCustomRows();
}

function gatherExistingSpecKeys() {
  const keys = new Set(OUTPUT_SPECS.map((spec) => specKey(spec.usage, spec.width, spec.height)));

  for (const row of state.customRows) {
    const width = Number.parseInt(row.width, 10);
    const height = Number.parseInt(row.height, 10);
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      continue;
    }

    keys.add(specKey(row.usage, width, height));
  }

  return keys;
}

function addCustomRow(partialRow = {}) {
  if (state.customRows.length >= MAX_CUSTOM_ROWS) {
    setCustomError([`Custom size limit reached (${MAX_CUSTOM_ROWS} rows).`]);
    return;
  }

  state.customRows.push({
    id: state.nextCustomRowId,
    usage: partialRow.usage || "hero",
    width: partialRow.width || "",
    height: partialRow.height || "",
  });
  state.nextCustomRowId += 1;

  renderCustomRows();
  clearCustomError();
}

function renderCustomRows() {
  dom.customRows.innerHTML = "";

  if (state.customRows.length === 0) {
    dom.customRows.innerHTML = '<article class="custom-empty">No custom sizes yet. Click Add Size to start.</article>';
    updateCustomSummary();
    return;
  }

  for (const row of state.customRows) {
    const rowElement = document.createElement("article");
    rowElement.className = "custom-row";
    rowElement.setAttribute("data-row-id", String(row.id));

    const usageField = document.createElement("label");
    usageField.className = "custom-field";
    usageField.textContent = "Type";
    const usageSelect = document.createElement("select");
    usageSelect.setAttribute("data-field", "usage");

    for (const usage of CUSTOM_USAGE_OPTIONS) {
      const option = document.createElement("option");
      option.value = usage;
      option.textContent = usage;
      usageSelect.appendChild(option);
    }

    usageSelect.value = row.usage;
    usageField.appendChild(usageSelect);

    const widthField = document.createElement("label");
    widthField.className = "custom-field";
    widthField.textContent = "Width";
    const widthInput = document.createElement("input");
    widthInput.type = "text";
    widthInput.inputMode = "numeric";
    widthInput.placeholder = "e.g. 300";
    widthInput.setAttribute("data-field", "width");
    widthInput.value = row.width;
    widthField.appendChild(widthInput);

    const heightField = document.createElement("label");
    heightField.className = "custom-field";
    heightField.textContent = "Height";
    const heightInput = document.createElement("input");
    heightInput.type = "text";
    heightInput.inputMode = "numeric";
    heightInput.placeholder = "e.g. 90";
    heightInput.setAttribute("data-field", "height");
    heightInput.value = row.height;
    heightField.appendChild(heightInput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-secondary custom-remove";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("data-action", "remove-custom-row");

    rowElement.appendChild(usageField);
    rowElement.appendChild(widthField);
    rowElement.appendChild(heightField);
    rowElement.appendChild(removeButton);
    dom.customRows.appendChild(rowElement);
  }

  updateCustomSummary();
}

function updateCustomSummary() {
  const configured = state.customRows.filter((row) => row.width.trim() && row.height.trim()).length;
  dom.customSummary.textContent = configured === 0 ? "No custom sizes configured." : `${configured} custom size${configured === 1 ? "" : "s"} configured.`;
}

function setCustomError(errors) {
  if (!errors || errors.length === 0) {
    clearCustomError();
    return;
  }

  const visibleErrors = errors.slice(0, 3);
  const suffix = errors.length > visibleErrors.length ? ` (+${errors.length - visibleErrors.length} more)` : "";
  dom.customError.textContent = `${visibleErrors.join(" ")}${suffix}`;
  dom.customError.classList.remove("hidden");
}

function clearCustomError() {
  dom.customError.textContent = "";
  dom.customError.classList.add("hidden");
}

function bindDropzone(dropzone, input, slot) {
  input.addEventListener("change", () => {
    const [file] = input.files || [];
    if (file) {
      void handleFileSelection(file, slot);
    }
    input.value = "";
  });

  dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });

  ["dragenter", "dragover"].forEach((name) => {
    dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropzone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach((name) => {
    dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropzone.classList.remove("drag-over");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer?.files || [];
    if (file) {
      void handleFileSelection(file, slot);
    }
  });
}

async function handleFileSelection(file, slot) {
  if (!file.type.startsWith("image/")) {
    setStatus("Only image files are supported.", true);
    return;
  }

  setStatus(`Loading ${file.name}...`);

  try {
    const source = await loadImageSource(file);
    assignSource(slot, source);
    setStatus(`${slot === "main" ? "Main logo" : "Icon image"} ready.`);
  } catch (error) {
    console.error(error);
    setStatus(`Could not read image: ${error.message}`, true);
  }
}

function assignSource(slot, source) {
  if (slot === "main") {
    if (state.mainSource) {
      URL.revokeObjectURL(state.mainSource.url);
    }
    state.mainSource = source;
    renderSourcePreview(dom.mainSourcePreview, source);
    dom.mainMeta.textContent = `${source.fileName} - ${source.width}x${source.height} - ${formatBytes(
      source.fileSize
    )}`;
    return;
  }

  if (state.iconSource) {
    URL.revokeObjectURL(state.iconSource.url);
  }
  state.iconSource = source;
  renderSourcePreview(dom.iconSourcePreview, source);
  dom.iconMeta.textContent = `${source.fileName} - ${source.width}x${source.height} - ${formatBytes(
    source.fileSize
  )}`;
}

async function loadImageSource(file) {
  const url = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(url);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      throw new Error("Canvas 2D context is not available.");
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    return {
      fileName: file.name,
      fileSize: file.size,
      width: canvas.width,
      height: canvas.height,
      url,
      canvas,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unsupported or corrupted image file."));
    image.src = url;
  });
}

function renderSourcePreview(container, source) {
  container.textContent = "";
  const preview = document.createElement("img");
  preview.src = source.url;
  preview.alt = `${source.fileName} preview`;
  container.appendChild(preview);
}

async function handleResizeAll() {
  if (state.isProcessing || state.isZipping) {
    return;
  }

  if (!state.mainSource) {
    setStatus("Upload a main logo image first.", true);
    return;
  }

  const specBuild = buildMergedOutputSpecs();
  if (!specBuild.ok) {
    setCustomError(specBuild.errors);
    setStatus("Fix custom size errors before running resize.", true);
    return;
  }

  clearCustomError();

  clearResults();
  state.isProcessing = true;
  dom.resizeBtn.disabled = true;
  dom.downloadAllBtn.disabled = true;

  const fitMode = dom.fitMode.value === "cover" ? "cover" : "contain";
  const allowUpscale = dom.allowUpscale.checked;
  const tasks = specBuild.specs.map((spec) => ({
    ...spec,
    sourceAsset: spec.source === "main" ? state.mainSource : state.iconSource || state.mainSource,
  }));

  const totalSteps = tasks.length + 1;
  let completed = 0;

  setStatus(
    `Processing ${tasks.length} target${tasks.length === 1 ? "" : "s"}${specBuild.customCount > 0 ? ` (${specBuild.customCount} custom)` : ""}...`
  );
  setProgressByCount("Starting resize queue", completed, totalSteps);

  const faviconMap = new Map();

  try {
    for (const task of tasks) {
      const filename = toPngFilename(task.usage, task.width, task.height);
      setProgressByCount(`Rendering ${filename}`, completed, totalSteps);

      const rendered = await renderResizedPng(task.sourceAsset.canvas, task.width, task.height, {
        fitMode,
        allowUpscale,
      });

      if (rendered.skipped) {
        state.skipped.push({ filename, reason: rendered.reason });
      } else {
        const url = URL.createObjectURL(rendered.blob);
        const item = {
          usage: task.usage,
          folder: task.folder,
          filename,
          width: task.width,
          height: task.height,
          dimensionsText: `${task.width}x${task.height}`,
          bytes: rendered.blob.size,
          blob: rendered.blob,
          url,
          thumbnailUrl: url,
          isIco: false,
        };

        state.results.push(item);

        if (task.usage === "favicon") {
          faviconMap.set(task.width, item);
        }
      }

      completed += 1;
      setProgressByCount(`Processed ${filename}`, completed, totalSteps);
    }

    setProgressByCount("Building favicon.ico", completed, totalSteps);

    if (REQUIRED_FAVICON_SIZES.every((size) => faviconMap.has(size))) {
      const orderedPngBlobs = REQUIRED_FAVICON_SIZES.map((size) => faviconMap.get(size).blob);
      const icoBlob = await buildIcoBlob(orderedPngBlobs, REQUIRED_FAVICON_SIZES);
      const icoUrl = URL.createObjectURL(icoBlob);
      const icoThumb =
        faviconMap.get(48)?.thumbnailUrl ||
        faviconMap.get(32)?.thumbnailUrl ||
        faviconMap.get(16)?.thumbnailUrl ||
        icoUrl;

      state.results.push({
        usage: "favicon",
        folder: "favicon",
        filename: "favicon.ico",
        width: 48,
        height: 48,
        dimensionsText: "16x16, 32x32, 48x48",
        bytes: icoBlob.size,
        blob: icoBlob,
        url: icoUrl,
        thumbnailUrl: icoThumb,
        isIco: true,
      });
    } else {
      state.skipped.push({
        filename: "favicon.ico",
        reason: "Requires favicon-16x16.png, favicon-32x32.png, and favicon-48x48.png.",
      });
    }

    completed += 1;
    setProgressByCount("Completed", completed, totalSteps);

    sortResultsInPlace(state.results);
    renderResults();

    if (state.results.length === 0) {
      setStatus("No files generated. Enable upscaling or use a larger source image.", true);
      return;
    }

    dom.downloadAllBtn.disabled = false;
    setStatus(
      `Completed: ${state.results.length} file${state.results.length === 1 ? "" : "s"} ready${specBuild.customCount > 0 ? ` (${specBuild.customCount} custom target${specBuild.customCount === 1 ? "" : "s"})` : ""}.`
    );
  } catch (error) {
    console.error(error);
    setStatus(`Resize failed: ${error.message}`, true);
  } finally {
    state.isProcessing = false;
    dom.resizeBtn.disabled = false;
    if (state.results.length === 0) {
      dom.downloadAllBtn.disabled = true;
    }
  }
}

function buildMergedOutputSpecs() {
  const merged = OUTPUT_SPECS.map((spec) => ({ ...spec }));
  const seen = new Set(merged.map((spec) => specKey(spec.usage, spec.width, spec.height)));
  const errors = [];
  let customCount = 0;

  for (let index = 0; index < state.customRows.length; index += 1) {
    const row = state.customRows[index];
    const rowNumber = index + 1;
    const hasWidth = row.width.trim().length > 0;
    const hasHeight = row.height.trim().length > 0;

    if (!hasWidth && !hasHeight) {
      continue;
    }

    if (!hasWidth || !hasHeight) {
      errors.push(`Row ${rowNumber}: both width and height are required.`);
      continue;
    }

    const width = Number.parseInt(row.width, 10);
    const height = Number.parseInt(row.height, 10);

    if (!CUSTOM_USAGE_OPTIONS.includes(row.usage)) {
      errors.push(`Row ${rowNumber}: invalid type selected.`);
      continue;
    }

    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
      errors.push(`Row ${rowNumber}: width and height must be positive integers.`);
      continue;
    }

    if (width > MAX_CUSTOM_DIMENSION || height > MAX_CUSTOM_DIMENSION) {
      errors.push(`Row ${rowNumber}: max allowed dimension is ${MAX_CUSTOM_DIMENSION}.`);
      continue;
    }

    const key = specKey(row.usage, width, height);
    if (seen.has(key)) {
      errors.push(`Row ${rowNumber}: ${row.usage}-${width}x${height} already exists.`);
      continue;
    }

    seen.add(key);
    merged.push({
      usage: row.usage,
      folder: row.usage,
      width,
      height,
      source: resolveSourceForUsage(row.usage),
    });
    customCount += 1;
  }

  if (errors.length > 0) {
    return { ok: false, errors, specs: [], customCount: 0 };
  }

  return { ok: true, errors: [], specs: merged, customCount };
}

function resolveSourceForUsage(usage) {
  return usage === "hero" || usage === "header" ? "main" : "square";
}

function specKey(usage, width, height) {
  return `${usage}:${width}x${height}`;
}

async function renderResizedPng(sourceCanvas, targetWidth, targetHeight, options) {
  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;
  const containScale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const coverScale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const scale = options.fitMode === "cover" ? coverScale : containScale;

  if (!options.allowUpscale && scale > 1) {
    return {
      skipped: true,
      reason: `Upscaling disabled (source ${sourceWidth}x${sourceHeight}).`,
    };
  }

  const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
  const drawHeight = Math.max(1, Math.round(sourceHeight * scale));

  let resizedCanvas = sourceCanvas;

  if (drawWidth !== sourceWidth || drawHeight !== sourceHeight) {
    resizedCanvas = document.createElement("canvas");
    resizedCanvas.width = drawWidth;
    resizedCanvas.height = drawHeight;

    await picaInstance.resize(sourceCanvas, resizedCanvas, {
      alpha: true,
      unsharpAmount: 80,
      unsharpRadius: 0.6,
      unsharpThreshold: 2,
    });
  }

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = targetWidth;
  outputCanvas.height = targetHeight;

  const outputContext = outputCanvas.getContext("2d", { alpha: true });
  if (!outputContext) {
    throw new Error("Canvas 2D context is not available.");
  }

  outputContext.clearRect(0, 0, targetWidth, targetHeight);

  const offsetX = Math.round((targetWidth - drawWidth) / 2);
  const offsetY = Math.round((targetHeight - drawHeight) / 2);
  outputContext.drawImage(resizedCanvas, offsetX, offsetY, drawWidth, drawHeight);

  const blob = await canvasToBlob(outputCanvas, "image/png");
  return { skipped: false, blob };
}

function canvasToBlob(canvas, mimeType) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Could not encode image output."));
      }
    }, mimeType);
  });
}

async function buildIcoBlob(pngBlobs, sizes) {
  const pngArrays = await Promise.all(
    pngBlobs.map(async (blob) => {
      const buffer = await blob.arrayBuffer();
      return new Uint8Array(buffer);
    })
  );

  const count = pngArrays.length;
  const headerSize = 6;
  const entrySize = 16;
  let imageOffset = headerSize + entrySize * count;
  let totalSize = imageOffset;

  for (const bytes of pngArrays) {
    totalSize += bytes.length;
  }

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);

  for (let index = 0; index < count; index += 1) {
    const iconSize = sizes[index];
    const imageBytes = pngArrays[index];
    const entryOffset = headerSize + index * entrySize;

    view.setUint8(entryOffset, iconSize === 256 ? 0 : iconSize);
    view.setUint8(entryOffset + 1, iconSize === 256 ? 0 : iconSize);
    view.setUint8(entryOffset + 2, 0);
    view.setUint8(entryOffset + 3, 0);
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, imageBytes.length, true);
    view.setUint32(entryOffset + 12, imageOffset, true);

    bytes.set(imageBytes, imageOffset);
    imageOffset += imageBytes.length;
  }

  return new Blob([buffer], { type: "image/x-icon" });
}

function clearResults() {
  if (state.results.length > 0) {
    const urls = new Set();
    for (const result of state.results) {
      if (result.url) {
        urls.add(result.url);
      }
      if (result.thumbnailUrl) {
        urls.add(result.thumbnailUrl);
      }
    }

    urls.forEach((url) => URL.revokeObjectURL(url));
  }

  state.results = [];
  state.skipped = [];
  dom.previewGrid.innerHTML = '<article class="empty-state">Processing...</article>';
  dom.resultSummary.textContent = "0 files ready";
  dom.skippedPanel.classList.add("hidden");
  dom.skippedList.innerHTML = "";
}

function renderResults() {
  dom.previewGrid.innerHTML = "";

  if (state.results.length === 0) {
    dom.previewGrid.innerHTML =
      '<article class="empty-state">No generated files. Try enabling upscaling or using a larger source image.</article>';
  } else {
    state.results.forEach((result, index) => {
      const card = document.createElement("article");
      card.className = "asset-card";
      card.style.setProperty("--delay", `${index * 22}ms`);

      const thumbFrame = document.createElement("div");
      thumbFrame.className = "thumb-frame";
      const img = document.createElement("img");
      img.src = result.thumbnailUrl || result.url;
      img.alt = result.filename;
      thumbFrame.appendChild(img);

      const name = document.createElement("p");
      name.className = "asset-name";
      name.textContent = result.filename;

      const meta = document.createElement("p");
      meta.className = "asset-meta";
      meta.textContent = `${result.dimensionsText} - ${formatBytes(result.bytes)}`;

      const button = document.createElement("button");
      button.className = "btn btn-secondary asset-download";
      button.type = "button";
      button.textContent = "Download";
      button.addEventListener("click", () => {
        triggerDownload(result.blob, result.filename);
      });

      card.appendChild(thumbFrame);
      card.appendChild(name);
      card.appendChild(meta);
      card.appendChild(button);
      dom.previewGrid.appendChild(card);
    });
  }

  dom.resultSummary.textContent = `${state.results.length} file${state.results.length === 1 ? "" : "s"} ready`;
  renderSkipped();
}

function renderSkipped() {
  if (state.skipped.length === 0) {
    dom.skippedPanel.classList.add("hidden");
    dom.skippedList.innerHTML = "";
    return;
  }

  dom.skippedPanel.classList.remove("hidden");
  dom.skippedList.innerHTML = "";

  for (const item of state.skipped) {
    const li = document.createElement("li");
    li.textContent = `${item.filename} - ${item.reason}`;
    dom.skippedList.appendChild(li);
  }
}

async function handleDownloadAllZip() {
  if (state.isProcessing || state.isZipping || state.results.length === 0) {
    return;
  }

  state.isZipping = true;
  dom.downloadAllBtn.disabled = true;
  const originalLabel = dom.downloadAllBtn.textContent;
  dom.downloadAllBtn.textContent = "Preparing ZIP...";

  setStatus("Building ZIP archive...");
  setProgress("Building ZIP", 0);

  try {
    const zip = new window.JSZip();
    const folders = {
      hero: zip.folder("hero"),
      header: zip.folder("header"),
      favicon: zip.folder("favicon"),
      icon: zip.folder("icon"),
    };

    for (const result of state.results) {
      const folder = folders[result.folder];
      folder.file(result.filename, result.blob);
    }

    const zipBlob = await zip.generateAsync(
      {
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        setProgress("Building ZIP", metadata.percent);
      }
    );

    const zipName = `multisize-assets-${todayStamp(new Date())}.zip`;
    triggerDownload(zipBlob, zipName);

    setProgress("ZIP ready", 100);
    setStatus(`Downloaded ${zipName}.`);
  } catch (error) {
    console.error(error);
    setStatus(`ZIP export failed: ${error.message}`, true);
  } finally {
    state.isZipping = false;
    dom.downloadAllBtn.disabled = state.results.length === 0;
    dom.downloadAllBtn.textContent = originalLabel;
  }
}

function triggerDownload(blob, filename) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(href);
  }, 0);
}

function toPngFilename(usage, width, height) {
  return `${usage}-${width}x${height}.png`;
}

function sortResultsInPlace(results) {
  results.sort((left, right) => {
    const usageDiff = USAGE_ORDER[left.usage] - USAGE_ORDER[right.usage];
    if (usageDiff !== 0) {
      return usageDiff;
    }

    if (left.isIco && !right.isIco) {
      return 1;
    }

    if (!left.isIco && right.isIco) {
      return -1;
    }

    const leftArea = left.width * left.height;
    const rightArea = right.width * right.height;
    if (leftArea !== rightArea) {
      return leftArea - rightArea;
    }

    return left.filename.localeCompare(right.filename);
  });
}

function setStatus(message, isError = false) {
  dom.statusLine.textContent = message;
  dom.statusLine.classList.toggle("error", isError);
}

function setProgressByCount(label, completed, total) {
  const percent = total === 0 ? 0 : (completed / total) * 100;
  setProgress(label, percent);
}

function setProgress(label, percent) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  dom.progressPanel.classList.remove("hidden");
  dom.progressLabel.textContent = label;
  dom.progressPercent.textContent = `${value}%`;
  dom.progressBar.style.width = `${value}%`;
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = -1;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unitIndex]}`;
}

function todayStamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
