import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import {
  Plus, FileText, Save, Users, Loader, ArrowLeft,
  Search, Tag, Clock, Trash2, Share2, Hash, Bold,
  Italic, AlignLeft, MoreVertical, Star, StarOff
} from 'lucide-react';

const NOTE_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Purple', value: 'rgba(139,92,246,0.07)' },
  { label: 'Blue', value: 'rgba(59,130,246,0.07)' },
  { label: 'Green', value: 'rgba(16,185,129,0.07)' },
  { label: 'Orange', value: 'rgba(245,158,11,0.07)' },
];

const EmptyState = ({ onNew }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
    <div style={{
      width: 96, height: 96, borderRadius: '50%',
      background: 'var(--bg-secondary)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', marginBottom: 24
    }}>
      <FileText size={44} style={{ color: 'var(--text-muted)' }} />
    </div>
    <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No note selected</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, maxWidth: 300 }}>
      Select a note from the sidebar or create a new one to start writing.
    </p>
    <button onClick={onNew} style={{
      background: 'var(--accent-gradient)', color: '#fff',
      padding: '11px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14,
      cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8
    }}>
      <Plus size={18} /> Create New Note
    </button>
  </div>
);

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [starredOnly, setStarredOnly] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [starred, setStarred] = useState(false);

  const textareaRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => { fetchNotes(); }, []);

  useEffect(() => {
    if (!selectedNote) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      handleSaveNote(true);
    }, 2000);
    return () => clearTimeout(autoSaveRef.current);
  }, [editTitle, editContent]);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data.data || []);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const res = await api.post('/notes', { title: 'Untitled Note', content: '' });
      const newNote = res.data.data;
      setNotes([newNote, ...notes]);
      openNote(newNote);
    } catch {
      toast.error('Failed to create note');
    }
  };

  const handleSaveNote = async (silent = false) => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      await api.put(`/notes/${selectedNote._id}`, { title: editTitle, content: editContent });
      if (!silent) toast.success('Saved!');
      fetchNotes();
    } catch {
      if (!silent) toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const openNote = (note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setStarred(note.starred || false);
    setEditTags((note.tags || []).join(', '));
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
    const matchesStarred = !starredOnly || n.starred;
    return matchesSearch && matchesStarred;
  });

  const wordCount = editContent.trim() ? editContent.trim().split(/\s+/).length : 0;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader size={36} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading notes...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>

      {/* Sidebar Panel */}
      <div style={{
        width: selectedNote ? 280 : '100%',
        maxWidth: selectedNote ? 280 : '100%',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-card)',
        transition: 'all 0.3s ease',
        flexShrink: 0
      }}
        className="notes-sidebar"
      >
        {/* Sidebar Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18 }}>📝 My Notes</h2>
            <button onClick={handleCreateNote} style={{
              width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
              background: 'var(--accent-gradient)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
            }}>
              <Plus size={18} />
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="input-field"
              style={{ paddingLeft: 36, fontSize: 13, padding: '8px 8px 8px 34px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => setStarredOnly(false)} style={{
              flex: 1, padding: '6px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: !starredOnly ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: !starredOnly ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${!starredOnly ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.2s'
            }}>All Notes</button>
            <button onClick={() => setStarredOnly(true)} style={{
              flex: 1, padding: '6px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: starredOnly ? 'rgba(245,158,11,0.1)' : 'transparent',
              color: starredOnly ? '#f59e0b' : 'var(--text-muted)',
              border: `1px solid ${starredOnly ? '#f59e0b' : 'var(--border)'}`,
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
            }}><Star size={11} /> Starred</button>
          </div>
        </div>

        {/* Notes List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredNotes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>{search ? 'No notes match your search' : 'No notes yet. Create one!'}</p>
            </div>
          )}
          {filteredNotes.map(note => (
            <button
              key={note._id}
              onClick={() => openNote(note)}
              style={{
                width: '100%', padding: '14px 16px', textAlign: 'left',
                background: selectedNote?._id === note._id ? 'rgba(99,102,241,0.07)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.2s', display: 'block',
                border: 'none', borderBottom: '1px solid var(--border)',
                borderLeft: selectedNote?._id === note._id ? '3px solid var(--accent)' : '3px solid transparent',

              }}
              onMouseEnter={e => { if (selectedNote?._id !== note._id) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => { if (selectedNote?._id !== note._id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <FileText size={15} style={{ color: selectedNote?._id === note._id ? 'var(--accent)' : 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3, color: selectedNote?._id === note._id ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {note.title}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                    {note.content?.slice(0, 60) || 'Empty note'}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={9} /> {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div style={{
              padding: '12px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-card)', flexWrap: 'wrap', gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <button onClick={() => setSelectedNote(null)} style={{
                  width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', flexShrink: 0
                }}>
                  <ArrowLeft size={16} />
                </button>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', fontSize: 18,
                    fontWeight: 700, outline: 'none', padding: '4px 0',
                    color: 'var(--text-primary)', flex: 1, minWidth: 0,
                    borderBottom: '2px solid transparent', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderBottomColor = 'transparent'}
                  placeholder="Note title..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {saving && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving...
                  </span>
                )}
                <button title="Share" style={{
                  width: 34, height: 34, borderRadius: 9, background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
                }}><Share2 size={15} /></button>
                <button
                  onClick={() => handleSaveNote()}
                  style={{
                    background: 'var(--accent-gradient)', color: '#fff',
                    border: 'none', borderRadius: 10, padding: '8px 18px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <Save size={14} /> Save
                </button>
              </div>
            </div>

            {/* Tags Bar */}
            <div style={{ padding: '8px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Hash size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                value={editTags}
                onChange={e => setEditTags(e.target.value)}
                placeholder="Add tags (comma-separated)..."
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 12, color: 'var(--text-secondary)', width: '100%'
                }}
              />
            </div>

            {/* Text Area */}
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              placeholder="Start writing your notes here...

You can write anything:
• Lecture notes
• Ideas and thoughts
• Study summaries
• Research findings"
              style={{
                flex: 1, padding: '32px', background: 'transparent',
                border: 'none', outline: 'none', resize: 'none',
                fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)',
                fontFamily: "'Inter', system-ui, sans-serif"
              }}
            />

            {/* Status Bar */}
            <div style={{
              padding: '8px 24px', borderTop: '1px solid var(--border)',
              background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                <span>{wordCount} words</span>
                <span>{editContent.length} characters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <Clock size={10} />
                Last saved {new Date(selectedNote.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          </>
        ) : (
          <EmptyState onNew={handleCreateNote} />
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .notes-sidebar {
            position: fixed !important;
            left: 0; top: 72px; bottom: 0; z-index: 50;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
