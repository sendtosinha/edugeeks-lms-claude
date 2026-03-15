'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileText, Plus, Download, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-notes'],
    queryFn: () => api.get('/dashboard/notes').then(r => r.data),
  });

  const { mutate: saveNote, isPending } = useMutation({
    mutationFn: (note: any) => api.post('/dashboard/notes', note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-notes'] });
      setNewNote({ title: '', content: '' });
      setShowForm(false);
      toast.success('Note saved!');
    },
  });

  const notes = (data?.notes || []).filter((n: any) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">My Notes</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* New Note Form */}
      {showForm && (
        <div className="card p-5 border-2 border-brand-200 animate-slide-up">
          <h3 className="font-semibold text-slate-900 mb-4">Add Note</h3>
          <div className="space-y-3">
            <input
              value={newNote.title}
              onChange={e => setNewNote(n => ({ ...n, title: e.target.value }))}
              placeholder="Note title..."
              className="input"
            />
            <textarea
              value={newNote.content}
              onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))}
              placeholder="Write your note here..."
              rows={4}
              className="input resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => saveNote(newNote)}
                disabled={isPending || !newNote.title}
                className="btn-primary text-sm"
              >
                {isPending ? 'Saving...' : 'Save Note'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="input pl-9 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-xl text-slate-700 mb-2">No notes yet</h3>
          <p className="text-slate-400 mb-6">Create personal notes while watching lectures</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add First Note
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {notes.map((note: any) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note }: { note: any }) {
  return (
    <div className="card p-5 hover:shadow-card-hover transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-brand-600" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="btn-ghost p-1.5">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 text-sm mb-1.5">{note.title}</h3>
      {note.content && (
        <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">{note.content}</p>
      )}
      <p className="text-slate-400 text-xs mt-3">
        {new Date(note.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        })}
      </p>
    </div>
  );
}
