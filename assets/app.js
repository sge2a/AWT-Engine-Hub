const state = {
  effects: [],
  filtered: [],
  currentPage: 1,
  pageSize: 12,
  totalPages: 1,
};

const api = {
  async loadIndex() {
    const res = await fetch('effects/index.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('index not found');
    return res.json();
  },
};

const els = {
  grid: document.getElementById('gallery-grid'),
  empty: document.getElementById('empty-state'),
  search: document.getElementById('search-input'),
  sort: document.getElementById('sort-select'),
  modal: document.getElementById('modal-overlay'),
  modalFrame: document.getElementById('modal-iframe'),
  modalClose: document.getElementById('modal-close-btn'),
  modalCode: document.getElementById('modal-code-btn'),
  modalDownload: document.getElementById('modal-download-btn'),
  pagination: document.getElementById('pagination-bar'),
  statTotal: document.getElementById('stat-total')?.querySelector('.stat-value'),
  statPages: document.getElementById('stat-pages')?.querySelector('.stat-value'),
};

function renderEffectCard(effect, prepend = false) {
  const grid = els.grid;
  const card = document.createElement('div');
  card.className = 'effect-card';
  card.dataset.id = effect.id;

  const timeStr = effect.created_at || '—';
  const modelColor = effect.color || '#6e56cf';

  card.innerHTML = `
    <div class="card-preview" data-id="${effect.id}">
      <iframe
        sandbox="allow-scripts"
        src="${effect.html}"
        loading="lazy"
        title="Effect by ${escapeAttr(effect.model || 'AWT')}"
      ></iframe>
      <div class="card-preview-overlay">
        <button class="card-preview-expand">全屏查看</button>
      </div>
    </div>
    <div class="card-info">
      <div class="card-model">
        <span class="dot" style="background: ${modelColor}"></span>
        ${escapeHtml(effect.model || 'AWT')}
      </div>
      <div class="card-theme">${escapeHtml(effect.title || effect.theme || effect.id)}</div>
    </div>
    <div class="card-footer">
      <span class="card-technique">${escapeHtml(effect.technique || 'HTML')}</span>
      <span class="card-time">${timeStr}</span>
      <div class="card-actions">
        <a class="btn-code" href="${effect.html}" target="_blank" title="代码">{ }</a>
        <a class="btn-download" href="${effect.html}" download title="下载">↓</a>
        <button class="btn-download" data-action="fullscreen" title="全屏">⤢</button>
      </div>
    </div>
  `;

  card.querySelector('[data-action="fullscreen"]').addEventListener('click', () => {
    openModal(effect);
  });
  card.querySelector('.card-preview').addEventListener('click', () => {
    openModal(effect);
  });

  if (prepend) {
    grid.prepend(card);
  } else {
    grid.appendChild(card);
  }
}

function renderGallery(items) {
  els.grid.innerHTML = '';
  if (!items.length) {
    els.empty.classList.remove('hidden');
    if (els.pagination) els.pagination.innerHTML = '';
    return;
  }
  els.empty.classList.add('hidden');

  const start = (state.currentPage - 1) * state.pageSize;
  const paged = items.slice(start, start + state.pageSize);
  paged.forEach((effect) => renderEffectCard(effect));

  renderPagination();
  updateStats();
}

function renderPagination() {
  const totalEffects = state.filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEffects / state.pageSize));
  state.totalPages = totalPages;
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  if (!els.pagination) return;

  const currentPage = state.currentPage;
  const start = (currentPage - 1) * state.pageSize + 1;
  const end = Math.min(currentPage * state.pageSize, totalEffects);

  const pages = [];
  pages.push(1);
  if (currentPage > 3) pages.push('...');
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  const pageButtons = pages
    .map((p) => {
      if (p === '...') return `<span class="pagination-ellipsis">…</span>`;
      return `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    })
    .join('');

  els.pagination.innerHTML = `
    <button class="pagination-btn pagination-nav" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>
      ‹ 上一页
    </button>
    <div class="pagination-pages">
      ${pageButtons}
    </div>
    <button class="pagination-btn pagination-nav" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>
      下一页 ›
    </button>
    <span class="pagination-info">${start}-${end} / ${totalEffects}</span>
  `;

  els.pagination.onclick = (e) => {
    const btn = e.target.closest('.pagination-btn');
    if (!btn || btn.disabled) return;
    const page = parseInt(btn.dataset.page, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      state.currentPage = page;
      renderGallery(state.filtered);
    }
  };
}

function updateStats() {
  if (els.statTotal) els.statTotal.textContent = String(state.filtered.length);
  if (els.statPages) els.statPages.textContent = String(state.totalPages || 1);
}

function applyFilter() {
  const q = els.search.value.trim().toLowerCase();
  const sort = els.sort.value;

  let items = state.effects.filter((e) => {
    if (!q) return true;
    return (
      (e.title || '').toLowerCase().includes(q) ||
      (e.model || '').toLowerCase().includes(q) ||
      (e.theme || '').toLowerCase().includes(q) ||
      (e.technique || '').toLowerCase().includes(q)
    );
  });

  items = items.sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    if (sort === 'oldest') return da - db;
    return db - da;
  });

  state.filtered = items;
  state.currentPage = 1;
  renderGallery(state.filtered);
}

function openModal(effect) {
  els.modalFrame.src = effect.html;
  els.modal.classList.add('active');
  if (els.modalCode) {
    els.modalCode.onclick = () => window.open(effect.html, '_blank');
  }
  if (els.modalDownload) {
    els.modalDownload.onclick = () => {
      const a = document.createElement('a');
      a.href = effect.html;
      a.download = '';
      a.click();
    };
  }
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

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

els.search.addEventListener('input', applyFilter);
els.sort.addEventListener('change', applyFilter);
els.modalClose.addEventListener('click', closeModal);
els.modal.addEventListener('click', (e) => {
  if (e.target === els.modal) closeModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

(async function init() {
  try {
    const index = await api.loadIndex();
    state.effects = index.effects || [];
  } catch (err) {
    state.effects = [];
  }
  state.filtered = state.effects;
  renderGallery(state.filtered);
})();
