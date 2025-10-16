import { supabase } from '../utils/supabase';
import type { User } from '@supabase/supabase-js';

export class AuthService {
  // GitHub 로그인
  async signInWithGitHub() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('GitHub 로그인 에러:', error);
      throw error;
    }
  }

  // Google 로그인
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Google 로그인 에러:', error);
      throw error;
    }
  }

  // 로그아웃
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
      throw error;
    }
  }

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return user;
    } catch (error) {
      console.error('사용자 정보 조회 에러:', error);
      return null;
    }
  }

  // 세션 가져오기
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      return session;
    } catch (error) {
      console.error('세션 조회 에러:', error);
      return null;
    }
  }

  // 액세스 토큰 가져오기
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await this.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('액세스 토큰 조회 에러:', error);
      return null;
    }
  }

  // 인증 상태 변화 감지
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
}

export const authService = new AuthService();
