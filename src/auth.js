import { supabase } from './lib/supabase.js';

// 현재 세션 상태를 메모리에 캐시
let currentSession = null;

function h(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

function closeModal() {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
}

async function onSubmitAuth(e, mode) {
  e.preventDefault();
  const form = e.currentTarget;
  const name = form.name?.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value.trim();

  try {
    if (mode === 'register') {
      if (!name) { alert('이름을 입력해주세요'); return; }
      
      // 1. Supabase Auth로 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // 2. 프로필 생성
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        name,
        dept: 'OO대학교',
        since: new Date().toISOString().slice(0, 7),
      }]);
      
      if (profileError) throw profileError;
      
      alert('회원가입이 완료되었습니다! 이메일 확인 후 로그인하세요.');
      closeModal();
      openAuthModal('login');
    } else {
      // 로그인
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // 프로필 정보 조회
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      currentSession = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || '사용자',
        dept: profile?.dept || 'OO대학교',
        since: profile?.since || new Date().toISOString().slice(0, 7),
      };
      
      alert('로그인 성공!');
      closeModal();
      window.location.reload(); // 세션 반영을 위해 새로고침
    }
  } catch (error) {
    console.error('Auth error:', error);
    alert(error.message || '오류가 발생했습니다.');
  }
}

export function openAuthModal(mode = 'login') {
  const root = document.getElementById('modal-root');
  const isRegister = mode === 'register';
  const el = h(`
    <div class="modal-backdrop modal open">
      <div class="modal">
        <div class="row" style="justify-content: space-between; align-items:center; margin-bottom:8px;">
          <h3 style="margin:0">${isRegister ? '회원가입' : '로그인'}</h3>
          <button class="btn ghost" id="close-modal">닫기</button>
        </div>
        <form id="auth-form" class="stack">
          ${isRegister ? '<div class="field"><label>이름</label><input type="text" name="name" required /></div>' : ''}
          <div class="field"><label>이메일</label><input type="email" name="email" required /></div>
          <div class="field"><label>비밀번호</label><input type="password" name="password" required /></div>
          <div class="actions">
            <button type="submit" class="btn primary">${isRegister ? '가입하기' : '로그인'}</button>
          </div>
          <div style="font-size:12px;color:#6b7280;">
            ${isRegister ? '이미 계정이 있나요? ' : '처음이신가요? '}
            <a href="#" id="switch">${isRegister ? '로그인' : '회원가입'}</a>
          </div>
        </form>
      </div>
    </div>
  `);
  root.replaceChildren(el);

  el.querySelector('#close-modal').addEventListener('click', closeModal);
  el.addEventListener('click', (e) => { if (e.target === el) closeModal(); });
  el.querySelector('#auth-form').addEventListener('submit', (e) => onSubmitAuth(e, mode));
  el.querySelector('#switch').addEventListener('click', (e) => { e.preventDefault(); openAuthModal(isRegister ? 'login' : 'register'); });
}

export async function logout() {
  await supabase.auth.signOut();
  currentSession = null;
  window.location.reload();
}

export async function getSession() {
  if (currentSession) return currentSession;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  // 프로필 정보 조회
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  currentSession = {
    id: session.user.id,
    email: session.user.email,
    name: profile?.name || '사용자',
    dept: profile?.dept || 'OO대학교',
    since: profile?.since || new Date().toISOString().slice(0, 7),
  };
  
  return currentSession;
}

// 앱 초기화 시 세션 로드
export async function initAuth() {
  await getSession();
}


