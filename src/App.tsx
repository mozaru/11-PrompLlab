import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, type To } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Config from './pages/Config';
import Chat from './pages/Chat';
import Prompts from './pages/Prompts';
import RegexPage from './pages/Regex';
import Batch from './pages/Batch';
import History from './pages/History';
import { NavBar } from './components/NavBar';
import { savePromptsRegexToLocal, loadPromptsRegexFromLocal, applyPromptsRegex } from './lib/projects';

type View = 'welcome' | 'config' | 'chat' | 'prompts' | 'regex' | 'batch' | 'history';

function pathToView(pathname: string): View {
  if (pathname.startsWith('/config'))  return 'config';
  if (pathname.startsWith('/chat'))    return 'chat';
  if (pathname.startsWith('/prompts')) return 'prompts';
  if (pathname.startsWith('/regex'))   return 'regex';
  if (pathname.startsWith('/batch'))   return 'batch';
  if (pathname.startsWith('/history')) return 'history';
  return 'welcome';
}

const isPR = (v: View) => v === 'prompts' || v === 'regex';
const shouldSaveProfile = (from: View, to: View) => isPR(from) && !isPR(to);

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const prevViewRef = useRef<View>('welcome');

  // Carrega último profile salvo ao iniciar
  useEffect(() => {
    const last = loadPromptsRegexFromLocal();
    if (last) {
      try { applyPromptsRegex(last); } catch { /* ignore */ }
    }
  }, []);

  // Salva profile ao trocar de rota (segundo a regra acima)
  useEffect(() => {
    const currentView = pathToView(location.pathname);
    const prevView = prevViewRef.current;
    if (prevView !== currentView && shouldSaveProfile(prevView, currentView)) {
      try { savePromptsRegexToLocal(); } catch {}
    }
    prevViewRef.current = currentView;
  }, [location.pathname]);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Welcome onNavigate={(v:To) => navigate(v)} />} />
        <Route path="/config" element={<Config />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/prompts" element={<Prompts />} />
        <Route path="/regex" element={<RegexPage />} />
        <Route path="/batch" element={<Batch />} />
        <Route path="/history" element={<History />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

  