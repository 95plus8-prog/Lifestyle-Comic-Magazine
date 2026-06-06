const gallery = Array.isArray(window.galleryItems) ? window.galleryItems : [];
const seriesLabels = window.seriesLabels || {};
const grid = document.querySelector(".apple-grid");
const seriesBar = document.querySelector(".series-bar");
const totalCount = document.querySelector("#total-count");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
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

function cardClass(index) {
  if (index % 11 === 2 || index % 11 === 7) {
    return "apple-card wide glass-panel";
  }
  if (index % 9 === 0 || index % 9 === 5) {
    return "apple-card tall glass-panel";
  }
  return "apple-card glass-panel";
}

function renderSeries() {
  const buttons = [
    { series: "all", label: "全部" },
    ...seriesOrder(gallery).map((series) => ({ series, label: labelFor(series) })),
  ];

  seriesBar.innerHTML = "";
  buttons.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `series-button${index === 0 ? " is-active" : ""}`;
    button.textContent = item.label;
    button.addEventListener("click", () => {
      seriesBar.querySelectorAll(".series-button").forEach((node) => {
        node.classList.remove("is-active");
      });
      button.classList.add("is-active");
      renderGrid(bySeries(item.series));
    });
    seriesBar.append(button);
  });
}

function renderGrid(items) {
  visibleItems = items;
  grid.innerHTML = "";
  totalCount.textContent = countText(items.length);

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-gallery glass-panel";
    empty.textContent = "这一辑还没有作品";
    grid.append(empty);
    return;
  }

  items.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = cardClass(index);

    const button = document.createElement("button");
    button.type = "button";

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.title || `${labelFor(item.series || "other")}作品`;
    img.loading = "lazy";

    const caption = document.createElement("span");
    caption.className = "card-caption";
    caption.innerHTML = `<strong>${item.title || "未命名作品"}</strong><span>${labelFor(item.series || "other")}</span>`;

    button.append(img, caption);
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
  lightboxImage.alt = item.title || `${labelFor(item.series || "other")}作品`;
  lightboxCaption.textContent = `${item.title || "未命名作品"} · ${labelFor(item.series || "other")}`;
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
