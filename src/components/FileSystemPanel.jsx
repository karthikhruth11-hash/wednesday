import React, { useState, useEffect } from 'react';
import { Folder, FileText, Monitor, AppWindow, ExternalLink, RefreshCw } from 'lucide-react';
import { systemApi } from '../services/systemApi';
import { soundFx } from '../services/soundFx';

export default function FileSystemPanel() {
  const [currentDir, setCurrentDir] = useState('desktop');
  const [files, setFiles] = useState([]);
  const [dirPath, setDirPath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [launchMessage, setLaunchMessage] = useState('');

  const fetchFiles = async (path = currentDir) => {
    setLoading(true);
    const res = await systemApi.listFiles(path);
    if (res.success) {
      setFiles(res.files);
      setDirPath(res.dirPath);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles(currentDir);
  }, [currentDir]);

  const handleLaunch = async (appName) => {
    soundFx.playClick();
    setLaunchMessage(`Launching ${appName}...`);
    const res = await systemApi.launchApp(appName);
    if (res.success) {
      setLaunchMessage(`Opened ${appName} on Desktop!`);
    } else {
      setLaunchMessage(`Error: ${res.error}`);
    }
    setTimeout(() => setLaunchMessage(''), 4000);
  };

  const handleOpenFile = async (file) => {
    soundFx.playClick();
    if (file.isDirectory) {
      setCurrentDir(file.path);
    } else {
      setSelectedFile(file);
      const res = await systemApi.readFile(file.path);
      if (res.success) {
        setFileContent(res.content);
      } else {
        setFileContent(`[Unable to preview file: ${res.error}]`);
      }
    }
  };

  const handleNativeOpen = async (filePath) => {
    soundFx.playClick();
    await systemApi.openFile(filePath);
  };

  return (
    <div className="hud-card" style={{ flex: 1 }}>
      <div className="hud-card-header">
        <span className="hud-card-title">
          <Monitor size={16} /> Desktop Controller & Files
        </span>
        <button
          className="btn-hud"
          onClick={() => { soundFx.playClick(); fetchFiles(currentDir); }}
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
        >
          <RefreshCw size={12} /> Sync
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minHeight: 0 }}>
        {/* Quick Windows App Launcher */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Orbitron', marginBottom: '0.4rem' }}>
            LAUNCH DESKTOP APPS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            <button className="btn-hud" onClick={() => handleLaunch('notepad')} style={{ fontSize: '0.7rem', padding: '0.4rem', justifyContent: 'center' }}>
              <AppWindow size={14} /> Notepad
            </button>
            <button className="btn-hud" onClick={() => handleLaunch('calculator')} style={{ fontSize: '0.7rem', padding: '0.4rem', justifyContent: 'center' }}>
              <AppWindow size={14} /> Calc
            </button>
            <button className="btn-hud" onClick={() => handleLaunch('explorer')} style={{ fontSize: '0.7rem', padding: '0.4rem', justifyContent: 'center' }}>
              <Folder size={14} /> Explorer
            </button>
            <button className="btn-hud" onClick={() => handleLaunch('cmd')} style={{ fontSize: '0.7rem', padding: '0.4rem', justifyContent: 'center' }}>
              <Monitor size={14} /> Terminal
            </button>
          </div>
          {launchMessage && (
            <div style={{ fontSize: '0.75rem', color: 'var(--green-online)', marginTop: '0.3rem', fontFamily: 'Orbitron' }}>
              {launchMessage}
            </div>
          )}
        </div>

        {/* Directory Path Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className={`btn-hud ${currentDir === 'desktop' ? 'active' : ''}`} onClick={() => setCurrentDir('desktop')} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>
              Desktop
            </button>
            <button className={`btn-hud ${currentDir === 'documents' ? 'active' : ''}`} onClick={() => setCurrentDir('documents')} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>
              Documents
            </button>
          </div>
          {dirPath && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {dirPath}
            </span>
          )}
        </div>

        {/* File Browser Grid */}
        <div className="messages-list" style={{ flex: 1, border: '1px solid var(--border-hud)', padding: '0.5rem', borderRadius: '6px', background: 'rgba(3,6,13,0.6)' }}>
          {loading ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1rem' }}>
              Reading system storage...
            </div>
          ) : files.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1rem' }}>
              Directory empty.
            </div>
          ) : (
            files.map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.8rem',
                  borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
                  borderRadius: '4px',
                  background: 'rgba(0,240,255,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }} onClick={() => handleOpenFile(file)}>
                  {file.isDirectory ? <Folder size={14} color="#00f0ff" /> : <FileText size={14} color="#a855f7" />}
                  <span style={{ color: file.isDirectory ? '#00f0ff' : '#e2e8f0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {file.name}
                  </span>
                </div>
                {!file.isDirectory && (
                  <button
                    className="btn-hud"
                    onClick={() => handleNativeOpen(file.path)}
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem' }}
                    title="Open natively in Windows"
                  >
                    <ExternalLink size={10} /> Open
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* File Previewer */}
        {selectedFile && (
          <div style={{ padding: '0.5rem', background: '#03060d', border: '1px solid var(--border-hud)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--cyan-bright)', marginBottom: '0.3rem', fontFamily: 'Orbitron' }}>
              <span>Preview: {selectedFile.name}</span>
              <button style={{ background: 'none', border: 'none', color: '#ff0055', cursor: 'pointer' }} onClick={() => setSelectedFile(null)}>✕</button>
            </div>
            <pre className="code-output" style={{ maxHeight: '100px', fontSize: '0.75rem' }}>
              {fileContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
