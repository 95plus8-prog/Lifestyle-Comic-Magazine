const gallery = Array.isArray(window.galleryItems) ? window.galleryItems : [];
const seriesLabels = window.seriesLabels || {};
const grid = document.querySelector(".comic-grid");
const seriesStrip = document.querySelector(".series-strip");
const workCount = document.querySelector("#work-count");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const closeButton = document.querySelector(".lightbox-close");
const navButtons = document.querySelectorAll(".lightbox-nav");

let visibleItems = gallery;
let activeIndex = 0;

function labelFor(series) {
  return seriesLabels[series] || series || "其他";
}

function countText(count) {
  return String(count).padStart(2, "0");
}

function seriesOrder(items) {
  const preferred = ["travel", "city", "food", "sport", "nature", "bw", "light", "other"];
  const present = new Set(items.map((item) => item.series || "other"));
  return preferred.filter((series) => present.has(series));
}

function bySeries(series) {
  return series === "all" ? gallery : gallery.filter((item) => (item.series || "other") === series);
}

function renderSeries() {
  const buttons = [
    { series: "all", label: "全部" },
    ...seriesOrder(gallery).map((series) => ({ series, label: labelFor(series) })),
  ];

  seriesStrip.innerHTML = "";
  buttons.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `series-button${index === 0 ? " is-active" : ""}`;
    button.textContent = item.label;
    button.addEventListener("click", () => {
      seriesStrip.querySelectorAll(".series-button").forEach((node) => {
        node.classList.remove("is-active");
      });
      button.classList.add("is-active");
      renderGrid(bySeries(item.series));
    });
    seriesStrip.append(button);
  });
}

function renderGrid(items) {
  visibleItems = items;
  grid.innerHTML = "";
  workCount.textContent = countText(items.length);

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-gallery";
    empty.textContent = "这一辑还没有作品";
    grid.append(empty);
    return;
  }

  items.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "comic-card";

    const button = document.createElement("button");
    button.type = "button";

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = `${labelFor(item.series || "other")}作品`;
    img.loading = "lazy";

    button.append(img);
    button.addEventListener("click", () => openLightbox(index));
    article.append(button);
    grid.append(article);
  });
}

function renderLightbox() {
  const item = visibleItems[activeIndex];
  if (!item) {
    return;
  }

  lightboxImage.src = item.src;
  lightboxImage.alt = `${labelFor(item.series || "other")}作品`;
}

function openLightbox(index) {
  activeIndex = index;
  renderLightbox();
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  closeButton.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

function showAdjacent(direction) {
  if (visibleItems.length < 2) {
    return;
  }
  const offset = direction === "previous" ? -1 : 1;
  activeIndex = (activeIndex + offset + visibleItems.length) % visibleItems.length;
  renderLightbox();
}

closeButton.addEventListener("click", closeLightbox);

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showAdjacent(button.dataset.direction);
  });
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) {
    return;
  }
  if (event.key === "Escape") {
    closeLightbox();
  }
  if (event.key === "ArrowLeft") {
    showAdjacent("previous");
  }
  if (event.key === "ArrowRight") {
    showAdjacent("next");
  }
});

renderSeries();
renderGrid(gallery);
