import { HomePage } from './pages/home.js';
import { ListPage } from './pages/list.js';
import { DetailPage } from './pages/detail.js';
import { CreatePage } from './pages/create.js';

const routes = {
  '/': HomePage,
  '/list': ListPage,
  '/detail': DetailPage,
  '/create': CreatePage,
  '/about': () => `<div class="cl-container" style="padding:20px 0">서비스 소개 준비중입니다.</div>`,
  '/terms': () => `<div class="cl-container" style="padding:20px 0">이용약관 준비중입니다.</div>`,
  '/privacy': () => `<div class="cl-container" style="padding:20px 0">개인정보처리방침 준비중입니다.</div>`,
};

export function navigate(path) {
  window.location.hash = '#' + path;
}

function parseLocation() {
  const hash = window.location.hash || '#/';
  const url = new URL(hash.slice(1), window.location.origin);
  return { path: url.pathname, searchParams: url.searchParams };
}

export function initRouter() {
  const app = document.getElementById('app');

  const render = () => {
    const { path, searchParams } = parseLocation();
    const Page = routes[path] || (() => `<div class="cl-container" style="padding:20px 0">페이지를 찾을 수 없습니다.</div>`);
    const html = Page({ searchParams });
    if (typeof html === 'string') {
      app.innerHTML = html;
    } else if (html instanceof HTMLElement) {
      app.replaceChildren(html);
    } else {
      app.innerHTML = '';
      app.appendChild(html);
    }
  };

  window.addEventListener('hashchange', render);
  render();
}




