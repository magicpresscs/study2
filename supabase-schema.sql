-- CampusLink 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. 프로필 테이블
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  dept text,
  since text,
  created_at timestamp with time zone default now()
);

-- 2. 모집글 테이블
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  area text not null,
  deadline date not null,
  people_need int not null,
  people_current int not null default 1,
  period_start date not null,
  period_end date not null,
  body text,
  cover text,
  contact text,
  place text,
  owner_id uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- 3. 댓글 테이블
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete set null,
  author_name text not null,
  text text not null,
  created_at timestamp with time zone default now()
);

-- 4. 북마크 테이블
create table if not exists bookmarks (
  user_id uuid references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, post_id)
);

-- 5. RLS(행 수준 보안) 활성화
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table bookmarks enable row level security;

-- 6. 프로필 정책
create policy "프로필 전체 읽기" on profiles
  for select using (true);

create policy "본인 프로필 생성" on profiles
  for insert with check (auth.uid() = id);

create policy "본인 프로필 수정" on profiles
  for update using (auth.uid() = id);

-- 7. 모집글 정책
create policy "모집글 전체 읽기" on posts
  for select using (true);

create policy "로그인 사용자 모집글 작성" on posts
  for insert with check (auth.uid() is not null);

create policy "작성자만 모집글 수정" on posts
  for update using (auth.uid() = owner_id);

create policy "작성자만 모집글 삭제" on posts
  for delete using (auth.uid() = owner_id);

-- 8. 댓글 정책
create policy "댓글 전체 읽기" on comments
  for select using (true);

create policy "로그인 사용자 댓글 작성" on comments
  for insert with check (auth.uid() is not null);

create policy "작성자만 댓글 삭제" on comments
  for delete using (auth.uid() = author_id);

-- 9. 북마크 정책
create policy "본인 북마크만 조회" on bookmarks
  for select using (auth.uid() = user_id);

create policy "본인 북마크만 생성" on bookmarks
  for insert with check (auth.uid() = user_id);

create policy "본인 북마크만 삭제" on bookmarks
  for delete using (auth.uid() = user_id);

-- 10. 샘플 데이터 (선택사항)
-- 아래는 테스트용 샘플 데이터입니다. 필요 시 주석을 해제하고 실행하세요.
/*
insert into posts (title, desc, category, area, deadline, people_need, people_current, period_start, period_end, body, contact, place) values
('알고리즘 스터디 (주 2회)', '기초부터 중급까지 백준/프로그래머스 풀이. 같이 성장해요!', 'study', '천안시 동남구', current_date + interval '7 days', 5, 2, current_date + interval '10 days', current_date + interval '80 days', '주 2회 오프라인 진행. 문제 풀이 공유 및 코드 리뷰 진행합니다.', 'https://open.kakao.com', '천안터미널 인근 스터디룸'),
('취미 드로잉 동아리 신입 모집', '스케치부터 수채화까지 함께 그려요. 전시도 계획 중!', 'club', '천안시 서북구', current_date + interval '14 days', 10, 3, current_date + interval '20 days', current_date + interval '120 days', '격주 토요일 활동. 재료 일부 지원, 초보 환영!', 'drawing@example.com', 'OO대 미술관 라운지'),
('캡스톤 프로젝트 팀원 구함 (웹 풀스택)', '프론트/백엔드 각 1명 모집. 실사용 MVP 함께 만들어요.', 'project', '천안시 동남구', current_date + interval '5 days', 4, 3, current_date + interval '6 days', current_date + interval '100 days', 'React + Node 기반. 주 1회 회의, 나머지는 온라인 협업.', 'project@example.com', 'OO대 도서관 세미나실');
*/

