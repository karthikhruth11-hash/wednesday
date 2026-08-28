import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Mic,
  Brain,
  Folder,
  Globe,
  Settings,
  Sparkles,
  Check,
  X
} from 'lucide-react';

export default function Sidebar({
  groupedSessions,
  activeSessionId,
  searchQuery,
  onSearchChange,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onTogglePinSession,
  collapsed,
  onToggleCollapse,
  activeNav,
  onSelectNav
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Keyboard shortcut Ctrl+K for search focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('sidebar-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const renderSessionItem = (session) => {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingId;
    const isMenuOpen = session.id === menuOpenId;

    return (
      <div
        key={session.id}
        className={`session-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelectSession(session.id)}
      >
        <MessageSquare size={15} className="session-icon" />

        {isEditing ? (
          <div className="session-edit-box" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              className="session-edit-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveRename(session.id, e);
                if (e.key === 'Escape') handleCancelRename(e);
              }}
              autoFocus
            />
            <button className="edit-btn save" onClick={e => handleSaveRename(session.id, e)}><Check size={12} /></button>
            <button className="edit-btn cancel" onClick={handleCancelRename}><X size={12} /></button>
          </div>
        ) : (
          <span className="session-title-text" title={session.title}>{session.title}</span>
        )}

        {!isEditing && (
          <div className="session-actions" onClick={e => e.stopPropagation()}>
            {session.pinned && <Pin size={13} className="pinned-badge" />}

            <button
              className="session-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(isMenuOpen ? null : session.id);
              }}
            >
              <MoreVertical size={14} />
            </button>

            {isMenuOpen && (
              <div className="session-menu-dropdown">
                <button onClick={(e) => { e.stopPropagation(); onTogglePinSession(session.id); setMenuOpenId(null); }}>
                  <Pin size={13} /> {session.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button onClick={(e) => handleStartRename(session, e)}>
                  <Edit2 size={13} /> Rename
                </button>
                <button className="danger" onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); setMenuOpenId(null); }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`professional-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Sparkles size={18} className="logo-spark" />
          {!collapsed && <span className="brand-name">W.E.D.N.E.S.D.A.Y.</span>}
        </div>
        <button className="collapse-toggle-btn" onClick={onToggleCollapse} title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="sidebar-new-chat-container">
        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={18} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Search Input */}
      {!collapsed && (
        <div className="sidebar-search-box">
          <Search size={14} className="search-icon" />
          <input
            id="sidebar-search-input"
            type="text"
            placeholder="Search chats... (Ctrl+K)"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {/* Conversation Groups List */}
      {!collapsed && (
        <div className="sidebar-history-scroll">
          {/* Pinned Group */}
          {groupedSessions.pinned.length > 0 && (
            <div className="history-group">
              <div className="group-label"><Pin size={11} /> PINNED</div>
              {groupedSessions.pinned.map(renderSessionItem)}
            </div>
          )}

          {/* Today */}
          {groupedSessions.today.length > 0 && (
            <div className="history-group">
              <div className="group-label">TODAY</div>
              {groupedSessions.today.map(renderSessionItem)}
            </div>
          )}

          {/* Yesterday */}
          {groupedSessions.yesterday.length > 0 && (
            <div className="history-group">
              <div className="group-label">YESTERDAY</div>
              {groupedSessions.yesterday.map(renderSessionItem)}
            </div>
          )}

          {/* Past 7 Days */}
          {groupedSessions.past7Days.length > 0 && (
            <div className="history-group">
              <div className="group-label">PREVIOUS 7 DAYS</div>
              {groupedSessions.past7Days.map(renderSessionItem)}
            </div>
          )}

          {/* Older */}
          {groupedSessions.older.length > 0 && (
            <div className="history-group">
              <div className="group-label">OLDER</div>
              {groupedSessions.older.map(renderSessionItem)}
            </div>
          )}
        </div>
      )}

      {/* Bottom Tool Navigation */}
      <div className="sidebar-nav-footer">
        <button className={`nav-link-btn ${activeNav === 'chat' ? 'active' : ''}`} onClick={() => onSelectNav('chat')}>
          <MessageSquare size={16} /> {!collapsed && <span>AI Chat</span>}
        </button>
        <button className={`nav-link-btn ${activeNav === 'dashboard' ? 'active' : ''}`} onClick={() => onSelectNav('dashboard')}>
          <LayoutDashboard size={16} /> {!collapsed && <span>Dashboard</span>}
        </button>
        <button className={`nav-link-btn ${activeNav === 'voice' ? 'active' : ''}`} onClick={() => onSelectNav('voice')}>
          <Mic size={16} /> {!collapsed && <span>Voice Studio</span>}
        </button>
        <button className={`nav-link-btn ${activeNav === 'memory' ? 'active' : ''}`} onClick={() => onSelectNav('memory')}>
          <Brain size={16} /> {!collapsed && <span>Memory</span>}
        </button>
        <button className={`nav-link-btn ${activeNav === 'files' ? 'active' : ''}`} onClick={() => onSelectNav('files')}>
          <Folder size={16} /> {!collapsed && <span>Files</span>}
        </button>
        <button className={`nav-link-btn ${activeNav === 'browser' ? 'active' : ''}`} onClick={() => onSelectNav('browser')}>
          <Globe size={16} /> {!collapsed && <span>Browser</span>}
        </button>
        <button className={`nav-link-btn ${activeNav === 'settings' ? 'active' : ''}`} onClick={() => onSelectNav('settings')}>
          <Settings size={16} /> {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
