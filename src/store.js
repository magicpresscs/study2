import { supabase } from './lib/supabase.js';

// ===== 모집글 관련 =====

export async function getAllPosts({ q = '', category = 'all', area = '전체', sort = 'latest' } = {}) {
  let query = supabase.from('posts').select('*');
  
  // 필터링
  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,body.ilike.%${q}%`);
  }
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (area && area !== '전체') {
    query = query.eq('area', area);
  }
  
  // 정렬
  if (sort === 'deadline') {
    query = query.order('deadline', { ascending: true });
  } else if (sort === 'popular') {
    query = query.order('people_current', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('getAllPosts error:', error);
    return [];
  }
  return data || [];
}

export async function getPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('getPostById error:', error);
    return null;
  }
  return data;
}

export async function createPost(userId, postData) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{
      ...postData,
      owner_id: userId,
    }])
    .select()
    .single();
  
  if (error) {
    console.error('createPost error:', error);
    throw error;
  }
  return data;
}

export async function updatePost(postId, updates) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();
  
  if (error) {
    console.error('updatePost error:', error);
    throw error;
  }
  return data;
}

// ===== 북마크 관련 =====

export async function toggleBookmark(userId, postId) {
  if (!userId) return false;
  
  // 이미 북마크가 있는지 확인
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();
  
  if (existing) {
    // 삭제
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    
    if (error) console.error('toggleBookmark delete error:', error);
    return false;
  } else {
    // 추가
    const { error } = await supabase
      .from('bookmarks')
      .insert([{ user_id: userId, post_id: postId }]);
    
    if (error) console.error('toggleBookmark insert error:', error);
    return true;
  }
}

export async function isBookmarked(userId, postId) {
  if (!userId) return false;
  
  const { data } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();
  
  return !!data;
}

// ===== 댓글 관련 =====

export async function getComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('getComments error:', error);
    return [];
  }
  return data || [];
}

export async function addComment(userId, postId, authorName, text) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      post_id: postId,
      author_id: userId,
      author_name: authorName,
      text,
    }])
    .select()
    .single();
  
  if (error) {
    console.error('addComment error:', error);
    throw error;
  }
  return data;
}

// ===== 상수 =====

export const CATEGORIES = [
  { id: 'study', name: '학습/스터디', icon: '📘' },
  { id: 'club', name: '취미/동아리', icon: '🎨' },
  { id: 'project', name: '프로젝트', icon: '🧩' },
  { id: 'contest', name: '대회/공모전', icon: '🏆' },
];

export const AREAS = [
  '전체',
  '천안시 동남구',
  '천안시 서북구',
];
