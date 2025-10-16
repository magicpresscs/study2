# CampusLink (캠퍼스링크)

천안 지역 대학생들을 위한 스터디/동아리 모집 웹 플랫폼

## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. Supabase 설정

#### 2-1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속 및 회원가입
2. "New Project" 클릭
3. 프로젝트명, 데이터베이스 비밀번호, Region 선택
4. 프로젝트 생성 완료 대기 (1-2분)

#### 2-2. 환경 변수 설정
1. 프로젝트 루트에 `.env` 파일 생성
2. Supabase Dashboard → Project Settings → API에서 값 확인
3. 아래 내용을 `.env`에 입력:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

#### 2-3. 데이터베이스 스키마 생성
1. Supabase Dashboard → SQL Editor
2. `supabase-schema.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기 후 "RUN" 클릭
4. 성공 메시지 확인

#### 2-4. 이메일 인증 설정 (선택)
개발 중에는 이메일 인증을 비활성화할 수 있습니다:
1. Supabase Dashboard → Authentication → Settings
2. "Enable email confirmations" 토글을 OFF로 설정

### 3. 개발 서버 실행

```bash
pnpm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 빌드

```bash
pnpm run build
```

## 📁 프로젝트 구조

```
D:\AI\study\
├── index.html              # 메인 HTML
├── styles.css              # 전역 스타일
├── src/
│   ├── app.js             # 앱 진입점
│   ├── router.js          # 해시 라우터
│   ├── auth.js            # Supabase 인증
│   ├── store.js           # 데이터 레이어 (Supabase queries)
│   ├── lib/
│   │   └── supabase.js    # Supabase 클라이언트
│   └── pages/
│       ├── home.js        # 메인 페이지
│       ├── list.js        # 모집글 목록
│       ├── detail.js      # 모집글 상세
│       └── create.js      # 모집글 등록
├── supabase-schema.sql    # DB 스키마
└── package.json
```

## ✨ 주요 기능

### MVP (최소 기능 제품)
- ✅ 회원가입/로그인 (Supabase Auth)
- ✅ 모집글 등록 (개설자가 스터디/동아리 모집글 작성)
- ✅ 모집글 목록 조회 (전체 모집글 목록 확인)
- ✅ 모집글 상세 페이지 조회 (선택한 모집글의 자세한 내용 확인)
- ✅ 카테고리 필터링 (학습/스터디, 취미/동아리, 프로젝트, 대회/공모전)
- ✅ 지역 필터링 (천안시 동남구, 서북구)
- ✅ 정렬 (최신순, 인기순, 마감임박순)
- ✅ 검색 기능
- ✅ 북마크/찜하기
- ✅ 댓글 기능
- ✅ 공유하기

## 🛠 기술 스택

- **프론트엔드**: Vanilla JavaScript (ES6+)
- **스타일**: CSS (Tailwind-inspired utility classes)
- **빌드**: Vite
- **백엔드**: Supabase (PostgreSQL + Auth + Realtime)
- **패키지 매니저**: pnpm

## 📝 데이터베이스 구조

### profiles (프로필)
- `id` (uuid, primary key)
- `name` (text)
- `dept` (text) - 학교/학과
- `since` (text) - 가입일
- `created_at` (timestamp)

### posts (모집글)
- `id` (uuid, primary key)
- `title` (text)
- `desc` (text) - 간략 설명
- `category` (text) - 카테고리
- `area` (text) - 지역
- `deadline` (date) - 모집 마감일
- `people_need` (int) - 모집 인원
- `people_current` (int) - 현재 인원
- `period_start` (date) - 활동 시작일
- `period_end` (date) - 활동 종료일
- `body` (text) - 상세 내용
- `cover` (text) - 대표 이미지 URL
- `contact` (text) - 연락 방법
- `place` (text) - 활동 장소
- `owner_id` (uuid) - 작성자
- `created_at` (timestamp)

### comments (댓글)
- `id` (uuid, primary key)
- `post_id` (uuid) - 모집글 ID
- `author_id` (uuid) - 작성자 ID
- `author_name` (text) - 작성자 이름
- `text` (text) - 댓글 내용
- `created_at` (timestamp)

### bookmarks (북마크)
- `user_id` (uuid) - 사용자 ID
- `post_id` (uuid) - 모집글 ID
- `created_at` (timestamp)

## 🔒 보안 (RLS - Row Level Security)

Supabase의 RLS를 통해 데이터 접근 권한을 제어합니다:
- 모든 사용자가 모집글/댓글 읽기 가능
- 로그인 사용자만 글/댓글 작성 가능
- 작성자만 본인 글 수정/삭제 가능
- 본인 북마크만 조회/관리 가능

## 🐛 트러블슈팅

### 환경 변수가 로드되지 않을 때
- `.env` 파일이 프로젝트 루트에 있는지 확인
- `VITE_` 접두사가 붙어있는지 확인
- 개발 서버를 재시작 (`Ctrl+C` 후 `pnpm run dev`)

### Supabase 연결 오류
- `.env` 파일의 URL과 Key가 정확한지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 회원가입 후 로그인이 안될 때
- 이메일 인증이 활성화되어 있다면 이메일 확인
- 또는 Authentication → Settings에서 이메일 인증 비활성화

## 📄 라이선스

MIT License

## 👥 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!

---

Made with ❤️ for 천안 지역 대학생

##20251016_회사작업

##20251016_집작업

##20251016_회사작업2
