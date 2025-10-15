import { AREAS, CATEGORIES, getAllPosts } from '../store.js';
import { navigate } from '../router.js';

export function ListPage({ searchParams }) {
  const q = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'latest';
  const area = searchParams.get('area') || '전체';

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="cl-container list-layout">
      <aside class="filter">
        <div class="group">
          <h3>카테고리</h3>
          <select id="f-category">
            <option value="all">전체</option>
            ${CATEGORIES.map(c => `<option value="${c.id}" ${c.id===selectedCategory?'selected':''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="group">
          <h3>지역</h3>
          <select id="f-area">
            ${AREAS.map(a => `<option value="${a}" ${a===area?'selected':''}>${a}</option>`).join('')}
          </select>
        </div>
        <div class="group">
          <h3>정렬</h3>
          <select id="f-sort">
            <option value="latest" ${sort==='latest'?'selected':''}>최신순</option>
            <option value="popular" ${sort==='popular'?'selected':''}>인기순</option>
            <option value="deadline" ${sort==='deadline'?'selected':''}>마감임박순</option>
          </select>
        </div>
      </aside>
      <section>
        <div class="sort-bar">
          <div style="color:#6b7280;">검색어: ${q || '-'}</div>
        </div>
        <div id="cards-loading" style="padding:40px;text-align:center;color:#6b7280;">로딩 중...</div>
        <div class="cards" id="cards" style="display:none;"></div>
      </section>
    </div>
  `;

  const cardsContainer = el.querySelector('#cards');
  const loadingEl = el.querySelector('#cards-loading');

  function renderCards() {
    loadingEl.style.display = 'block';
    cardsContainer.style.display = 'none';
    
    getAllPosts({ q, category: selectedCategory, area, sort }).then(posts => {
      loadingEl.style.display = 'none';
      cardsContainer.style.display = 'grid';
      
      if (posts.length === 0) {
        cardsContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#6b7280;">검색 결과가 없습니다.</div>';
        return;
      }
      
      cardsContainer.innerHTML = posts.map(p => `
        <div class="card" data-id="${p.id}">
          <div class="card-thumb">${p.category.toUpperCase()}</div>
          <div class="card-body">
            <h3 class="card-title">${p.title}</h3>
            <p class="card-desc">${p.description || ''}</p>
            <div class="card-meta">
              <span class="tag">${p.area}</span>
              <span>${p.people_current}/${p.people_need}명</span>
              <span>마감 ${p.deadline}</span>
            </div>
          </div>
        </div>
      `).join('');

      cardsContainer.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => navigate('/detail?id=' + card.getAttribute('data-id')));
      });
    }).catch(err => {
      console.error('Failed to load posts:', err);
      loadingEl.textContent = '데이터를 불러오는데 실패했습니다.';
    });
  }

  renderCards();

  // 필터 변경 이벤트
  el.querySelector('#f-category').addEventListener('change', (e) => {
    navigate(`/list?category=${e.target.value}&area=${encodeURIComponent(area)}&sort=${sort}&q=${encodeURIComponent(q)}`);
  });
  el.querySelector('#f-area').addEventListener('change', (e) => {
    navigate(`/list?category=${selectedCategory}&area=${encodeURIComponent(e.target.value)}&sort=${sort}&q=${encodeURIComponent(q)}`);
  });
  el.querySelector('#f-sort').addEventListener('change', (e) => {
    navigate(`/list?category=${selectedCategory}&area=${encodeURIComponent(area)}&sort=${e.target.value}&q=${encodeURIComponent(q)}`);
  });

  return el;
}
