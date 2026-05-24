import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { getMyFiles, getMyAudits, getMyKey } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ files:0, audits:0, key:false });

  useEffect(() => {
    Promise.allSettled([getMyFiles(), getMyAudits(), getMyKey()]).then(([f,a,k]) => {
      setStats({
        files:  f.status==='fulfilled' && Array.isArray(f.value) ? f.value.length : 0,
        audits: a.status==='fulfilled' && Array.isArray(a.value) ? a.value.length : 0,
        key:    k.status==='fulfilled' && k.value?.publicKey,
      });
    });
  }, []);

  const actions = [
    { path:'/files',     icon:'📤', label:'Upload File',   color:'#3b82f6' },
    { path:'/sanitizer', icon:'🧹', label:'Sanitize File', color:'#f59e0b' },
    { path:'/tpa',       icon:'🛡️', label:'Request Audit', color:'#8b5cf6' },
    { path:'/share',     icon:'🔗', label:'Share File',    color:'#10b981' },
    { path:'/pkg',       icon:'🔑', label:'View My Key',   color:'#ef4444' },
  ];

  const modules = [
    { name:'User Module',      icon:'👤', desc:'Register, login, upload & manage files' },
    { name:'Cloud Module',     icon:'☁️', desc:'Secure encrypted cloud file storage' },
    { name:'Sanitizer Module', icon:'🧹', desc:'Auto-detect & redact PII from files' },
    { name:'TPA Module',       icon:'🛡️', desc:'Remote integrity via challenge-response' },
    { name:'PKG Module',       icon:'🔑', desc:'Identity-Based Encryption key management' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="card" style={{ marginBottom:'1.5rem',
        background:'linear-gradient(135deg,rgba(59,130,246,.1),rgba(139,92,246,.06))',
        borderColor:'rgba(59,130,246,.2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ fontSize:'3rem' }}>
            { {USER:'👤',CLOUD_ADMIN:'☁️',TPA:'🛡️',SANITIZER:'🧹',PKG_ADMIN:'🔑'}[user?.role] || '👤' }
          </div>
          <div>
            <h1 style={{ fontSize:'1.3rem', fontWeight:700 }}>Welcome, {user?.username}! 👋</h1>
            <p style={{ color:'var(--muted)', marginTop:4, fontSize:13 }}>
              Cloud Storage Security &amp; Auditing System
            </p>
            <span className={`badge ${
              user?.role==='TPA'?'badge-purple':user?.role==='SANITIZER'?'badge-amber':
              user?.role==='CLOUD_ADMIN'?'badge-green':user?.role==='PKG_ADMIN'?'badge-red':'badge-blue'
            }`} style={{ marginTop:6 }}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ fontSize:'1.4rem', marginBottom:6 }}>📁</div>
          <div className="stat-num" style={{ color:'#60a5fa' }}>{stats.files}</div>
          <div className="stat-label">My Files</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize:'1.4rem', marginBottom:6 }}>🛡️</div>
          <div className="stat-num" style={{ color:'#a78bfa' }}>{stats.audits}</div>
          <div className="stat-label">Audit Requests</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize:'1.4rem', marginBottom:6 }}>🔑</div>
          <div className="stat-num" style={{ color:'#34d399', fontSize:'1.1rem', paddingTop:4 }}>
            {stats.key ? '✓ Active' : '—'}
          </div>
          <div className="stat-label">Identity Key</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize:'1.4rem', marginBottom:6 }}>🔒</div>
          <div className="stat-num" style={{ color:'#fbbf24', fontSize:'1.1rem', paddingTop:4 }}>JWT</div>
          <div className="stat-label">Auth Method</div>
        </div>
      </div>

      {/* Quick actions */}
      <h3 style={{ fontWeight:600, marginBottom:'1rem', fontSize:14 }}>Quick Actions</h3>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:'2rem' }}>
        {actions.map(a => (
          <Link key={a.path} to={a.path} style={{ textDecoration:'none' }}>
            <div className="card" style={{ textAlign:'center', cursor:'pointer', padding:'1.2rem',
              transition:'transform .15s, border-color .15s', borderColor:'transparent' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor=a.color}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='transparent'}}>
              <div style={{ fontSize:'2rem', marginBottom:8 }}>{a.icon}</div>
              <div style={{ fontSize:12, fontWeight:500 }}>{a.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* System modules */}
      <div className="card">
        <div className="card-title">⚙️ System Modules</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12 }}>
          {modules.map(m => (
            <div key={m.name} style={{ padding:'12px', background:'var(--bg3)',
              borderRadius:8, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'1.3rem', marginBottom:6 }}>{m.icon}</div>
              <div style={{ fontWeight:600, fontSize:13 }}>{m.name}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
