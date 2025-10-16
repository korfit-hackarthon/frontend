import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Provider } from 'jotai';
import AuthProvider from './providers/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Welcome from './pages/Welcome';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import { AppLayout } from './components/layout/app-layout';
import Settings from './pages/Settings';
import AudioSessions from './pages/AudioSessions';
import AudioChat from './pages/AudioChat';
import SimulationList from './pages/SimulationList';
import Simulation from './pages/Simulation';
import SimulationSuccess from './pages/SimulationSuccess';
import { Toaster } from 'sonner';

function App() {
  return (
    <ErrorBoundary>
      <Provider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster />
            <Routes>
              {/* 공개 페이지 */}
              <Route path='/' element={<Welcome />} />
              <Route path='/auth/callback' element={<AuthCallback />} />

              {/* 프로필 설정 (사이드바 없는 풀스크린) */}
              <Route
                path='/profile-setup'
                element={
                  <ProtectedRoute>
                    <ProfileSetup />
                  </ProtectedRoute>
                }
              />

              {/* 보호된 라우트들 (사이드바 포함) */}
              <Route
                path='/*'
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Outlet />
                    </AppLayout>
                  </ProtectedRoute>
                }
              >
                <Route path='dashboard' element={<Dashboard />} />
                <Route path='settings' element={<Settings />} />
                <Route path='audio-sessions' element={<AudioSessions />} />
                <Route path='audio-chat/:sessionId' element={<AudioChat />} />
                <Route path='simulations' element={<SimulationList />} />
                <Route path='simulation/:scenarioId' element={<Simulation />} />
                <Route
                  path='simulation/:simulationId/success'
                  element={<SimulationSuccess />}
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}
export default App;
