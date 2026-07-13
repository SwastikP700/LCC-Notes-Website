/*==================================================
        LCC EDUCATION NOTES
        script.js
        Part 1
==================================================*/
/*==========================================
            NOTES DATABASE
==========================================*/
const notes = [
  {
    id: 1,
    title: "Microsoft Excel Notes",
    file: "notes/excel.pdf",
    available: true,
    icon: "fa-file-excel",
    class: "excel"
  },
  {
    id: 2,
    title: "Internet Notes",
    file: "notes/internet.pdf",
    available: true,
    icon: "fa-globe",
    class: "internet"
  },
  {
    id: 3,
    title: "Web Development Notes",
    file: "notes/web-development.pdf",
    available: true,
    icon: "fa-code",
    class: "web"
  },
  {
    id: 4,
    title: "C Language Notes",
    file: "",
    available: false,
    icon: "fa-c",
    class: "c"
  },
  {
    id: 5,
    title: "Accounting Notes",
    file: "",
    available: false,
    icon: "fa-calculator",
    class: "accounting"
  },
];
/*==========================================
        DOM ELEMENTS
==========================================*/
const notesContainer = document.getElementById("notesContainer");
const searchInput = document.getElementById("searchNotes");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuBtn = document.getElementById("menuBtn");
const startBtn = document.getElementById("startBtn");
const welcomeSection = document.getElementById("welcomeSection");
const featuresSection = document.querySelector(".features-section");
const viewerSection = document.getElementById("viewerSection");
const emptyState = document.getElementById("emptyState");
const pdfViewer = document.getElementById("pdfViewer");
const noteTitle = document.getElementById("noteTitle");
const backToTop = document.getElementById("backToTop");
const toast = document.getElementById("toast");
/*==========================================
        CURRENT STATE
==========================================*/
let currentNote = null;
/*==========================================
        CREATE NOTE CARD
==========================================*/
function createNoteCard(note) {
  return `
    <div
        class="note-card ${note.available ? "" : "disabled"}"
        data-id="${note.id}"
        data-title="${note.title}"
        data-file="${note.file}"
        data-status="${note.available}"
    >
        <div
            class="note-icon ${note.class}">
            <i class="fa-solid ${note.icon}"></i>
        </div>
        <div class="note-info">
            <h4>${note.title}</h4>
            <p>
                ${note.available ? "Available" : "Coming Soon"}
            </p>
        </div>
        <span class="badge ${note.available ? "available" : "coming"}">
            ${note.available ? "Available" : "Coming Soon"}
        </span>
    </div>
    `;
}
/*==========================================
        RENDER NOTES
==========================================*/
function renderNotes(data = notes) {
  notesContainer.innerHTML = "";
  data.forEach((note) => {
    notesContainer.innerHTML += createNoteCard(note);
  });
}
/*==========================================
        GET ALL NOTE CARDS
==========================================*/
function getCards() {
  return document.querySelectorAll(".note-card");
}
/*==========================================
        CLEAR ACTIVE CARD
==========================================*/
function clearActive() {
  getCards().forEach((card) => {
    card.classList.remove("active");
  });
}
/*==========================================
        ACTIVATE CARD
==========================================*/
function activateCard(card) {
  clearActive();
  card.classList.add("active");
}
/*==========================================
        TOAST MESSAGE
==========================================*/
function showToast(message, type = "success") {
  toast.className = "";
  toast.classList.add(type);
  toast.classList.add("show");
  toast.textContent = message;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
/*==========================================
        SHOW PDF VIEW
==========================================*/
function showViewer() {
  welcomeSection.style.display = "none";
  featuresSection.style.display = "none";
  viewerSection.style.display = "flex";
  emptyState.style.display = "none";
  pdfViewer.style.display = "flex";
}
/*==========================================
        SHOW EMPTY VIEW
==========================================*/
function showEmpty() {
  viewerSection.style.display = "flex";
  pdfViewer.style.display = "none";
  emptyState.style.display = "flex";
}
/*==========================================
        INITIAL SCREEN
==========================================*/
renderNotes();
showEmpty();
/*==================================================
        LCC EDUCATION NOTES
        script.js
        Part 2
==================================================*/
/*==========================================
            SEARCH NOTES
==========================================*/
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase().trim();
  const filtered = notes.filter((note) =>
    note.title.toLowerCase().includes(keyword),
  );
  renderNotes(filtered);
  attachCardEvents();
});
/*==========================================
            SIDEBAR OPEN
==========================================*/
function openSidebar() {
  sidebar.classList.add("show");
  overlay.classList.add("show");
}
/*==========================================
            SIDEBAR CLOSE
==========================================*/
function closeSidebar() {
  sidebar.classList.remove("show");
  overlay.classList.remove("show");
}
/*==========================================
            TOGGLE SIDEBAR
==========================================*/
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
  overlay.classList.toggle("show");
});
/*==========================================
            OVERLAY
==========================================*/
overlay.addEventListener("click", () => {
  closeSidebar();
});
/*==========================================
            START BUTTON
==========================================*/
startBtn.addEventListener("click", () => {
  if (window.innerWidth <= 992) {
    openSidebar();
  } else {
    sidebar.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
});
/*==========================================
            NOTE CLICK
==========================================*/
function attachCardEvents() {
  const cards = getCards();
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const available = card.dataset.status === "true";
      if (!available) {
        showToast(
          "Coming Soon",
          "error",
        );
        return;
      }
      activateCard(card);
      currentNote = {
        title: card.dataset.title,
        file: card.dataset.file,
      };
      noteTitle.textContent = currentNote.title;
      showViewer();
      closeSidebar();
      showToast(currentNote.title + " Loaded");
      if (typeof loadPDF === "function") {
        loadPDF(currentNote.file);
      }
    });
  });
}
/*==========================================
        BACK TO TOP
==========================================*/
window.addEventListener("scroll", () => {
  if (window.scrollY > 250) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});
backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
/*==========================================
        ESC CLOSE SIDEBAR
==========================================*/
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Escape") {
      closeSidebar();
    }
  },
);
/*==========================================
        CLOSE SIDEBAR
        AFTER CLICK (MOBILE)
==========================================*/
window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth > 992) {
      closeSidebar();
    }
  },
);
/*==========================================
        INITIALIZE EVENTS
==========================================*/
attachCardEvents();
/*==================================================
        LCC EDUCATION NOTES
        script.js
        Part 3 (Final)
==================================================*/
/*==========================================
        RESTORE HOME SCREEN
==========================================*/
function showHome() {
  viewerSection.style.display = "none";
  welcomeSection.style.display = "grid";
  featuresSection.style.display = "block";
  emptyState.style.display = "flex";
  pdfViewer.style.display = "none";
  clearActive();
  currentNote = null;
}
/*==========================================
        KEYBOARD SHORTCUTS
==========================================*/
document.addEventListener("keydown", (e) => {
  if (viewerSection.style.display !== "flex") return;
  switch (e.key) {
    case "ArrowLeft":
      if (typeof previousPage === "function") previousPage();
      break;
    case "ArrowRight":
      if (typeof nextPage === "function") nextPage();
      break;
    case "+":
    case "=":
      if (typeof zoomIn === "function") zoomIn();
      break;
    case "-":
    case "_":
      if (typeof zoomOut === "function") zoomOut();
      break;
    case "Home":
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      break;
  }
});
/*==========================================
        DOUBLE CLICK LOGO
        GO TO HOME
==========================================*/
document.querySelectorAll(".logo").forEach((logo) => {
  logo.addEventListener("dblclick", () => {
    showHome();
    showToast("Returned to Home");
  });
});
/*==========================================
        WINDOW RESIZE
==========================================*/
window.addEventListener("resize", () => {
  if (window.innerWidth > 992) {
    sidebar.classList.remove("show");
    overlay.classList.remove("show");
  }
});
/*==========================================
        SCROLL ANIMATION
==========================================*/
const animatedElements = document.querySelectorAll(
  ".feature-card,.stat,.empty-card",
);
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15,
  },
);
animatedElements.forEach((element) => {
  observer.observe(element);
});
/*==========================================
        FUTURE PLACEHOLDER
==========================================*/
function refreshSubjectCounter() {
  const total = notes.length;
  const counter = document.querySelector(".subject-counter strong");
  if (counter) {
    counter.textContent = total + " Notes";
  }
}
refreshSubjectCounter();
/*==========================================
        PDF LOAD CALLBACK
==========================================*/
window.noteLoaded = function (title) {
  showToast(title + " Ready");
};
/*==========================================
        PDF ERROR CALLBACK
==========================================*/
window.noteError = function () {
  showToast(
    "Unable to load PDF",
    "error",
  );
};
/*==========================================
        PAGE LOADED
==========================================*/
window.addEventListener("load", () => {
  showHome();
  showToast("Welcome to LCC Education Notes");
});
/*==========================================
        CONSOLE MESSAGE
==========================================*/
console.log(
  "%cLCC EDUCATION NOTES",
  "color:#1b5e20;font-size:22px;font-weight:bold;",
);
console.log("Version : 3.0");
console.log("UI Loaded Successfully");
/*==========================================
            END OF SCRIPT
==========================================*/
