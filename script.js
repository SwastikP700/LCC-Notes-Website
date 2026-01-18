pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;

// Set initial scale based on screen size
let scale = window.innerWidth <= 768 ? 1.0 : 2.0;
const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

// Drag functionality variables
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;
const scrollContainer = document.querySelector(".pdf-canvas-container");

function switchTab(tabName) {
  const tabs = document.querySelectorAll(".tab-content");
  const buttons = document.querySelectorAll(".tab-button");

  tabs.forEach((tab) => tab.classList.remove("active"));
  buttons.forEach((btn) => btn.classList.remove("active"));

  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");
}

// Load PDF from URL
function loadPDFFromURL() {
  const pdfUrl = "./media/Internet-Note.pdf";

  pdfjsLib
    .getDocument(pdfUrl)
    .promise.then((pdf) => {
      pdfDoc = pdf;
      document.getElementById("pageCount").textContent = pdf.numPages;
      document.querySelector(".file-upload-area").style.display = "none";
      document.getElementById("pdfViewer").style.display = "block";
      renderPage(pageNum);
    })
    .catch((err) => {
      console.error("Error loading PDF:", err);
      alert("Please update the PDF URL in the code");
    });
}

// Auto-load PDF when page loads
window.addEventListener("load", loadPDFFromURL);

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: scale });

    // Increase canvas resolution for sharper rendering
    const outputScale = window.devicePixelRatio || 2;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      transform: transform,
    };

    const renderTask = page.render(renderContext);
    renderTask.promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  document.getElementById("pageNum").textContent = num;
  updateButtons();
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function previousPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function nextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

function zoomIn() {
  scale += 0.25;
  if (pdfDoc) renderPage(pageNum);
}

function zoomOut() {
  if (scale <= 0.5) return;
  scale -= 0.25;
  if (pdfDoc) renderPage(pageNum);
}

function resetZoom() {
  // Reset to different default zoom based on screen size
  scale = window.innerWidth <= 768 ? 1.0 : 2.0;
  if (pdfDoc) renderPage(pageNum);
}

function updateButtons() {
  document.getElementById("prevBtn").disabled = pageNum <= 1;
  document.getElementById("nextBtn").disabled =
    pageNum >= (pdfDoc ? pdfDoc.numPages : 1);
}

// Drag to scroll functionality
scrollContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  scrollContainer.style.cursor = "grabbing";
  startX = e.pageX - scrollContainer.offsetLeft;
  startY = e.pageY - scrollContainer.offsetTop;
  scrollLeft = scrollContainer.scrollLeft;
  scrollTop = scrollContainer.scrollTop;
});

scrollContainer.addEventListener("mouseleave", () => {
  isDragging = false;
  scrollContainer.style.cursor = "grab";
});

scrollContainer.addEventListener("mouseup", () => {
  isDragging = false;
  scrollContainer.style.cursor = "grab";
});

scrollContainer.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - scrollContainer.offsetLeft;
  const y = e.pageY - scrollContainer.offsetTop;
  const walkX = (x - startX) * 1.5;
  const walkY = (y - startY) * 1.5;
  scrollContainer.scrollLeft = scrollLeft - walkX;
  scrollContainer.scrollTop = scrollTop - walkY;
});

// Handle window resize to adjust scale if needed
window.addEventListener("resize", () => {
  const newScale = window.innerWidth <= 768 ? 1.0 : 2.0;
  // Only update if scale is still at default (user hasn't zoomed)
  if ((window.innerWidth <= 768 && scale === 2.0) || 
      (window.innerWidth > 768 && scale === 1.0)) {
    scale = newScale;
    if (pdfDoc) renderPage(pageNum);
  }
});

// Disable right-click on canvas to prevent downloading
canvas.addEventListener("contextmenu", (e) => e.preventDefault());