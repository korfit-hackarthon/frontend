import axios from 'axios';
import { authService } from '../services/auth';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://plndk-49-143-88-169.a.free.pinggy.link'
      : 'http://localhost:8000', // 프로덕션/로컬 백엔드 URL
  timeout: 10000,
});

// 요청 인터셉터: 모든 요청에 Authorization 헤더 추가
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 설정 에러:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 로그아웃 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      try {
        await authService.signOut();
        window.location.href = '/login';
      } catch (signOutError) {
        console.error('로그아웃 처리 에러:', signOutError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
