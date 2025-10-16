import { atom } from 'jotai';
import type { User } from '@supabase/supabase-js';

// 유저 정보를 저장하는 atom
export const userAtom = atom<User | null>(null);

// 로그인 상태를 확인하는 atom
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom);
  return user !== null;
});

// 로딩 상태를 관리하는 atom
export const authLoadingAtom = atom<boolean>(true);
