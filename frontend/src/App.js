import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import Login    from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyFiles   from './pages/MyFiles';
import SanitizerPage from './pages/SanitizerPage';
import TpaPage   from './pages/TpaPage';
import PkgPage   from './pages/PkgPage';
import SharePage from './pages/SharePage';

// ── Auth Context ─────────────────────────────────────────────
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoad]  = useState(true);
  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) setUser(JSON.parse(u));
    setLoad(false);
  }, []);
  const loginCtx = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };
  const logoutCtx = () => { localStorage.clear(); setUser(null); };
  return <AuthCtx.Provider value={{ user, loginCtx, logoutCtx, loading }}>{children}</AuthCtx.Provider>;
}

// ── Protected Route ───────────────────────────────────────────
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color:'#94a3b8', padding:'3rem', textAlign:'center' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" />;
}

// ── Sidebar nav items ─────────────────────────────────────────
const NAV = [
  { path:'/',          label:'Dashboard',  icon:'🏠' },
  { path:'/files',     label:'My Files',   icon:'📁' },
  { path:'/sanitizer', label:'Sanitizer',  icon:'🧹' },
  { path:'/tpa',       label:'TPA Audit',  icon:'🛡️' },
  { path:'/pkg',       label:'PKG / Keys', icon:'🔑' },
  { path:'/share',     label:'File Share', icon:'🔗' },
];

const ROLE_BADGE = { USER:'badge-blue', CLOUD_ADMIN:'badge-green',
  TPA:'badge-purple', SANITIZER:'badge-amber', PKG_ADMIN:'badge-red' };

function Layout() {
  const { user, logoutCtx } = useAuth();
  const navigate = useNavigate();
  const doLogout = () => { logoutCtx(); navigate('/login'); };
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span style={{ fontSize:'1.6rem' }}>☁️</span>
          <div>
            <div className="brand-name">CloudSec</div>
            <div className="brand-sub">Security System</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.path} to={n.path} end={n.path === '/'}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.username}</div>
              <span className={`badge ${ROLE_BADGE[user?.role] || 'badge-gray'}`} style={{ marginTop:3 }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={doLogout} style={{ width:'100%', justifyContent:'center' }}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index           element={<Dashboard />} />
            <Route path="files"    element={<MyFiles />} />
            <Route path="sanitizer" element={<SanitizerPage />} />
            <Route path="tpa"      element={<TpaPage />} />
            <Route path="pkg"      element={<PkgPage />} />
            <Route path="share"    element={<SharePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
