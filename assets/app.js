const state = {
  effects: [],
  filtered: [],
  page: 1,
  pageSize: 12,
  totalPages: 1,
};

const api = {
  async loadIndex() {
    const res = await fetch('effects/index.json');
    return res.json();
  },
};

const els = {
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  search: document.getElementById('search'),
  sort: document.getElementById('sort'),
  modal: document.getElementById('modal'),
  modalFrame: document.getElementById('modal-frame'),
  modalClose: document.getElementById('modal-close'),
  pager: document.getElementById('pager'),
  pagePrev: document.getElementById('page-prev'),
  pageNext: document.getElementById('page-next'),
  pageInfo: document.getElementById('page-info'),
};

function render() {
  const grid = els.grid;
  grid.innerHTML = '';
  const items = state.filtered;

  if (items.length === 0) {
    els.empty.style.display = 'block';
    if (els.pager) els.pager.style.display = 'none';
    return;
  }
  els.empty.style.display = 'none';
  if (els.pager) els.pager.style.display = 'flex';

  const start = (state.page - 1) * state.pageSize;
  const paged = items.slice(start, start + state.pageSize);

  paged.forEach((effect) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="preview">
        <iframe loading="lazy" sandbox="allow-scripts" src="${effect.html}"></iframe>
      </div>
      <div class="meta">
        <div class="title">${escapeHtml(effect.title)}</div>
        <div class="info">${escapeHtml(effect.model)}</div>
        <div class="info">${escapeHtml(effect.theme)}</div>
        <div class="info">${escapeHtml(effect.technique)}</div>
        <div class="info">${escapeHtml(effect.created_at)}</div>
      </div>
      <div class="footer">
        <div class="actions">
          <a class="btn" href="${effect.code}" target="_blank">Code</a>
          <a class="btn" href="${effect.html}" download>Download</a>
          <button class="btn" data-action="fullscreen">Fullscreen</button>
        </div>
      </div>
    `;

    card.querySelector('[data-action="fullscreen"]').addEventListener('click', () => {
      openModal(effect.html);
    });

    grid.appendChild(card);
  });

  updatePager();
}

function updatePager() {
  state.totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  if (state.page > state.totalPages) state.page = state.totalPages;
  if (els.pageInfo) {
    els.pageInfo.textContent = `${state.page} / ${state.totalPages}`;
  }
  const totalEl = document.getElementById('stat-total');
  const pagesEl = document.getElementById('stat-pages');
  if (totalEl) totalEl.textContent = String(state.filtered.length);
  if (pagesEl) pagesEl.textContent = String(state.totalPages);
  if (els.pagePrev) els.pagePrev.disabled = state.page <= 1;
  if (els.pageNext) els.pageNext.disabled = state.page >= state.totalPages;
}

function applyFilter() {
  const q = els.search.value.trim().toLowerCase();
  const sort = els.sort.value;

  let items = state.effects.filter((e) => {
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.model.toLowerCase().includes(q) ||
      e.theme.toLowerCase().includes(q) ||
      e.technique.toLowerCase().includes(q)
    );
  });

  items = items.sort((a, b) => {
    if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  state.filtered = items;
  state.page = 1;
  render();
}

function openModal(url) {
  els.modalFrame.src = url;
  els.modal.classList.add('active');
}

function closeModal() {
  els.modal.classList.remove('active');
  els.modalFrame.src = '';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

els.search.addEventListener('input', applyFilter);
els.sort.addEventListener('change', applyFilter);
els.modalClose.addEventListener('click', closeModal);
els.modal.addEventListener('click', (e) => {
  if (e.target === els.modal) closeModal();
});

if (els.pagePrev) {
  els.pagePrev.addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      render();
    }
  });
}
if (els.pageNext) {
  els.pageNext.addEventListener('click', () => {
    if (state.page < state.totalPages) {
      state.page += 1;
      render();
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

(async function init() {
  const index = await api.loadIndex();
  state.effects = index.effects || [];
  state.filtered = state.effects;
  render();
})();
