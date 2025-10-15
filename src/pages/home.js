import { CATEGORIES, getAllPosts } from '../store.js';
import { navigate } from '../router.js';

export function HomePage() {
  const el = document.createElement('div');
  el.innerHTML = `
    <section class="hero">
      <div class="cl-container">
        <h1>함께 성장하는 대학생활의 시작, 캠퍼스링크</h1>
        <p>천안 지역 스터디/동아리를 지금 바로 찾아보세요!</p>
      </div>
    </section>
    <section class="categories">
      <div class="cl-container">
        <div class="category-grid" id="category-grid"></div>
      </div>
    </section>
    <section class="latest">
      <div class="cl-container">
        <div class="section-title">
          <h3 style="margin:0">새롭게 올라왔어요!</h3>
          <button class="btn ghost" id="see-more">더 보기</button>
        </div>
        <div id="cards-loading" style="padding:40px;text-align:center;color:#6b7280;">로딩 중...</div>
        <div class="cards" id="cards" style="display:none;"></div>
      </div>
    </section>
  `;

  // 카테고리 버튼 렌더링
  const categoryGrid = el.querySelector('#category-grid');
  categoryGrid.innerHTML = CATEGORIES.map(c => `
    <div class="category-card" data-cat="${c.id}">
      <div style="font-size:20px">${c.icon}</div>
      <div>${c.name}</div>
    </div>
  `).join('');

  // 카테고리 클릭 이벤트
  categoryGrid.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-cat');
      navigate('/list?category=' + encodeURIComponent(cat));
    });
  });

  // 최신 모집글 비동기 로드
  const cardsContainer = el.querySelector('#cards');
  const loadingEl = el.querySelector('#cards-loading');
  
  getAllPosts({ sort: 'latest' }).then(posts => {
    loadingEl.style.display = 'none';
    cardsContainer.style.display = 'grid';
    
    const latest = posts.slice(0, 6);
    if (latest.length === 0) {
      cardsContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#6b7280;">아직 등록된 모집글이 없습니다.</div>';
      return;
    }
    
    cardsContainer.innerHTML = latest.map(p => `
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

  el.querySelector('#see-more').addEventListener('click', () => navigate('/list'));

  return el;
}
