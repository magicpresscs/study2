import { addComment, getComments, getPostById, isBookmarked, toggleBookmark } from '../store.js';
import { getSession } from '../auth.js';

export function DetailPage({ searchParams }) {
  const id = searchParams.get('id');
  
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="cl-container detail">
      <div id="detail-loading" style="padding:40px;text-align:center;color:#6b7280;">로딩 중...</div>
      <div id="detail-content" style="display:none;"></div>
    </div>
  `;

  const loadingEl = el.querySelector('#detail-loading');
  const contentEl = el.querySelector('#detail-content');

  async function render() {
    try {
      const post = await getPostById(id);
      if (!post) {
        loadingEl.textContent = '모집글을 찾을 수 없습니다.';
        return;
      }

      const session = await getSession();
      const bookmarked = session ? await isBookmarked(session.id, post.id) : false;

      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
      contentEl.innerHTML = `
        <div class="detail-header">
          <h1 class="detail-title">${post.title}</h1>
          <div class="author">
            <div class="avatar"></div>
            <div>작성자 · ${post.area}</div>
          </div>
        </div>
        <div class="row" style="justify-content: space-between; margin-bottom: 12px; flex-wrap:wrap; gap:12px;">
          <div class="row" style="flex-wrap: wrap; gap:6px;">
            <span class="pill">카테고리: ${post.category}</span>
            <span class="pill">모집기간 ~ ${post.deadline}</span>
            <span class="pill">활동기간 ${post.period_start} ~ ${post.period_end}</span>
            <span class="pill">인원 ${post.people_current}/${post.people_need}</span>
            <span class="pill">장소 ${post.place}</span>
          </div>
          <div class="detail-actions">
            <button class="btn primary" id="btn-apply">스터디/동아리 지원하기</button>
            <button class="btn ghost" id="btn-bookmark">${bookmarked ? '북마크 취소' : '찜하기'}</button>
            <button class="btn ghost" id="btn-share">공유하기</button>
          </div>
        </div>
        <div class="detail-body">
          <article class="detail-content">
            <p style="color:#6b7280; margin-top:0;">${post.description || ''}</p>
            <div>${(post.body || '').replace(/\n/g,'<br/>')}</div>
          </article>
          <aside class="detail-side">
            <div class="panel">
              <div style="font-weight:600; margin-bottom:8px;">연락 방법</div>
              <a href="${post.contact}" target="_blank" style="word-break:break-all;">${post.contact}</a>
            </div>
            <div class="panel" id="comments-panel">
              <div class="row" style="justify-content: space-between; margin-bottom:6px;">
                <div style="font-weight:600;">댓글</div>
                <div style="color:#6b7280; font-size:12px;">로그인 후 작성</div>
              </div>
              <div id="comment-form" class="stack"></div>
              <div id="comment-list" class="stack"></div>
            </div>
          </aside>
        </div>
      `;

      // 지원하기
      contentEl.querySelector('#btn-apply').addEventListener('click', async () => {
        const session = await getSession();
        if (!session) {
          alert('로그인이 필요합니다.');
          return;
        }
        alert('지원이 접수되었습니다! 개설자가 확인 후 연락드려요.');
      });

      // 북마크
      contentEl.querySelector('#btn-bookmark').addEventListener('click', async (e) => {
        const session = await getSession();
        if (!session) {
          alert('로그인이 필요합니다.');
          return;
        }
        const on = await toggleBookmark(session.id, post.id);
        e.currentTarget.textContent = on ? '북마크 취소' : '찜하기';
      });

      // 공유하기
      contentEl.querySelector('#btn-share').addEventListener('click', async () => {
        const shareUrl = window.location.href;
        try {
          if (navigator.share) {
            await navigator.share({ title: post.title, url: shareUrl });
          } else {
            await navigator.clipboard.writeText(shareUrl);
            alert('링크가 클립보드에 복사되었습니다.');
          }
        } catch (err) {
          console.error('Share error:', err);
        }
      });

      // 댓글 렌더링
      await renderComments();

    } catch (err) {
      console.error('Detail page error:', err);
      loadingEl.textContent = '오류가 발생했습니다.';
    }
  }

  async function renderComments() {
    const session = await getSession();
    const formWrap = contentEl.querySelector('#comment-form');
    const listWrap = contentEl.querySelector('#comment-list');

    // 댓글 입력 폼
    if (!session) {
      formWrap.innerHTML = '<div style="font-size:12px;color:#6b7280;">로그인 후 댓글 작성이 가능합니다.</div>';
    } else {
      formWrap.innerHTML = `
        <form id="c-form" class="row" style="gap:8px;">
          <input id="c-text" type="text" placeholder="댓글을 입력하세요" style="flex:1; padding:10px; border:1px solid #e5e7eb; border-radius:10px;" />
          <button class="btn primary">등록</button>
        </form>
      `;
      formWrap.querySelector('#c-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = formWrap.querySelector('#c-text').value.trim();
        if (!text) return;
        try {
          await addComment(session.id, id, session.name, text);
          formWrap.querySelector('#c-text').value = '';
          await renderCommentsList();
        } catch (err) {
          console.error('Comment error:', err);
          alert('댓글 등록에 실패했습니다.');
        }
      });
    }

    await renderCommentsList();
  }

  async function renderCommentsList() {
    const listWrap = contentEl.querySelector('#comment-list');
    try {
      const comments = await getComments(id);
      if (comments.length === 0) {
        listWrap.innerHTML = '<div style="font-size:12px;color:#6b7280;">첫 댓글을 남겨보세요!</div>';
      } else {
        listWrap.innerHTML = comments.map(c => `
          <div style="border:1px solid #e5e7eb; padding:8px; border-radius:8px;">
            <div style="font-weight:600;">${c.author_name}</div>
            <div style="color:#334155;">${c.text}</div>
            <div style="font-size:12px;color:#64748b;">${new Date(c.created_at).toLocaleString()}</div>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  }

  render();
  return el;
}
