import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'', role:'USER' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.username || !form.email || !form.password) { setError('Fill all fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setBusy(true);
    try {
      const { confirm, ...payload } = form;
      const res = await register(payload);
      if (res.message && res.message.includes('successfully')) {
        setSuccess('Account created! PKG identity key generated. Redirecting…');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch { setError('Connection error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize:'2rem', marginBottom:8 }}>🔑</div>
          <h2>Create Account</h2>
          <p>Identity key generated automatically by PKG</p>
        </div>

        {error   && <div className="alert alert-red">{error}</div>}
        {success && <div className="alert alert-green">{success}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Choose username" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Your email" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="USER">👤 User – upload &amp; share files</option>
              <option value="CLOUD_ADMIN">☁️ Cloud Admin – manage all files</option>
              <option value="TPA">🛡️ Third Party Auditor (TPA)</option>
              <option value="SANITIZER">🧹 Sanitizer – redact sensitive data</option>
              <option value="PKG_ADMIN">🔑 PKG Admin – key management</option>
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Create password" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
            {busy ? <><span className="spinner" /> Creating…</> : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
