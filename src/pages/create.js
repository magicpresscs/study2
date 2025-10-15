import { CATEGORIES, createPost } from '../store.js';
import { getSession } from '../auth.js';
import { navigate } from '../router.js';

export function CreatePage() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="cl-container" style="padding:20px 0">
      <div id="auth-check">로그인 확인 중...</div>
      <div id="create-form-wrapper" style="display:none;">
        <h2 style="margin:0 0 12px;">새로운 스터디/동아리 모집글 등록</h2>
        <form class="form" id="create-form">
          <div class="field">
            <label>카테고리</label>
            <select name="category" required>
              ${CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>제목</label>
            <input type="text" name="title" required />
          </div>
          <div class="field">
            <label>대표 이미지 (URL)</label>
            <input type="url" name="cover" placeholder="옵션" />
          </div>
          <div class="field">
            <label>활동 목표/내용</label>
            <textarea name="body" placeholder="활동 목적, 규칙, 예상 활동 내용 등"></textarea>
          </div>
          <div class="field">
            <label>간략 설명</label>
            <input type="text" name="description" maxlength="120" placeholder="카드에 노출되는 한 줄 설명" />
          </div>
          <div class="row" style="gap:12px;">
            <div class="field" style="flex:1;">
              <label>모집 인원</label>
              <input type="number" name="need" min="1" max="20" required />
            </div>
            <div class="field" style="flex:1;">
              <label>모집 마감일</label>
              <input type="date" name="deadline" required />
            </div>
          </div>
          <div class="row" style="gap:12px;">
            <div class="field" style="flex:1;">
              <label>활동 시작일</label>
              <input type="date" name="start" required />
            </div>
            <div class="field" style="flex:1;">
              <label>활동 종료일</label>
              <input type="date" name="end" required />
            </div>
          </div>
          <div class="field">
            <label>활동 장소</label>
            <input type="text" name="place" required />
          </div>
          <div class="field">
            <label>지역</label>
            <select name="area" required>
              <option value="천안시 동남구">천안시 동남구</option>
              <option value="천안시 서북구">천안시 서북구</option>
            </select>
          </div>
          <div class="field">
            <label>연락 방법</label>
            <input type="text" name="contact" required placeholder="오픈채팅 링크, 이메일 등" />
          </div>
          <div class="actions">
            <button type="button" class="btn ghost" id="cancel">취소</button>
            <button type="submit" class="btn primary">등록하기</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const authCheck = el.querySelector('#auth-check');
  const formWrapper = el.querySelector('#create-form-wrapper');
  const form = el.querySelector('#create-form');

  // 인증 확인
  getSession().then(session => {
    if (!session) {
      authCheck.textContent = '로그인이 필요합니다.';
      return;
    }
    authCheck.style.display = 'none';
    formWrapper.style.display = 'block';
  });

  // 폼 제출
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const session = await getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const fd = new FormData(form);
    const title = fd.get('title').trim();
    if (!title) {
      alert('제목을 입력하세요');
      return;
    }

    const need = parseInt(fd.get('need'), 10);
    if (Number.isNaN(need) || need < 1) {
      alert('모집 인원을 올바르게 입력하세요');
      return;
    }

    const postData = {
      title,
      description: fd.get('description').trim(),
      category: fd.get('category'),
      area: fd.get('area'),
      deadline: fd.get('deadline'),
      people_need: need,
      people_current: 1,
      period_start: fd.get('start'),
      period_end: fd.get('end'),
      body: fd.get('body').trim(),
      cover: fd.get('cover').trim(),
      contact: fd.get('contact').trim(),
      place: fd.get('place').trim(),
    };

    try {
      const newPost = await createPost(session.id, postData);
      alert('등록이 완료되었습니다.');
      navigate('/detail?id=' + newPost.id);
    } catch (err) {
      console.error('Create post error:', err);
      alert('등록에 실패했습니다: ' + err.message);
    }
  });

  el.querySelector('#cancel').addEventListener('click', () => navigate('/list'));

  return el;
}
