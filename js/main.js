/* ==========================================================================
   AN NHIÊN – THẾ GIỚI HOA ĐÀ LẠT
   Bách khoa hoa, cây cảnh và thực vật cao nguyên
   Tác giả: Trịnh Thị An – An Nhiên AI (TTA)
   File: js/main.js (Điều khiển trung tâm: Tìm kiếm, Bộ lọc, Trang hồ sơ 20 mục,
   Lightbox đa chức năng, Chuyên mục mở rộng, Thay ảnh chân dung & Nhật ký)
   ========================================================================== */

(function () {
  "use strict";

  // --- STATE QUẢN LÝ TOÀN CỤC ---
  const state = {
    currentView: "home", // 'home' | 'flower-detail' | 'about'
    selectedFlowerId: "FL-001",
    activeHeroIndex: 0,
    searchQuery: "",
    activeCollectionId: "all",
    activeTaxLevel: "all",
    showAll26Flowers: true,
    activeSuppGroup: "all",
    azSearchLetter: "ALL",
    azSearchQuery: "",
    lightbox: {
      isOpen: false,
      flowerId: null,
      imageIndex: 0
    },
    customAuthorPortrait: null,
    gardenDiary: []
  };

  // --- TIỆN ÍCH CHUẨN HÓA TIẾNG VIỆT (KHÔNG DẤU & CÓ DẤU) ---
  function normalizeVi(str) {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- TRUY XUẤT DỮ LIỆU ---
  function getData() {
    return window.ANNHIEN_DATA || { flowers: [], collections: [], supplementaryPlants: [], siteMeta: {} };
  }

  function getFlowerByIdOrSlug(idOrSlug) {
    const { flowers } = getData();
    if (!idOrSlug) return flowers[0] || null;
    const target = String(idOrSlug).toLowerCase();
    return (
      flowers.find(
        (f) =>
          f.id.toLowerCase() === target ||
          f.slug.toLowerCase() === target ||
          f.code.toLowerCase() === target
      ) || null
    );
  }

  function getCollectionById(colId) {
    const { collections } = getData();
    return collections.find((c) => c.id === colId) || null;
  }

  // --- QUẢN LÝ CHÂN DUNG TÁC GIẢ TRỊNH THỊ AN (MỤC 8) ---
  // Tạo SVG khung chân dung mặc định thanh lịch khi chưa tải được ảnh thật
  function getAuthorPlaceholderDataUri() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2A543E"/>
          <stop offset="50%" stop-color="#6C4AB6"/>
          <stop offset="100%" stop-color="#D95375"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="100" fill="url(#bg)"/>
      <circle cx="100" cy="78" r="34" fill="rgba(255,255,255,0.22)" stroke="#FFF" stroke-width="2"/>
      <path d="M42 172 C42 132 158 132 158 172" fill="rgba(255,255,255,0.22)" stroke="#FFF" stroke-width="2"/>
      <text x="100" y="86" text-anchor="middle" fill="#FFFFFF" font-family="Georgia, serif" font-size="24" font-weight="bold">TTA</text>
      <text x="100" y="155" text-anchor="middle" fill="#FEF8EC" font-family="Arial, sans-serif" font-size="11" font-weight="bold">TRỊNH THỊ AN</text>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function loadSavedAuthorPortrait() {
    try {
      const saved = localStorage.getItem("annhien_author_portrait_v2");
      if (saved) state.customAuthorPortrait = saved;
    } catch (e) {
      // Ignore storage error in restricted iframe
    }
  }

  function getAuthorPortraitSrc() {
    if (state.customAuthorPortrait) return state.customAuthorPortrait;
    const { siteMeta } = getData();
    return siteMeta.authorPortraitRepoFallback || getAuthorPlaceholderDataUri();
  }

  function updateAllAuthorPortraits() {
    const src = getAuthorPortraitSrc();
    const fallback = getAuthorPlaceholderDataUri();
    document.querySelectorAll(".js-author-portrait").forEach((img) => {
      img.src = src;
      img.onerror = function () {
        this.onerror = null;
        this.src = fallback;
      };
    });
  }

  function handleAuthorPortraitUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      const dataUrl = ev.target.result;
      state.customAuthorPortrait = dataUrl;
      try {
        localStorage.setItem("annhien_author_portrait_v2", dataUrl);
      } catch (e) {
        // Ignore quota or sandbox error
      }
      updateAllAuthorPortraits();
      showToast("Đã cập nhật ảnh chân dung Trịnh Thị An trên toàn bộ 4 vị trí của website!");
    };
    reader.readAsDataURL(file);
  }

  function resetAuthorPortrait() {
    state.customAuthorPortrait = null;
    try {
      localStorage.removeItem("annhien_author_portrait_v2");
    } catch (e) {}
    updateAllAuthorPortraits();
    showToast("Đã khôi phục ảnh chân dung mặc định từ kho lưu trữ.");
  }

  // --- SVG FALLBACK CHO HOA KHI MẤT KẾT NỐI INTERNET ---
  function getFlowerFallbackSvg(flowerName, sciName) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1B3B2B"/>
          <stop offset="50%" stop-color="#3B2D54"/>
          <stop offset="100%" stop-color="#5E2B42"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <circle cx="400" cy="250" r="110" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
      <text x="400" y="245" text-anchor="middle" fill="#FFFFFF" font-family="Georgia, serif" font-size="32" font-weight="bold">${escapeHtml(flowerName)}</text>
      <text x="400" y="285" text-anchor="middle" fill="#E2D9F3" font-family="Georgia, serif" font-style="italic" font-size="20">${escapeHtml(sciName)}</text>
      <text x="400" y="520" text-anchor="middle" fill="#FCD34D" font-family="Arial, sans-serif" font-size="15">Ảnh mẫu minh họa – Xem hướng dẫn thay ảnh thật tại thư mục assets/images/flowers/</text>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  window.handleFlowerImgError = function (imgEl, flowerName, sciName) {
    if (!imgEl) return;
    imgEl.onerror = null;
    imgEl.src = getFlowerFallbackSvg(flowerName || "Hoa Đà Lạt", sciName || "");
  };

  // --- THÔNG BÁO TOAST NHẸ NHÀNG (KHÔNG DÙNG ALERT/POPUP ÉP BUỘC) ---
  function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className =
      "bg-[#1B3B2B] text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-700/60 flex items-center gap-3 text-sm transition-all duration-300";
    toast.innerHTML = `<span class="text-amber-300 text-base">✿</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3600);
  }
  window.showToast = showToast;

  // --- BANNER 6 LOÀI HOA BIỂU TƯỢNG TRANG CHỦ (MỤC 2) ---
  function getBannerFlowers() {
    const { flowers } = getData();
    // Đúng 6 loài yêu cầu: Phượng tím, Mai anh đào, Mimosa, Cẩm tú cầu, Hoa lan (Lan hồ điệp), Hoa hồng
    const bannerOrder = ["FL-001", "FL-002", "FL-003", "FL-004", "FL-006", "FL-005"];
    return bannerOrder
      .map((id) => flowers.find((f) => f.id === id))
      .filter(Boolean);
  }

  function renderHeroBanner() {
    const bannerFlowers = getBannerFlowers();
    if (!bannerFlowers.length) return;
    const activeFlower = bannerFlowers[state.activeHeroIndex] || bannerFlowers[0];
    const mainHeroEl = document.getElementById("hero-active-showcase");
    const thumbsEl = document.getElementById("hero-thumbs-grid");
    if (!mainHeroEl || !thumbsEl) return;

    const primaryImg = activeFlower.images[0];
    const displayLabel = activeFlower.id === "FL-006" ? "Hoa lan (Lan hồ điệp Đà Lạt)" : activeFlower.name;

    mainHeroEl.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
        <div class="lg:col-span-7 relative rounded-2xl overflow-hidden bg-[#0F2419] aspect-[16/10] group">
          <img
            src="${escapeHtml(primaryImg.url)}"
            alt="${escapeHtml(activeFlower.name)}"
            onerror="window.handleFlowerImgError(this, '${escapeHtml(activeFlower.name)}', '${escapeHtml(activeFlower.scientificName)}')"
            class="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 cursor-pointer"
            onclick="window.openLightbox('${escapeHtml(activeFlower.id)}', 0)"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none"></div>
          <div class="absolute top-3 left-3 flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-slate-950 shadow">
              ★ 6 Tuyệt Sắc Hoa Đà Lạt
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/85 text-emerald-100 border border-emerald-400/30">
              📷 Ảnh chụp thực tế – Đúng loài
            </span>
          </div>
          <button
            type="button"
            onclick="window.openLightbox('${escapeHtml(activeFlower.id)}', 0)"
            class="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 hover:bg-black/80 text-white border border-white/25 transition"
            title="Phóng to ảnh hoa"
          >
            🔍 Xem ảnh lớn
          </button>
          <div class="absolute bottom-3 left-4 right-4 text-white">
            <p class="text-xs text-amber-200/95 font-medium mb-0.5">${escapeHtml(activeFlower.dalatSeason)}</p>
            <p class="text-xs text-white/80 line-clamp-1">${escapeHtml(primaryImg.caption)}</p>
          </div>
        </div>

        <div class="lg:col-span-5 text-white space-y-4 px-1 sm:px-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-medium">
            <span>Mã hồ sơ: ${escapeHtml(activeFlower.code)}</span>
            <span>•</span>
            <span>${escapeHtml(activeFlower.family)}</span>
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-title text-white tracking-tight">
              ${escapeHtml(displayLabel)}
            </h2>
            <p class="text-sm sm:text-base italic text-emerald-200 mt-1">
              ${escapeHtml(activeFlower.scientificName)}
            </p>
          </div>
          <p class="text-sm sm:text-base text-emerald-50/95 leading-relaxed">
            ${escapeHtml(activeFlower.shortIntro)}
          </p>
          <div class="bg-black/25 rounded-xl p-3 border border-white/10 text-xs sm:text-sm text-emerald-100 space-y-1">
            <div><strong class="text-amber-300">Không gian Đà Lạt:</strong> ${escapeHtml(activeFlower.dalatRelation)}</div>
          </div>
          <div class="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onclick="window.openFlowerProfile('${escapeHtml(activeFlower.id)}')"
              class="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm shadow-lg transition flex items-center gap-2"
            >
              <span>📖 Mở hồ sơ chuyên sâu</span>
              <span>→</span>
            </button>
            <button
              type="button"
              onclick="window.openFlowerProfile('${escapeHtml(activeFlower.id)}', 'care')"
              class="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-sm border border-white/25 transition"
            >
              🌱 Kỹ thuật chăm sóc
            </button>
          </div>
        </div>
      </div>
    `;

    thumbsEl.innerHTML = bannerFlowers
      .map((fl, idx) => {
        const isActive = idx === state.activeHeroIndex;
        const shortName = fl.id === "FL-006" ? "Hoa lan" : fl.name;
        return `
          <button
            type="button"
            onclick="window.selectHeroSlide(${idx})"
            class="hero-showcase-card text-left group p-2 flex flex-col ${isActive ? "active ring-2 ring-amber-300" : "opacity-85 hover:opacity-100"}"
          >
            <div class="w-full aspect-[4/3] rounded-xl overflow-hidden bg-emerald-950 mb-2">
              <img
                src="${escapeHtml(fl.images[0].url)}"
                alt="${escapeHtml(fl.name)}"
                onerror="window.handleFlowerImgError(this, '${escapeHtml(fl.name)}', '${escapeHtml(fl.scientificName)}')"
                class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />
            </div>
            <div class="px-1">
              <div class="text-xs sm:text-sm font-bold text-white truncate">${escapeHtml(shortName)}</div>
              <div class="text-[11px] italic text-emerald-200/90 truncate">${escapeHtml(fl.scientificName)}</div>
            </div>
          </button>
        `;
      })
      .join("");
  }

  window.selectHeroSlide = function (index) {
    state.activeHeroIndex = index;
    renderHeroBanner();
  };

  // --- LỌC & TÌM KIẾM DANH SÁCH HOA ĐÀ LẠT (MỤC 2, 3, 5, 6, 12) ---
  function getFilteredFlowers() {
    const { flowers } = getData();
    const qNorm = normalizeVi(state.searchQuery);

    return flowers.filter((fl) => {
      // Bộ lọc bộ sưu tập (Mục 5)
      if (state.activeCollectionId !== "all") {
        if (!fl.collections || !fl.collections.includes(state.activeCollectionId)) {
          return false;
        }
      }

      // Bộ lọc cấp phân loại
      if (state.activeTaxLevel === "core20" && !fl.isCore20) {
        return false;
      }
      if (state.activeTaxLevel === "orchid" && !(fl.collections || []).includes("hoa-lan")) {
        return false;
      }

      // Tìm kiếm có dấu & không dấu (Hỗ trợ cả "Phượng tím", "Cẩm tú cầu", "Hoa lan", tên khoa học, họ...)
      if (qNorm) {
        const searchableText = normalizeVi(
          [
            fl.name,
            fl.otherNames,
            fl.scientificName,
            fl.family,
            fl.genus,
            fl.shortIntro,
            fl.dalatRelation,
            fl.colorsAndVariants,
            (fl.collections || []).join(" ")
          ].join(" ")
        );
        // Xử lý đặc biệt khi người dùng tìm "hoa lan" hoặc "lan" -> trả về toàn bộ nhóm Hoa lan (Mục 12)
        if (qNorm === "hoa lan" || qNorm === "lan" || qNorm === "phong lan") {
          return (fl.collections || []).includes("hoa-lan");
        }
        return searchableText.includes(qNorm);
      }

      return true;
    });
  }

  // --- RENDER 11 BỘ SƯU TẬP PHÂN LOẠI HOA (MỤC 5) ---
  function renderCollectionsSection() {
    const { collections, flowers } = getData();
    const pillsContainer = document.getElementById("collection-pills-bar");
    const cardsContainer = document.getElementById("collections-cards-grid");

    if (pillsContainer) {
      const allBtn = `
        <button
          type="button"
          onclick="window.filterByCollection('all')"
          class="collection-pill px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border ${
            state.activeCollectionId === "all"
              ? "active"
              : "bg-white text-slate-700 border-stone-300 hover:border-emerald-700"
          }"
        >
          🌸 Tất cả Hoa Đà Lạt (${flowers.length})
        </button>
      `;
      const colButtons = collections
        .map((c) => {
          const isActive = state.activeCollectionId === c.id;
          return `
            <button
              type="button"
              onclick="window.filterByCollection('${escapeHtml(c.id)}')"
              class="collection-pill px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border ${
                isActive
                  ? "active"
                  : "bg-white text-slate-700 border-stone-300 hover:border-emerald-700"
              }"
            >
              ${escapeHtml(c.name)} (${c.flowerIds.length})
            </button>
          `;
        })
        .join("");
      pillsContainer.innerHTML = allBtn + colButtons;
    }

    if (cardsContainer) {
      cardsContainer.innerHTML = collections
        .map((c) => {
          const matchedFlowers = c.flowerIds
            .map((fid) => flowers.find((f) => f.id === fid))
            .filter(Boolean);
          const isSelected = state.activeCollectionId === c.id;

          return `
            <div class="bg-white rounded-2xl border ${
              isSelected ? "border-emerald-700 ring-2 ring-emerald-700/20" : "border-stone-200/90"
            } shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
              <div class="flower-card-img-wrap relative cursor-pointer" onclick="window.selectCollectionAndScroll('${escapeHtml(c.id)}')">
                <img
                  src="${escapeHtml(c.coverImage)}"
                  alt="${escapeHtml(c.name)}"
                  onerror="window.handleFlowerImgError(this, '${escapeHtml(c.name)}', 'Bộ sưu tập Hoa Đà Lạt')"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-950 shadow">
                  ${matchedFlowers.length} loài hoa
                </span>
                <div class="absolute bottom-3 left-3 right-3 text-white">
                  <h3 class="text-lg font-bold font-serif-title">${escapeHtml(c.name)}</h3>
                  <p class="text-xs text-amber-200">${escapeHtml(c.subtitle)}</p>
                </div>
              </div>
              <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  ${escapeHtml(c.description)}
                </p>
                <div>
                  <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Các loài tiêu biểu (nhấn để mở hồ sơ):
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    ${matchedFlowers
                      .map(
                        (fl) => `
                        <button
                          type="button"
                          onclick="window.openFlowerProfile('${escapeHtml(fl.id)}')"
                          class="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 hover:bg-emerald-900 hover:text-white text-slate-700 transition"
                        >
                          ${escapeHtml(fl.name)}
                        </button>
                      `
                      )
                      .join("")}
                  </div>
                </div>
                <div class="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span class="text-[11px] text-slate-500 italic">Mùa hoa tham khảo theo khí hậu</span>
                  <button
                    type="button"
                    onclick="window.selectCollectionAndScroll('${escapeHtml(c.id)}')"
                    class="text-xs font-semibold text-emerald-800 hover:text-emerald-600"
                  >
                    Lọc bộ sưu tập này →
                  </button>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  // --- RENDER THƯ VIỆN THẺ HOA TRÊN TRANG CHỦ (MỤC 2 & MỤC 3) ---
  function renderFlowersGrid() {
    const gridEl = document.getElementById("flowers-main-grid");
    const countBannerEl = document.getElementById("flowers-filter-summary");
    if (!gridEl) return;

    const filtered = getFilteredFlowers();
    const activeCol = state.activeCollectionId !== "all" ? getCollectionById(state.activeCollectionId) : null;

    if (countBannerEl) {
      let statusHtml = `Đang hiển thị <strong class="text-emerald-900">${filtered.length}</strong> hồ sơ hoa Đà Lạt chuyên sâu`;
      if (activeCol) {
        statusHtml += ` trong bộ sưu tập <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold">${escapeHtml(activeCol.name)}</span>`;
      }
      if (state.searchQuery.trim()) {
        statusHtml += ` với từ khóa <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">"${escapeHtml(state.searchQuery)}"</span>`;
      }
      countBannerEl.innerHTML = statusHtml;
    }

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="col-span-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-stone-200 shadow-sm">
          <div class="text-4xl mb-3">🌺</div>
          <h3 class="text-xl font-bold font-serif-title text-slate-800 mb-2">
            Không tìm thấy loài hoa khớp với bộ lọc hiện tại
          </h3>
          <p class="text-sm text-slate-600 max-w-lg mx-auto mb-5">
            Bạn có thể thử tìm bằng tên tiếng Việt có dấu hoặc không dấu (ví dụ: <em>Phượng tím</em>, <em>Cẩm tú cầu</em>, <em>Hoa lan</em>, <em>Mimosa</em>) hoặc đặt lại bộ lọc để xem trọn bộ 26 loài hoa Đà Lạt.
          </p>
          <button
            type="button"
            onclick="window.resetFlowerFilters()"
            class="px-5 py-2.5 rounded-xl bg-[#1B3B2B] text-white text-sm font-semibold hover:bg-emerald-800 transition"
          >
            Xem lại toàn bộ Hoa Đà Lạt
          </button>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered
      .map((fl, idx) => {
        const img = fl.images && fl.images[0] ? fl.images[0] : { url: "", caption: fl.name };
        const badgeText = fl.isCore20 ? `Top 20 Hoa Đà Lạt #${idx + 1}` : "Hoa Đà Lạt Mở Rộng";
        return `
          <article class="flower-card bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
            <!-- 1. Ảnh hoa nổi bật (Nhấn vào mở ảnh lớn Lightbox theo Mục 6) -->
            <div class="flower-card-img-wrap cursor-pointer group" onclick="window.openLightbox('${escapeHtml(fl.id)}', 0)">
              <img
                src="${escapeHtml(img.url)}"
                alt="${escapeHtml(fl.name)}"
                onerror="window.handleFlowerImgError(this, '${escapeHtml(fl.name)}', '${escapeHtml(fl.scientificName)}')"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition"></div>
              <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  fl.isCore20 ? "bg-emerald-900/90 text-amber-200" : "bg-purple-900/90 text-purple-100"
                } backdrop-blur-sm">
                  ${escapeHtml(badgeText)}
                </span>
              </div>
              <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/55 text-white opacity-90 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                🔍 Phóng to ảnh
              </span>
              <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span class="font-medium truncate">📅 ${escapeHtml(fl.dalatSeason.split("(")[0].trim())}</span>
                <span class="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm text-[10px]">${fl.images.length} ảnh</span>
              </div>
            </div>

            <!-- Nội dung thẻ hoa: 2. Tên tiếng Việt, 3. Tên khoa học, 4. Một câu giới thiệu, 5. Nút Tìm hiểu loài hoa -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <h3
                    onclick="window.openFlowerProfile('${escapeHtml(fl.id)}')"
                    class="text-xl font-bold font-serif-title text-slate-900 hover:text-emerald-800 cursor-pointer transition"
                  >
                    ${escapeHtml(fl.name)}
                  </h3>
                  <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                    ${escapeHtml(fl.code)}
                  </span>
                </div>

                <!-- Tên khoa học & cấp độ xác minh -->
                <div class="space-y-1">
                  <p class="text-xs sm:text-sm italic font-medium text-emerald-800">
                    ${escapeHtml(fl.scientificName)}
                  </p>
                  <div class="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                    <span>✓</span>
                    <span>${escapeHtml(fl.verificationStatus)}</span>
                  </div>
                </div>

                <!-- Một câu giới thiệu giàu cảm xúc & kiến thức -->
                <p class="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed pt-1">
                  ${escapeHtml(fl.shortIntro)}
                </p>
              </div>

              <div class="pt-3 border-t border-stone-100 flex items-center gap-2">
                <button
                  type="button"
                  onclick="window.openFlowerProfile('${escapeHtml(fl.id)}')"
                  class="flex-1 py-2.5 px-4 rounded-xl bg-[#1B3B2B] hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Tìm hiểu loài hoa</span>
                  <span>→</span>
                </button>
                <button
                  type="button"
                  onclick="window.openFlowerProfile('${escapeHtml(fl.id)}', 'care')"
                  class="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-medium text-xs transition"
                  title="Xem nhanh hướng dẫn chăm sóc"
                >
                  🌱 Chăm sóc
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  // --- XỬ LÝ TÌM KIẾM & ĐIỀU HƯỚNG THÔNG MINH (MỤC 2, 6, 12) ---
  window.handleFlowerSearchInput = function (val) {
    state.searchQuery = val || "";
    if (state.currentView !== "home") {
      switchView("home", false);
    }
    renderFlowersGrid();
  };

  window.executeQuickSearch = function (queryText) {
    const q = (queryText !== undefined ? queryText : state.searchQuery).trim();
    const searchInput = document.getElementById("main-flower-search-input");
    if (searchInput) searchInput.value = q;
    state.searchQuery = q;
    state.activeCollectionId = "all";
    state.activeTaxLevel = "all";

    const qNorm = normalizeVi(q);
    const { flowers } = getData();

    // Kiểm tra nếu khớp chính xác tên 1 loài hoa cụ thể (ví dụ "Phượng tím", "Cẩm tú cầu") -> Mở được ngay hoặc cuộn xuống kết quả
    // Đặc biệt: nếu người dùng tìm "Hoa lan" -> hiển thị danh sách nhóm/loài lan (5 loài lan), không phải trang trống
    if (qNorm === "hoa lan" || qNorm === "lan" || qNorm === "phong lan") {
      switchView("home", false);
      state.activeCollectionId = "hoa-lan";
      renderCollectionsSection();
      renderFlowersGrid();
      const sec = document.getElementById("kham-pha-mua-hoa");
      if (sec) sec.scrollIntoView({ behavior: "smooth" });
      showToast("Đang hiển thị danh sách 5 nhóm & loài Hoa lan tiêu biểu tại Đà Lạt!");
      return;
    }

    const exactMatch = flowers.find(
      (f) => normalizeVi(f.name) === qNorm || normalizeVi(f.slug.replace(/-/g, " ")) === qNorm
    );

    if (exactMatch) {
      openFlowerProfile(exactMatch.id);
      return;
    }

    switchView("home", false);
    renderCollectionsSection();
    renderFlowersGrid();
    const sec = document.getElementById("kham-pha-mua-hoa");
    if (sec) sec.scrollIntoView({ behavior: "smooth" });
  };

  window.filterByCollection = function (colId) {
    state.activeCollectionId = colId;
    renderCollectionsSection();
    renderFlowersGrid();
  };

  window.selectCollectionAndScroll = function (colId) {
    state.activeCollectionId = colId;
    state.searchQuery = "";
    const searchInput = document.getElementById("main-flower-search-input");
    if (searchInput) searchInput.value = "";
    renderCollectionsSection();
    renderFlowersGrid();
    const sec = document.getElementById("kham-pha-mua-hoa");
    if (sec) sec.scrollIntoView({ behavior: "smooth" });
  };

  window.filterByTaxLevel = function (level) {
    state.activeTaxLevel = level;
    document.querySelectorAll(".js-tax-filter-btn").forEach((btn) => {
      if (btn.dataset.level === level) {
        btn.className = "js-tax-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1B3B2B] text-white";
      } else {
        btn.className = "js-tax-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-slate-700 hover:bg-stone-200";
      }
    });
    renderFlowersGrid();
  };

  window.resetFlowerFilters = function () {
    state.searchQuery = "";
    state.activeCollectionId = "all";
    state.activeTaxLevel = "all";
    const searchInput = document.getElementById("main-flower-search-input");
    if (searchInput) searchInput.value = "";
    window.filterByTaxLevel("all");
    renderCollectionsSection();
    renderFlowersGrid();
  };

  // --- MỞ TRANG RIÊNG HỒ SƠ CHUYÊN SÂU CỦA TỪNG LOÀI HOA (MỤC 4 & MỤC 6) ---
  function openFlowerProfile(flowerIdOrSlug, scrollTarget) {
    const flower = getFlowerByIdOrSlug(flowerIdOrSlug);
    if (!flower) return;

    state.selectedFlowerId = flower.id;
    state.currentView = "flower-detail";

    // Cập nhật URL hash để mỗi loài hoa có đường dẫn riêng có thể chia sẻ (#/hoa/cam-tu-cau)
    const targetHash = `#/hoa/${flower.slug}`;
    if (window.location.hash !== targetHash) {
      try {
        history.pushState(null, "", targetHash);
      } catch (e) {
        window.location.hash = targetHash;
      }
    }

    document.getElementById("view-home").classList.add("hidden");
    document.getElementById("view-about").classList.add("hidden");
    const detailView = document.getElementById("view-flower-detail");
    detailView.classList.remove("hidden");

    renderFlowerDetailPage(flower);

    if (scrollTarget === "care") {
      setTimeout(() => {
        const careEl = document.getElementById("profile-care-section");
        if (careEl) careEl.scrollIntoView({ behavior: "smooth" });
      }, 80);
    } else if (scrollTarget === "science") {
      setTimeout(() => {
        const sciEl = document.getElementById("profile-science-section");
        if (sciEl) sciEl.scrollIntoView({ behavior: "smooth" });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  window.openFlowerProfile = openFlowerProfile;

  function renderFlowerDetailPage(fl) {
    const { flowers, collections } = getData();
    const container = document.getElementById("flower-detail-content");
    if (!container) return;

    const currentIndex = flowers.findIndex((item) => item.id === fl.id);
    const prevFlower = flowers[(currentIndex - 1 + flowers.length) % flowers.length];
    const nextFlower = flowers[(currentIndex + 1) % flowers.length];

    const similarList = (fl.similarFlowers || [])
      .map((sid) => flowers.find((item) => item.id === sid))
      .filter(Boolean);

    const flowerCols = (fl.collections || [])
      .map((cid) => collections.find((c) => c.id === cid))
      .filter(Boolean);

    const primaryImg = fl.images && fl.images[0] ? fl.images[0] : { url: "", caption: fl.name };

    container.innerHTML = `
      <!-- Thanh điều hướng trên cùng của Trang Hồ Sơ Hoa -->
      <div class="bg-[#1B3B2B] text-white py-4 px-4 sm:px-6 border-b border-emerald-800">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onclick="window.switchView('home')"
              class="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold flex items-center gap-1.5 transition"
            >
              <span>←</span>
              <span>Trở về Thư viện Hoa Đà Lạt</span>
            </button>
            <span class="text-emerald-300/60 hidden sm:inline">/</span>
            <span class="text-amber-200 font-medium hidden sm:inline">Hồ sơ chuyên sâu: ${escapeHtml(fl.name)} (${escapeHtml(fl.code)})</span>
          </div>

          <!-- Nút chuyển giữa các loài hoa (Mục 6) -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick="window.openFlowerProfile('${escapeHtml(prevFlower.id)}')"
              class="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100 text-xs border border-emerald-700/70 transition"
              title="Loài hoa trước: ${escapeHtml(prevFlower.name)}"
            >
              ‹ ${escapeHtml(prevFlower.name)}
            </button>
            <button
              type="button"
              onclick="window.openFlowerProfile('${escapeHtml(nextFlower.id)}')"
              class="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100 text-xs border border-emerald-700/70 transition"
              title="Loài hoa tiếp theo: ${escapeHtml(nextFlower.name)}"
            >
              ${escapeHtml(nextFlower.name)} ›
            </button>
          </div>
        </div>
      </div>

      <!-- Phần mở đầu Hồ Sơ & Thư Viện Ảnh Đẹp (Mục 4.1) -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white rounded-3xl p-5 sm:p-8 border border-stone-200 shadow-sm">
          <!-- Cột trái: Thư viện ảnh của loài hoa -->
          <div class="lg:col-span-6 space-y-4">
            <div class="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[4/3] border border-stone-200 group cursor-pointer" onclick="window.openLightbox('${escapeHtml(fl.id)}', 0)">
              <img
                id="detail-main-photo"
                src="${escapeHtml(primaryImg.url)}"
                alt="${escapeHtml(fl.name)}"
                onerror="window.handleFlowerImgError(this, '${escapeHtml(fl.name)}', '${escapeHtml(fl.scientificName)}')"
                class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />
              <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/85 text-emerald-100 border border-emerald-500/30">
                  📷 Ảnh tư liệu thực vật thật
                </span>
              </div>
              <button
                type="button"
                class="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-sm transition"
              >
                🔍 Nhấn để phóng to & xem chú thích (${fl.images.length} ảnh)
              </button>
            </div>

            <p id="detail-main-caption" class="text-xs text-slate-600 italic bg-stone-50 px-3.5 py-2.5 rounded-xl border border-stone-200/80">
              ${escapeHtml(primaryImg.caption)}
            </p>

            <!-- Danh sách các ảnh cùng loài & Hướng dẫn thay ảnh thật -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>THƯ VIỆN ẢNH CÙNG LOÀI (${fl.images.length} ảnh):</span>
                <span class="text-emerald-800">Đường dẫn thay ảnh: <code>${escapeHtml(primaryImg.localReplacePath || "assets/images/flowers/")}</code></span>
              </div>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                ${fl.images
                  .map(
                    (imgObj, idx) => `
                    <button
                      type="button"
                      onclick="window.openLightbox('${escapeHtml(fl.id)}', ${idx})"
                      class="rounded-xl overflow-hidden border-2 ${
                        idx === 0 ? "border-emerald-700" : "border-stone-200 hover:border-emerald-600"
                      } aspect-[4/3] bg-stone-100 relative group"
                    >
                      <img
                        src="${escapeHtml(imgObj.url)}"
                        alt="${escapeHtml(fl.name)} - ảnh ${idx + 1}"
                        onerror="window.handleFlowerImgError(this, '${escapeHtml(fl.name)}', '')"
                        class="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </button>
                  `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <!-- Cột phải: Định danh khoa học & Tóm tắt nhanh -->
          <div class="lg:col-span-6 space-y-5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                Mã hồ sơ: ${escapeHtml(fl.code)}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                ✓ ${escapeHtml(fl.verificationStatus)}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-900">
                ${escapeHtml(fl.taxonomyLevel)}
              </span>
            </div>

            <div>
              <h1 class="text-3xl sm:text-4xl font-bold font-serif-title text-slate-900">
                ${escapeHtml(fl.name)}
              </h1>
              <p class="text-lg sm:text-xl italic font-semibold text-emerald-800 mt-1">
                ${escapeHtml(fl.scientificName)}
              </p>
            </div>

            <p class="text-sm sm:text-base text-slate-700 leading-relaxed bg-[#FCFBF7] p-4 rounded-2xl border border-stone-200/90">
              ${escapeHtml(fl.shortIntro)}
            </p>

            <!-- Bảng định danh cốt lõi -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div class="text-slate-400 font-semibold uppercase text-[11px]">Tên thường gọi khác</div>
                <div class="font-semibold text-slate-800 mt-0.5">${escapeHtml(fl.otherNames)}</div>
              </div>
              <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div class="text-slate-400 font-semibold uppercase text-[11px]">Họ & Chi thực vật</div>
                <div class="font-semibold text-slate-800 mt-0.5">${escapeHtml(fl.family)} — ${escapeHtml(fl.genus)}</div>
              </div>
              <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 sm:col-span-2">
                <div class="text-slate-400 font-semibold uppercase text-[11px]">Mùa hoa tại Đà Lạt (Tham khảo theo khí hậu & giống trồng)</div>
                <div class="font-semibold text-emerald-900 mt-0.5">🌸 ${escapeHtml(fl.dalatSeason)}</div>
              </div>
            </div>

            <!-- Thuộc các bộ sưu tập -->
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Thuộc bộ sưu tập khám phá:
              </div>
              <div class="flex flex-wrap gap-2">
                ${flowerCols
                  .map(
                    (c) => `
                    <button
                      type="button"
                      onclick="window.switchView('home'); window.selectCollectionAndScroll('${escapeHtml(c.id)}')"
                      class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-800 text-emerald-900 hover:text-white border border-emerald-200 transition"
                    >
                      #${escapeHtml(c.name)}
                    </button>
                  `
                  )
                  .join("")}
              </div>
            </div>

            <!-- Nút điều hướng nội trang (Mục 6: Tìm hiểu khoa học & Hướng dẫn chăm sóc) -->
            <div class="flex flex-wrap gap-3 pt-2">
              <a
                href="#profile-science-section"
                class="px-4 py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition"
              >
                🔬 Tìm hiểu khoa học (Hình thái & Sinh thái)
              </a>
              <a
                href="#profile-care-section"
                class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-semibold transition"
              >
                🌱 Hướng dẫn chăm sóc ra hoa
              </a>
              <button
                type="button"
                onclick="window.print()"
                class="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs sm:text-sm font-medium transition no-print"
              >
                🖨️ In hồ sơ
              </button>
            </div>
          </div>
        </div>

        <!-- PHẦN I: HỒ SƠ KHOA HỌC, NGUỒN GỐC & ĐẶC ĐIỂM HÌNH THÁI (MỤC 4) -->
        <section id="profile-science-section" class="space-y-5 scroll-mt-24">
          <div class="border-l-4 border-[#1B3B2B] pl-4">
            <span class="text-xs font-bold uppercase tracking-widest text-emerald-800">Phần I • Hồ sơ Thực vật học</span>
            <h2 class="text-2xl sm:text-3xl font-bold font-serif-title text-slate-900">
              Đặc điểm Khoa học, Hình thái & Mối liên hệ với Đà Lạt
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="profile-spec-card">
              <h3 class="text-base font-bold text-emerald-950 mb-2 flex items-center gap-2">
                <span>🌍</span><span>1. Nguồn gốc & Lịch sử du nhập</span>
              </h3>
              <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(fl.origin)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-base font-bold text-emerald-950 mb-2 flex items-center gap-2">
                <span>🏞️</span><span>2. Không gian phân bố & Liên hệ với Đà Lạt</span>
              </h3>
              <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(fl.dalatRelation)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-base font-bold text-emerald-950 mb-2 flex items-center gap-2">
                <span>🌿</span><span>3. Đặc điểm Thân, Lá, Nụ và Hoa</span>
              </h3>
              <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(fl.morphology)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-base font-bold text-emerald-950 mb-2 flex items-center gap-2">
                <span>🎨</span><span>4. Màu sắc và các biến thể giống trồng</span>
              </h3>
              <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(fl.colorsAndVariants)}</p>
            </div>
          </div>
        </section>

        <!-- PHẦN II: ĐIỀU KIỆN SINH THÁI & KỸ THUẬT CHĂM SÓC RA HOA (MỤC 4) -->
        <section id="profile-care-section" class="space-y-5 scroll-mt-24">
          <div class="border-l-4 border-amber-500 pl-4">
            <span class="text-xs font-bold uppercase tracking-widest text-amber-700">Phần II • Cẩm nang Canh tác & Chăm sóc</span>
            <h2 class="text-2xl sm:text-3xl font-bold font-serif-title text-slate-900">
              Điều kiện Khí hậu & Hướng dẫn Chăm sóc để Cây Ra Hoa Đẹp
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1.5">☁️ Điều kiện khí hậu</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.climate)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1.5">☀️ Ánh sáng</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.light)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1.5">🌡️ Nhiệt độ</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.temperature)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1.5">🪴 Đất và giá thể</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.soil)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1.5">💧 Cách tưới nước</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.watering)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1.5">🧪 Cách bón phân</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.fertilizing)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1.5">🌱 Cách nhân giống</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.propagation)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1.5">🌸 Chăm sóc để cây ra hoa</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.floweringCare)}</p>
            </div>

            <div class="profile-spec-card">
              <h3 class="text-sm font-bold uppercase tracking-wide text-rose-800 mb-1.5">🛡️ Sâu bệnh thường gặp</h3>
              <p class="text-sm text-slate-700">${escapeHtml(fl.pestsAndDiseases)}</p>
            </div>
          </div>
        </section>

        <!-- PHẦN III: VĂN HÓA, THÚ VỊ & NGUỒN THAM KHẢO KHOA HỌC -->
        <section class="space-y-5">
          <div class="border-l-4 border-purple-700 pl-4">
            <span class="text-xs font-bold uppercase tracking-widest text-purple-800">Phần III • Giá trị Văn hóa & Tư liệu Khoa học</span>
            <h2 class="text-2xl sm:text-3xl font-bold font-serif-title text-slate-900">
              Đặc điểm Thú vị, Cảnh quan & Nguồn Tham khảo
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="profile-spec-card bg-amber-50/50 border-amber-200/80">
              <h3 class="text-base font-bold text-amber-950 mb-2">✨ Những đặc điểm thú vị</h3>
              <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(fl.interestingFacts)}</p>
            </div>

            <div class="profile-spec-card bg-purple-50/40 border-purple-200/80">
              <h3 class="text-base font-bold text-purple-950 mb-2">🏛️ Vai trò trong cảnh quan và văn hóa Đà Lạt</h3>
              <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(fl.landscapeAndCulture)}</p>
            </div>
          </div>

          <div class="profile-spec-card">
            <h3 class="text-base font-bold text-slate-900 mb-3">📚 Nguồn tham khảo khoa học & Cơ sở dữ liệu thực vật</h3>
            <ul class="space-y-2 text-xs sm:text-sm">
              ${(fl.references || [])
                .map(
                  (ref) => `
                  <li class="flex items-center gap-2">
                    <span class="text-emerald-700">🔗</span>
                    <a
                      href="${escapeHtml(ref.url)}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-emerald-800 hover:text-emerald-600 underline font-medium"
                    >
                      ${escapeHtml(ref.title)}
                    </a>
                  </li>
                `
                )
                .join("")}
            </ul>
          </div>
        </section>

        <!-- PHẦN IV: KHÁM PHÁ CÁC LOÀI HOA TƯƠNG TỰ (MỤC 6: KHÔNG CÓ ĐƯỜNG DẪN CỤT) -->
        <section class="pt-4 border-t border-stone-200 space-y-5 no-print">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-emerald-800">Khám phá liên tục</span>
              <h2 class="text-2xl font-bold font-serif-title text-slate-900">
                Các loài hoa Đà Lạt tương tự hoặc cùng mùa nở
              </h2>
            </div>
            <button
              type="button"
              onclick="window.switchView('home')"
              class="px-4 py-2 rounded-xl bg-stone-100 hover:bg-emerald-900 hover:text-white text-slate-800 text-xs sm:text-sm font-semibold transition"
            >
              ← Trở về toàn bộ Thư viện Hoa
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            ${similarList
              .map(
                (sim) => `
                <div
                  onclick="window.openFlowerProfile('${escapeHtml(sim.id)}')"
                  class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col"
                >
                  <div class="aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src="${escapeHtml(sim.images[0].url)}"
                      alt="${escapeHtml(sim.name)}"
                      onerror="window.handleFlowerImgError(this, '${escapeHtml(sim.name)}', '')"
                      class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 class="font-bold font-serif-title text-base text-slate-900 group-hover:text-emerald-800">
                        ${escapeHtml(sim.name)}
                      </h3>
                      <p class="text-xs italic text-emerald-700">${escapeHtml(sim.scientificName)}</p>
                    </div>
                    <span class="text-xs font-semibold text-emerald-800 mt-3 inline-block">
                      Mở hồ sơ loài hoa →
                    </span>
                  </div>
                </div>
              `
              )
              .join("")}
          </div>
        </section>
      </div>
    `;
  }

  // --- LIGHTBOX TRẢI NGHIỆM KHÁM PHÁ HOA (MỤC 6) ---
  // Mở ảnh lớn, xem các ảnh cùng loài, đọc chú thích, nhấn "Tìm hiểu khoa học", "Hướng dẫn chăm sóc", loài hoa tương tự, trở về thư viện
  window.openLightbox = function (flowerId, imgIdx) {
    const fl = getFlowerByIdOrSlug(flowerId);
    if (!fl) return;
    state.lightbox.isOpen = true;
    state.lightbox.flowerId = fl.id;
    state.lightbox.imageIndex = imgIdx || 0;

    const modal = document.getElementById("flower-lightbox-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    renderLightboxContent();
  };

  window.closeLightbox = function () {
    state.lightbox.isOpen = false;
    const modal = document.getElementById("flower-lightbox-modal");
    if (modal) modal.classList.add("hidden");
  };

  window.stepLightboxImage = function (delta) {
    const fl = getFlowerByIdOrSlug(state.lightbox.flowerId);
    if (!fl || !fl.images.length) return;
    state.lightbox.imageIndex =
      (state.lightbox.imageIndex + delta + fl.images.length) % fl.images.length;
    renderLightboxContent();
  };

  window.stepLightboxFlower = function (delta) {
    const { flowers } = getData();
    const idx = flowers.findIndex((f) => f.id === state.lightbox.flowerId);
    if (idx === -1) return;
    const nextFl = flowers[(idx + delta + flowers.length) % flowers.length];
    state.lightbox.flowerId = nextFl.id;
    state.lightbox.imageIndex = 0;
    renderLightboxContent();
  };

  function renderLightboxContent() {
    const fl = getFlowerByIdOrSlug(state.lightbox.flowerId);
    const bodyEl = document.getElementById("flower-lightbox-body");
    if (!fl || !bodyEl) return;

    const { flowers } = getData();
    const imgObj = fl.images[state.lightbox.imageIndex] || fl.images[0];
    const similarList = (fl.similarFlowers || [])
      .map((sid) => flowers.find((item) => item.id === sid))
      .filter(Boolean);

    bodyEl.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <!-- Khu vực hiển thị ảnh lớn -->
        <div class="lg:col-span-8 flex flex-col items-center">
          <div class="relative w-full max-h-[68vh] aspect-[4/3] bg-black/60 rounded-2xl overflow-hidden flex items-center justify-center border border-white/15">
            <img
              src="${escapeHtml(imgObj.url)}"
              alt="${escapeHtml(fl.name)}"
              onerror="window.handleFlowerImgError(this, '${escapeHtml(fl.name)}', '${escapeHtml(fl.scientificName)}')"
              class="max-w-full max-h-[66vh] w-auto h-auto object-contain"
            />
            ${
              fl.images.length > 1
                ? `
                <button
                  type="button"
                  onclick="window.stepLightboxImage(-1)"
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-amber-400 hover:text-slate-950 text-white font-bold transition"
                >‹</button>
                <button
                  type="button"
                  onclick="window.stepLightboxImage(1)"
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-amber-400 hover:text-slate-950 text-white font-bold transition"
                >›</button>
              `
                : ""
            }
          </div>

          <!-- Chú thích ảnh &縮略圖 cùng loài -->
          <div class="w-full mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
            <p class="text-xs sm:text-sm text-emerald-100 italic">
              📷 ${escapeHtml(imgObj.caption)}
            </p>
            <div class="flex items-center gap-2 shrink-0">
              ${fl.images
                .map(
                  (thumb, i) => `
                  <button
                    type="button"
                    onclick="window.openLightbox('${escapeHtml(fl.id)}', ${i})"
                    class="w-14 h-10 rounded-lg overflow-hidden border-2 ${
                      i === state.lightbox.imageIndex ? "border-amber-400" : "border-white/25 opacity-60 hover:opacity-100"
                    }"
                  >
                    <img src="${escapeHtml(thumb.url)}" alt="" class="w-full h-full object-cover" />
                  </button>
                `
                )
                .join("")}
            </div>
          </div>
        </div>

        <!-- Bảng thông tin & nút tương tác trong Lightbox (Mục 6) -->
        <div class="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 text-white border border-white/15 space-y-4">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-950">
              ${escapeHtml(fl.code)} • ${escapeHtml(fl.verificationStatus)}
            </span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                onclick="window.stepLightboxFlower(-1)"
                class="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs"
                title="Chuyển sang loài hoa trước"
              >‹ Loài trước</button>
              <button
                type="button"
                onclick="window.stepLightboxFlower(1)"
                class="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs"
                title="Chuyển sang loài hoa kế tiếp"
              >Loài sau ›</button>
            </div>
          </div>

          <div>
            <h3 class="text-2xl font-bold font-serif-title">${escapeHtml(fl.name)}</h3>
            <p class="text-sm italic text-emerald-200">${escapeHtml(fl.scientificName)}</p>
            <p class="text-xs text-white/75 mt-1">${escapeHtml(fl.family)}</p>
          </div>

          <p class="text-xs sm:text-sm text-emerald-50/90 leading-relaxed">
            ${escapeHtml(fl.shortIntro)}
          </p>

          <!-- Các nút hành động theo đúng Mục 6 -->
          <div class="grid grid-cols-1 gap-2.5 pt-1">
            <button
              type="button"
              onclick="window.closeLightbox(); window.openFlowerProfile('${escapeHtml(fl.id)}', 'science')"
              class="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2"
            >
              <span>🔬 Tìm hiểu khoa học (Hồ sơ đầy đủ)</span>
            </button>
            <button
              type="button"
              onclick="window.closeLightbox(); window.openFlowerProfile('${escapeHtml(fl.id)}', 'care')"
              class="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2"
            >
              <span>🌱 Hướng dẫn chăm sóc ra hoa</span>
            </button>
          </div>

          <!-- Các loài hoa tương tự -->
          <div class="pt-3 border-t border-white/15">
            <div class="text-xs font-semibold uppercase tracking-wider text-amber-200 mb-2">
              Xem các loài hoa tương tự:
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${similarList
                .map(
                  (sim) => `
                  <button
                    type="button"
                    onclick="window.openLightbox('${escapeHtml(sim.id)}', 0)"
                    class="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-amber-400 hover:text-slate-950 text-xs font-medium transition"
                  >
                    ${escapeHtml(sim.name)}
                  </button>
                `
                )
                .join("")}
            </div>
          </div>

          <div class="pt-2">
            <button
              type="button"
              onclick="window.closeLightbox()"
              class="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium transition"
            >
              ← Trở về thư viện hoa
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- CHUYÊN MỤC MỞ RỘNG (MỤC 7: ĐẶT SAU PHẦN HOA ĐÀ LẠT) ---
  function renderSupplementarySections() {
    const { supplementaryPlants, flowers } = getData();
    const suppGridEl = document.getElementById("supplementary-plants-grid");
    if (suppGridEl) {
      const filteredSupp =
        state.activeSuppGroup === "all"
          ? supplementaryPlants
          : supplementaryPlants.filter((item) => item.groupId === state.activeSuppGroup);

      suppGridEl.innerHTML = filteredSupp
        .map(
          (item) => `
          <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                  ${escapeHtml(item.groupName)}
                </span>
                <span class="text-[11px] font-mono text-stone-500">${escapeHtml(item.code)}</span>
              </div>
              <h3 class="text-lg font-bold font-serif-title text-slate-900">${escapeHtml(item.name)}</h3>
              <p class="text-xs italic text-emerald-800 font-medium">${escapeHtml(item.scientificName)}</p>
              <p class="text-xs text-slate-500">Họ: ${escapeHtml(item.family)}</p>
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${escapeHtml(item.shortIntro)}</p>
            </div>
            <div class="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div><strong class="text-slate-800">Tại Đà Lạt:</strong> <span class="text-slate-600">${escapeHtml(item.dalatRelation)}</span></div>
              <div><strong class="text-slate-800">Sinh thái & Chăm sóc:</strong> <span class="text-slate-600">${escapeHtml(item.careSummary)}</span></div>
              <div class="flex items-center justify-between pt-1">
                <span class="text-[11px] text-emerald-700 font-medium">✓ ${escapeHtml(item.verificationStatus)}</span>
                <a
                  href="${escapeHtml(item.referenceUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-emerald-800 hover:underline font-semibold"
                >
                  Tư liệu Kew POWO ↗
                </a>
              </div>
            </div>
          </div>
        `
        )
        .join("");
    }

    renderEncyclopediaAZ();
    renderGardenDiary();
  }

  window.filterSuppGroup = function (groupId) {
    state.activeSuppGroup = groupId;
    document.querySelectorAll(".js-supp-tab").forEach((btn) => {
      if (btn.dataset.group === groupId) {
        btn.className = "js-supp-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#1B3B2B] text-white shadow-sm";
      } else {
        btn.className = "js-supp-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white text-slate-700 border border-stone-200 hover:border-emerald-700";
      }
    });
    renderSupplementarySections();
  };

  // --- BÁCH KHOA THỰC VẬT A–Z (MỤC 7.5) ---
  function renderEncyclopediaAZ() {
    const { flowers, supplementaryPlants } = getData();
    const listEl = document.getElementById("az-encyclopedia-list");
    if (!listEl) return;

    const combined = [
      ...flowers.map((f) => ({
        id: f.id,
        code: f.code,
        name: f.name,
        scientificName: f.scientificName,
        family: f.family,
        type: "Hoa Đà Lạt",
        isFlower: true
      })),
      ...supplementaryPlants.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        scientificName: s.scientificName,
        family: s.family,
        type: s.groupName,
        isFlower: false,
        referenceUrl: s.referenceUrl
      }))
    ].sort((a, b) => a.name.localeCompare(b.name, "vi"));

    const qNorm = normalizeVi(state.azSearchQuery);
    const filtered = combined.filter((item) => {
      if (state.azSearchLetter !== "ALL") {
        const firstChar = normalizeVi(item.name).charAt(0).toUpperCase();
        if (firstChar !== state.azSearchLetter) return false;
      }
      if (qNorm) {
        return normalizeVi(`${item.name} ${item.scientificName} ${item.family} ${item.type}`).includes(qNorm);
      }
      return true;
    });

    listEl.innerHTML = filtered
      .map(
        (item) => `
        <div class="p-3.5 rounded-xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-3 hover:border-emerald-700 transition">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">${escapeHtml(item.code)}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded ${
                item.isFlower ? "bg-amber-100 text-amber-900" : "bg-emerald-50 text-emerald-800"
              }">${escapeHtml(item.type)}</span>
              <h4 class="font-bold text-sm sm:text-base text-slate-900">${escapeHtml(item.name)}</h4>
            </div>
            <p class="text-xs italic text-emerald-800 mt-0.5">${escapeHtml(item.scientificName)} — <span class="not-italic text-slate-500">${escapeHtml(item.family)}</span></p>
          </div>
          <div>
            ${
              item.isFlower
                ? `<button type="button" onclick="window.openFlowerProfile('${escapeHtml(item.id)}')" class="px-3 py-1.5 rounded-lg bg-[#1B3B2B] text-white text-xs font-semibold hover:bg-emerald-800">Mở hồ sơ hoa →</button>`
                : `<a href="${escapeHtml(item.referenceUrl)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-stone-100 text-slate-700 text-xs font-medium hover:bg-stone-200">Tra cứu Kew ↗</a>`
            }
          </div>
        </div>
      `
      )
      .join("");
  }

  window.filterAZLetter = function (letter) {
    state.azSearchLetter = letter;
    renderEncyclopediaAZ();
  };

  window.handleAZSearchInput = function (val) {
    state.azSearchQuery = val || "";
    renderEncyclopediaAZ();
  };

  // --- NHẬN DIỆN CÂY BẰNG AI & KHÓA TRA CỨU HÌNH THÁI (MỤC 7.6) ---
  // Giải thích rõ chế độ hoạt động trực tiếp trên trình duyệt vs cần API Key
  window.runMorphologyMatcher = function () {
    const colorVal = document.getElementById("ai-trait-color")?.value || "";
    const habitVal = document.getElementById("ai-trait-habit")?.value || "";
    const seasonVal = document.getElementById("ai-trait-season")?.value || "";
    const resultEl = document.getElementById("ai-matcher-results");
    if (!resultEl) return;

    const { flowers } = getData();
    const matches = flowers.filter((fl) => {
      let score = 0;
      const text = normalizeVi(`${fl.colorsAndVariants} ${fl.morphology} ${fl.shortIntro}`);
      if (colorVal && text.includes(normalizeVi(colorVal))) score += 2;
      if (habitVal && (fl.collections || []).includes(habitVal)) score += 2;
      if (seasonVal && (fl.collections || []).includes(seasonVal)) score += 2;
      return score > 0 || (!colorVal && !habitVal && !seasonVal);
    });

    const topMatches = matches.slice(0, 4);
    resultEl.innerHTML = `
      <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
        <div class="text-xs font-bold text-emerald-950 uppercase tracking-wider">
          Kết quả đối chiếu đặc điểm hình thái (${matches.length} loài phù hợp):
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${topMatches
            .map(
              (m) => `
              <div class="p-3 rounded-xl bg-white border border-emerald-200/80 flex items-center justify-between gap-2">
                <div>
                  <div class="font-bold text-sm text-slate-900">${escapeHtml(m.name)}</div>
                  <div class="text-xs italic text-emerald-700">${escapeHtml(m.scientificName)}</div>
                </div>
                <button
                  type="button"
                  onclick="window.openFlowerProfile('${escapeHtml(m.id)}')"
                  class="px-2.5 py-1 rounded-lg bg-[#1B3B2B] text-white text-xs font-semibold shrink-0"
                >
                  Xem hồ sơ
                </button>
              </div>
            `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  // --- NHẬT KÝ KHU VƯỜN (MỤC 7.7: LƯU TRỮ LOCALSTORAGE THỰC TẾ) ---
  function loadGardenDiary() {
    const defaultEntries = [
      {
        id: "diary-1",
        date: "2026-03-15",
        flowerName: "Phượng tím (Jacaranda mimosifolia)",
        note: "Sáng sớm đi dạo quanh bờ hồ Xuân Hương và đường Nguyễn Thị Minh Khai, những tán phượng tím đang bung nở rực rỡ nhất trong nắng trong veo."
      },
      {
        id: "diary-2",
        date: "2026-06-20",
        flowerName: "Cẩm tú cầu (Hydrangea macrophylla)",
        note: "Bón bổ sung phân hữu cơ hoai mục và kiểm tra độ ẩm đất cho khóm cẩm tú cầu xanh lam nơi góc vườn Trại Mát."
      }
    ];
    try {
      const saved = localStorage.getItem("annhien_garden_diary_v2");
      state.gardenDiary = saved ? JSON.parse(saved) : defaultEntries;
    } catch (e) {
      state.gardenDiary = defaultEntries;
    }
  }

  function renderGardenDiary() {
    const container = document.getElementById("garden-diary-entries");
    if (!container) return;
    container.innerHTML = state.gardenDiary
      .map(
        (entry) => `
        <div class="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1.5">
          <div class="flex items-center justify-between text-xs text-slate-500">
            <span class="font-semibold text-emerald-800">🌿 ${escapeHtml(entry.flowerName)}</span>
            <div class="flex items-center gap-2">
              <span>📅 ${escapeHtml(entry.date)}</span>
              <button
                type="button"
                onclick="window.deleteDiaryEntry('${escapeHtml(entry.id)}')"
                class="text-rose-600 hover:underline"
              >Xóa</button>
            </div>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${escapeHtml(entry.note)}</p>
        </div>
      `
      )
      .join("");
  }

  window.addDiaryEntry = function (ev) {
    if (ev) ev.preventDefault();
    const flowerEl = document.getElementById("diary-flower-select");
    const noteEl = document.getElementById("diary-note-input");
    if (!flowerEl || !noteEl || !noteEl.value.trim()) {
      showToast("Vui lòng nhập nội dung ghi chú chăm sóc hoặc cảm xúc của bạn!");
      return;
    }
    const newEntry = {
      id: "diary-" + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      flowerName: flowerEl.value,
      note: noteEl.value.trim()
    };
    state.gardenDiary.unshift(newEntry);
    try {
      localStorage.setItem("annhien_garden_diary_v2", JSON.stringify(state.gardenDiary));
    } catch (e) {}
    noteEl.value = "";
    renderGardenDiary();
    showToast("Đã lưu ghi chú mới vào Nhật ký khu vườn của bạn!");
  };

  window.deleteDiaryEntry = function (entryId) {
    state.gardenDiary = state.gardenDiary.filter((item) => item.id !== entryId);
    try {
      localStorage.setItem("annhien_garden_diary_v2", JSON.stringify(state.gardenDiary));
    } catch (e) {}
    renderGardenDiary();
  };

  // --- CHUYỂN ĐỔI GIỮA CÁC TRANG (TRANG CHỦ / HỒ SƠ HOA / VỀ AN NHIÊN) ---
  function switchView(viewName, updateHash = true) {
    state.currentView = viewName;
    const homeEl = document.getElementById("view-home");
    const detailEl = document.getElementById("view-flower-detail");
    const aboutEl = document.getElementById("view-about");

    if (homeEl) homeEl.classList.toggle("hidden", viewName !== "home");
    if (detailEl) detailEl.classList.toggle("hidden", viewName !== "flower-detail");
    if (aboutEl) aboutEl.classList.toggle("hidden", viewName !== "about");

    if (updateHash) {
      const hash = viewName === "about" ? "#/ve-an-nhien" : "#/";
      try {
        history.pushState(null, "", hash);
      } catch (e) {}
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  window.switchView = switchView;

  function handleHashRouting() {
    const hash = window.location.hash || "";
    if (hash.startsWith("#/hoa/")) {
      const slug = hash.replace("#/hoa/", "").trim();
      openFlowerProfile(slug);
    } else if (hash === "#/ve-an-nhien") {
      switchView("about", false);
    } else if (hash === "#/") {
      switchView("home", false);
    }
  }

  // --- KHỞI TẠO WEBSITE ---
  function initApp() {
    loadSavedAuthorPortrait();
    loadGardenDiary();
    renderHeroBanner();
    renderCollectionsSection();
    renderFlowersGrid();
    renderSupplementarySections();
    updateAllAuthorPortraits();

    // Điền danh sách hoa vào select của Nhật ký khu vườn
    const diarySelect = document.getElementById("diary-flower-select");
    if (diarySelect) {
      const { flowers } = getData();
      diarySelect.innerHTML = flowers
        .map((f) => `<option value="${escapeHtml(f.name)}">${escapeHtml(f.name)} (${escapeHtml(f.scientificName)})</option>`)
        .join("");
    }

    // Lắng nghe tải ảnh chân dung Trịnh Thị An
    document.querySelectorAll(".js-author-upload-input").forEach((input) => {
      input.addEventListener("change", function (ev) {
        if (ev.target.files && ev.target.files[0]) {
          handleAuthorPortraitUpload(ev.target.files[0]);
        }
      });
    });

    window.addEventListener("hashchange", handleHashRouting);
    handleHashRouting();
  }

  window.resetAuthorPortrait = resetAuthorPortrait;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
