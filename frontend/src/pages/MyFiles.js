import React, { useEffect, useState, useRef } from 'react';
import { getMyFiles, uploadFile, deleteFile, downloadFile, downloadSanitized } from '../api';

const STATUS_BADGE = {
  UPLOADED:'badge-blue', SANITIZED:'badge-green', AUDIT_PENDING:'badge-amber',
  AUDIT_VERIFIED:'badge-green', AUDIT_FAILED:'badge-red', SHARED:'badge-purple'
};

function fmtBytes(b) {
  if (!b) return '—';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(2) + ' MB';
}

export default function MyFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const ref = useRef();

  const load = () => {
    setLoading(true);
    getMyFiles().then(data => { if (Array.isArray(data)) setFiles(data); }).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const showMsg = (text, type='green') => { setMsg({text,type}); setTimeout(()=>setMsg(null), 3000); };

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    setUploading(true);
    try {
      const res = await uploadFile(fd);
      if (res.id) { showMsg(`✅ "${file.name}" uploaded!`); load(); }
      else showMsg(res.message || 'Upload failed', 'red');
    } catch { showMsg('Upload failed', 'red'); }
    finally { setUploading(false); ref.current.value = ''; }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteFile(id);
    showMsg('File deleted');
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1>📁 My Files</h1>
        <p>Upload, download, and manage your cloud files</p>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Upload zone */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ border:'2px dashed var(--border)', borderRadius:10, padding:'2.5rem',
          textAlign:'center', cursor:'pointer', transition:'border-color .15s' }}
          onClick={()=>ref.current.click()}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer.files[0];
            if(f){const dt=new DataTransfer();dt.items.add(f);ref.current.files=dt.files;handleUpload({target:ref.current});} }}>
          <div style={{ fontSize:'2.5rem', marginBottom:10 }}>📤</div>
          <div style={{ fontWeight:600, marginBottom:4 }}>
            {uploading ? 'Uploading…' : 'Click or drag file here to upload'}
          </div>
          <div style={{ fontSize:12, color:'var(--muted)' }}>Any file type · Max 50 MB</div>
          {uploading && <div style={{ marginTop:12 }}><span className="spinner" /></div>}
        </div>
        <input ref={ref} type="file" hidden onChange={handleUpload} />
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-title">📂 Uploaded Files ({files.length})</div>
        {loading ? (
          <div className="empty"><span className="spinner" /></div>
        ) : files.length === 0 ? (
          <div className="empty"><div className="empty-icon">📭</div><p>No files yet. Upload above!</p></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>File Name</th><th>Size</th><th>Status</th>
                  <th>Sanitized</th><th>SHA-256 Hash</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight:500 }}>📄 {f.originalName}</div>
                      <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>
                        {f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td>{fmtBytes(f.fileSize)}</td>
                    <td><span className={`badge ${STATUS_BADGE[f.status]||'badge-gray'}`}>{f.status}</span></td>
                    <td>
                      {f.isSanitized
                        ? <span className="badge badge-green">✓ Yes</span>
                        : <span className="badge badge-gray">No</span>}
                    </td>
                    <td>
                      <span className="mono" style={{ color:'var(--muted)' }}>
                        {f.fileHash ? f.fileHash.substring(0,16)+'…' : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="flex-gap">
                        <button className="btn btn-primary btn-sm"
                          onClick={()=>downloadFile(f.id, f.originalName)}>⬇ Get</button>
                        {f.isSanitized && (
                          <button className="btn btn-green btn-sm"
                            onClick={()=>downloadSanitized(f.id, f.originalName)}>🧹 Sanitized</button>
                        )}
                        <button className="btn btn-red btn-sm"
                          onClick={()=>handleDelete(f.id, f.originalName)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
