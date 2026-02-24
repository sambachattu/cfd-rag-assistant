import { useState, useRef, useEffect } from 'react';
import { uploadAPI, chatAPI } from '../services/api';

export default function FilePanel() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef();

  const fetchFiles = async () => {
    try {
      const { data } = await chatAPI.listFiles();
      setFiles(data.files || []);
    } catch {}
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await uploadAPI.uploadFile(file, setProgress);
      setSuccess(`"${file.name}" uploaded and indexing started!`);
      setTimeout(fetchFiles, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      inputRef.current.value = '';
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm(`Delete "${filename}" from index?`)) return;
    try {
      await uploadAPI.deleteFile(filename);
      fetchFiles();
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed');
    }
  };

  const styles = {
    panel: { background: '#111827', borderRight: '1px solid #1f2937', width: 280, display: 'flex', flexDirection: 'column', padding: 16, gap: 12, overflow: 'hidden' },
    title: { color: '#60a5fa', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' },
    uploadBtn: { background: uploading ? '#374151' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: uploading ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
    progressBar: { background: '#1f2937', borderRadius: 4, height: 6, overflow: 'hidden' },
    progressFill: { background: '#2563eb', height: '100%', transition: 'width 0.2s', width: `${progress}%` },
    fileList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 },
    fileItem: { background: '#1f2937', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    fileName: { color: '#d1d5db', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
    delBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0 },
    msg: (ok) => ({ fontSize: 12, color: ok ? '#34d399' : '#f87171', padding: '6px 10px', borderRadius: 6, background: ok ? '#064e3b22' : '#7f1d1d22' }),
    empty: { color: '#4b5563', fontSize: 12, textAlign: 'center', marginTop: 12 },
    label: { color: '#9ca3af', fontSize: 11, marginBottom: 4 }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.title}>📁 CFD Log Files</div>
      <div>
        <div style={styles.label}>Upload simulation files (.log, .txt, .dat, .out)</div>
        <button style={styles.uploadBtn} onClick={() => inputRef.current.click()} disabled={uploading}>
          {uploading ? `Uploading… ${progress}%` : '+ Upload File'}
        </button>
        <input ref={inputRef} type="file" accept=".log,.txt,.csv,.dat,.out,.res" style={{ display: 'none' }} onChange={handleUpload} />
      </div>
      {uploading && <div style={styles.progressBar}><div style={styles.progressFill} /></div>}
      {success && <div style={styles.msg(true)}>{success}</div>}
      {error && <div style={styles.msg(false)}>{error}</div>}
      <div style={styles.label}>Indexed Files ({files.length})</div>
      <div style={styles.fileList}>
        {files.length === 0 && <div style={styles.empty}>No files indexed yet.<br/>Upload a CFD log file to start.</div>}
        {files.map((f) => (
          <div key={f.source} style={styles.fileItem}>
            <span style={styles.fileName} title={f.source}>{f.source}</span>
            <button style={styles.delBtn} onClick={() => handleDelete(f.source)} title="Remove">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
