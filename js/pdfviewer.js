/*==================================================
        LCC EDUCATION NOTES
        pdfviewer.js
        Part 1
==================================================*/
/*==========================================
            PDF.JS SETUP
==========================================*/
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs/pdf.worker.js";
/*==========================================
            DOM ELEMENTS
==========================================*/
const pdfCanvas = document.getElementById("pdfCanvas");
const pdfContainer = document.getElementById("pdfContainer");
const pageInfo = document.getElementById("pageInfo");
const zoomLevel = document.getElementById("zoomLevel");
const loadingScreen = document.getElementById("loadingScreen");
const canvasContext = pdfCanvas.getContext("2d");
/*==========================================
            PDF VARIABLES
==========================================*/
let pdfDocument = null;
let currentPage = 1;
let totalPages = 0;
let currentScale = 1.2;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.2;
let isRendering = false;
let pendingPage = null;
/*==========================================
        LOADING SCREEN
==========================================*/
function showLoader() {
  loadingScreen.style.display = "flex";
}
function hideLoader() {
  loadingScreen.style.display = "none";
}
/*==========================================
        UPDATE PAGE INFO
==========================================*/
function updatePageInfo() {
  pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
}
function updateZoomLevel() {
  zoomLevel.textContent = `${Math.round(currentScale * 100)}%`;
}
/*==========================================
        RENDER QUEUE
==========================================*/
function queueRender(page) {
  if (isRendering) {
    pendingPage = page;
    return;
  }
  renderPage(page);
}
/*==========================================
        RENDER PDF PAGE
==========================================*/
async function renderPage(pageNumber) {
    if (!pdfDocument) return;
    isRendering = true;
    showLoader();
    try {
        const page = await pdfDocument.getPage(pageNumber);
        // Calculate the best scale to fit the container
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = pdfContainer.clientWidth - 20;
        const fitScale = availableWidth / baseViewport.width;
        const finalScale = fitScale * currentScale;
        const viewport = page.getViewport({
            scale: finalScale
        });
        // High-DPI (Retina) rendering
        const pixelRatio = window.devicePixelRatio || 1;
        pdfCanvas.width = Math.floor(viewport.width * pixelRatio);
        pdfCanvas.height = Math.floor(viewport.height * pixelRatio);
        pdfCanvas.style.width = viewport.width + "px";
        pdfCanvas.style.height = viewport.height + "px";
        canvasContext.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );
        canvasContext.clearRect(
            0,
            0,
            pdfCanvas.width,
            pdfCanvas.height
        );
        const renderContext = {
            canvasContext: canvasContext,
            viewport: viewport
        };
        await page.render(renderContext).promise;
        updatePageInfo();
        updateZoomLevel();
        if (typeof updateNavigationButtons === "function") {
            updateNavigationButtons();
        }
    }
    catch (error) {
        console.error("Render Error:", error);
        if (typeof noteError === "function") {
            noteError();
        }
    }
    finally {
        isRendering = false;
        hideLoader();
        if (pendingPage !== null) {
            const nextPage = pendingPage;
            pendingPage = null;
            renderPage(nextPage);
        }
    }
}
/*==================================================
        LCC EDUCATION NOTES
        pdfviewer.js
        Part 2
==================================================*/
/*==========================================
            RESET VIEWER
==========================================*/
function resetViewer() {
  pdfDocument = null;
  currentPage = 1;
  totalPages = 0;
  currentScale = 1.2;
  pendingPage = null;
  isRendering = false;
  canvasContext.clearRect(
    0,
    0,
    pdfCanvas.width,
    pdfCanvas.height,
  );
  pdfCanvas.width = 0;
  pdfCanvas.height = 0;
  updatePageInfo();
  updateZoomLevel();
}
/*==========================================
            LOAD PDF
==========================================*/
async function loadPDF(file) {
  if (!file) {
    if (typeof noteError === "function") {
      noteError();
    }
    return;
  }
  resetViewer();
  showLoader();
  try {
    const loadingTask = pdfjsLib.getDocument({
      url: file,
    });
    pdfDocument = await loadingTask.promise;
    totalPages = pdfDocument.numPages;
    currentPage = 1;
    updatePageInfo();
    updateZoomLevel();
    await renderPage(currentPage);
    if (typeof noteLoaded === "function") {
      noteLoaded(document.getElementById("noteTitle").textContent);
    }
  } catch (error) {
    console.error(
      "PDF Load Error:",
      error,
    );
    hideLoader();
    if (typeof noteError === "function") {
      noteError();
    }
    resetViewer();
  }
}
/*==========================================
        RELOAD CURRENT PAGE
==========================================*/
function refreshCurrentPage() {
  if (!pdfDocument) return;
  queueRender(currentPage);
}
/*==========================================
        PDF INFORMATION
==========================================*/
function getCurrentPage() {
  return currentPage;
}
function getTotalPages() {
  return totalPages;
}
function getCurrentScale() {
  return currentScale;
}
/*==========================================
        PDF READY CHECK
==========================================*/
function isPDFLoaded() {
  return pdfDocument !== null;
}
/*==========================================
        HANDLE WINDOW RESIZE
==========================================*/
let resizeTimeout;
window.addEventListener(
  "resize",
  () => {
    if (!pdfDocument) return;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      refreshCurrentPage();
    }, 250);
  },
);
/*==========================================
        VISIBILITY CHANGE
==========================================*/
document.addEventListener(
  "visibilitychange",
  () => {
    if (!document.hidden && pdfDocument) {
      refreshCurrentPage();
    }
  },
);
/*==========================================
        PRELOAD FIRST PAGE
==========================================*/
async function preloadFirstPage() {
  if (!pdfDocument) return;
  try {
    await pdfDocument.getPage(1);
  } catch (error) {
    console.warn("Preload skipped.");
  }
}
/*==================================================
        LCC EDUCATION NOTES
        pdfviewer.js
        Part 3
==================================================*/
/*==========================================
        GO TO PAGE
==========================================*/
function goToPage(page) {
  if (!pdfDocument) return;
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  queueRender(currentPage);
}
/*==========================================
        PREVIOUS PAGE
==========================================*/
function previousPage() {
  if (!pdfDocument) return;
  if (currentPage <= 1) {
    showToast(
      "Already on the first page",
      "error",
    );
    return;
  }
  currentPage--;
  queueRender(currentPage);
}
/*==========================================
        NEXT PAGE
==========================================*/
function nextPage() {
  if (!pdfDocument) return;
  if (currentPage >= totalPages) {
    showToast(
      "Already on the last page",
      "error",
    );
    return;
  }
  currentPage++;
  queueRender(currentPage);
}
/*==========================================
        ZOOM IN
==========================================*/
function zoomIn() {
  if (!pdfDocument) return;
  if (currentScale >= MAX_SCALE) {
    showToast(
      "Maximum zoom reached",
      "error",
    );
    return;
  }
  currentScale += SCALE_STEP;
  currentScale = Math.min(
    currentScale,
    MAX_SCALE,
  );
  queueRender(currentPage);
}
/*==========================================
        ZOOM OUT
==========================================*/
function zoomOut() {
  if (!pdfDocument) return;
  if (currentScale <= MIN_SCALE) {
    showToast(
      "Minimum zoom reached",
      "error",
    );
    return;
  }
  currentScale -= SCALE_STEP;
  currentScale = Math.max(
    currentScale,
    MIN_SCALE,
  );
  queueRender(currentPage);
}
/*==========================================
        FIT TO WIDTH
        (Future Ready)
==========================================*/
function fitToWidth() {
  if (!pdfDocument) return;
  currentScale = 1.2;
  queueRender(currentPage);
}
/*==========================================
        BUTTON STATES
==========================================*/
function updateNavigationButtons() {
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
  }
}
/*==========================================
        OVERRIDE PAGE INFO
==========================================*/
const oldUpdatePageInfo = updatePageInfo;
updatePageInfo = function () {
  oldUpdatePageInfo();
  updateNavigationButtons();
};
/*==========================================
        MOUSE WHEEL ZOOM
==========================================*/
pdfContainer.addEventListener(
  "wheel",
  (event) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  },
  {
    passive: false,
  },
);
/*==========================================
        DOUBLE CLICK
        FIT TO WIDTH
==========================================*/
pdfCanvas.addEventListener(
  "dblclick",
  () => {
    fitToWidth();
  },
);
/*==========================================
        PAGE CHANGE CALLBACK
==========================================*/
function pageChanged() {
  updatePageInfo();
}
/*==========================================
        REPLACE RENDER QUEUE
==========================================*/
const originalQueueRender = queueRender;
queueRender = function (page) {
  originalQueueRender(page);
  pageChanged();
};
/*==========================================
        PDF CONTROLS READY
==========================================*/
console.log("PDF Navigation Ready");
/*==================================================
        LCC EDUCATION NOTES
        pdfviewer.js
        Part 4 (Final)
==================================================*/
/*==========================================
        BUTTON REFERENCES
==========================================*/
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
/*==========================================
        BUTTON EVENTS
==========================================*/
if (prevPageBtn) {
  prevPageBtn.addEventListener(
    "click",
    previousPage,
  );
}
if (nextPageBtn) {
  nextPageBtn.addEventListener(
    "click",
    nextPage,
  );
}
if (zoomInBtn) {
  zoomInBtn.addEventListener(
    "click",
    zoomIn,
  );
}
if (zoomOutBtn) {
  zoomOutBtn.addEventListener(
    "click",
    zoomOut,
  );
}
/*==========================================
        VIEWER KEYBOARD SHORTCUTS
==========================================*/
document.addEventListener(
  "keydown",
  (event) => {
    if (!isPDFLoaded()) return;
    switch (event.key) {
      case "ArrowLeft":
        previousPage();
        break;
      case "ArrowRight":
        nextPage();
        break;
      case "+":
      case "=":
        zoomIn();
        break;
      case "-":
      case "_":
        zoomOut();
        break;
    }
  },
);
/*==========================================
        TOUCH SUPPORT
==========================================*/
let touchStartX = 0;
let touchEndX = 0;
pdfContainer.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].screenX;
  },
);
pdfContainer.addEventListener(
  "touchend",
  (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) < 80) return;
    if (distance > 0) {
      previousPage();
    } else {
      nextPage();
    }
  },
);
/*==========================================
        CLEANUP
==========================================*/
function destroyViewer() {
  pdfDocument = null;
  currentPage = 1;
  totalPages = 0;
  pendingPage = null;
  isRendering = false;
  currentScale = 1.2;
  canvasContext.clearRect(
    0,
    0,
    pdfCanvas.width,
    pdfCanvas.height,
  );
}
/*==========================================
        GLOBAL FUNCTIONS
==========================================*/
window.loadPDF = loadPDF;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.goToPage = goToPage;
window.fitToWidth = fitToWidth;
window.destroyViewer = destroyViewer;
window.isPDFLoaded = isPDFLoaded;
/*==========================================
        INITIALIZE VIEWER
==========================================*/
updateZoomLevel();
updatePageInfo();
hideLoader();
updateNavigationButtons();
/*==========================================
        PDF VIEWER READY
==========================================*/
console.log(
  "%cPDF Viewer Ready",
  "color:#1b5e20;font-size:18px;font-weight:bold;",
);
console.log("PDF.js Successfully Initialized");
/*==========================================
            END OF FILE
==========================================*/
