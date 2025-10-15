import { initRouter, navigate } from './router.js';
import { getSession, openAuthModal, initAuth } from './auth.js';

async function bindHeaderActions() {
  const createBtn = document.getElementById('btn-create');
  const loginBtn = document.getElementById('btn-login');
  const registerBtn = document.getElementById('btn-register');
  const searchInput = document.getElementById('global-search');

  createBtn.addEventListener('click', async () => {
    const session = await getSession();
    if (!session) {
      openAuthModal('login');
      return;
    }
    navigate('/create');
  });

  loginBtn.addEventListener('click', () => openAuthModal('login'));
  registerBtn.addEventListener('click', () => openAuthModal('register'));

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      navigate('/list?q=' + encodeURIComponent(q));
    }
  });

  // 세션 상태에 따라 버튼 업데이트
  const session = await getSession();
  if (session) {
    loginBtn.textContent = session.name;
    loginBtn.classList.remove('ghost');
    loginBtn.classList.add('primary');
    registerBtn.textContent = '로그아웃';
    registerBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const { logout } = await import('./auth.js');
      await logout();
    });
  }
}

async function main() {
  await initAuth();
  await bindHeaderActions();
  initRouter();
}

document.addEventListener('DOMContentLoaded', main);




