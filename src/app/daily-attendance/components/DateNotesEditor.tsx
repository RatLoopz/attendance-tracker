'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { getDailyNotes, saveDailyNote, deleteDailyNote } from '@/lib/dailyNotesService';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DateNotesEditorProps {
  selectedDate: Date;
}

const DateNotesEditor = ({ selectedDate }: DateNotesEditorProps) => {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!isHydrated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

        const { data, error } = await getDailyNotes(user.id, dateString);

        if (error) {
          console.error('Error fetching notes:', error);
          setNotes([]);
        } else {
          setNotes(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching notes:', err);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [isHydrated, selectedDate, user]);

  if (!isHydrated || isLoading) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border/50">
        <div className="h-64 bg-muted/50 rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-card rounded-lg p-4 shadow-elevation-2">
        <p className="text-muted-foreground text-center">Please log in to view notes</p>
      </div>
    );
  }

  const handleCreateNote = () => {
    setIsEditing(true);
    setEditingNoteId(null);
    setNoteContent('');
  };

  const handleEditNote = (note: Note) => {
    setIsEditing(true);
    setEditingNoteId(note.id);
    setNoteContent(note.content);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !user) return;

    try {
      setIsSaving(true);
      const dateString = selectedDate.toISOString().split('T')[0];

      const { data, error } = await saveDailyNote(
        user.id,
        dateString,
        noteContent.trim(),
        editingNoteId || undefined
      );

      if (error) {
        console.error('Error saving note:', error);
        alert('Failed to save note. Please try again.');
        return;
      }

      // Refresh notes after save
      const { data: updatedNotes, error: fetchError } = await getDailyNotes(user.id, dateString);
      if (!fetchError && updatedNotes) {
        setNotes(updatedNotes);
      }

      setIsEditing(false);
      setEditingNoteId(null);
      setNoteContent('');
    } catch (err) {
      console.error('Unexpected error saving note:', err);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?') || !user) return;

    try {
      const { error } = await deleteDailyNote(user.id, noteId);

      if (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
        return;
      }

      // Remove note from state
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error('Unexpected error deleting note:', err);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingNoteId(null);
    setNoteContent('');
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = noteContent.substring(start, end);
    const newText =
      noteContent.substring(0, start) + prefix + selectedText + suffix + noteContent.substring(end);

    setNoteContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <Icon name="DocumentTextIcon" size={20} className="text-primary" />
          Daily Notes
        </h3>

        {!isEditing && (
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-smooth hover:opacity-90"
          >
            <Icon name="PlusIcon" size={18} />
            <span className="text-sm font-medium">Add Note</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg flex-wrap">
            <button
              onClick={() => insertFormatting('**', '**')}
              className="p-2 rounded transition-smooth hover:bg-background"
              title="Bold"
            >
              <Icon name="BoldIcon" size={18} />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="p-2 rounded transition-smooth hover:bg-background"
              title="Italic"
            >
              <Icon name="ItalicIcon" size={18} />
            </button>
            <button
              onClick={() => insertFormatting('• ')}
              className="p-2 rounded transition-smooth hover:bg-background"
              title="Bullet point"
            >
              <Icon name="ListBulletIcon" size={18} />
            </button>
            <button
              onClick={() => insertFormatting('[', '](url)')}
              className="p-2 rounded transition-smooth hover:bg-background"
              title="Insert link"
            >
              <Icon name="LinkIcon" size={18} />
            </button>
          </div>

          <textarea
            id="note-textarea"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your notes here...\n\nYou can use:\n• Bullet points\n• **Bold text**\n• *Italic text*\n• [Links](url)"
            className="w-full min-h-[300px] p-4 bg-background border border-border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSaveNote}
              disabled={isSaving || !noteContent.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-smooth hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="CheckIcon" size={18} />
              <span className="text-sm font-medium">{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg transition-smooth hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="XMarkIcon" size={18} />
              <span className="text-sm font-medium">Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                name="DocumentTextIcon"
                size={48}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="text-muted-foreground mb-4">No notes for this date yet</p>
              <button
                onClick={handleCreateNote}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-smooth hover:opacity-90"
              >
                <Icon name="PlusIcon" size={18} />
                <span className="text-sm font-medium">Create First Note</span>
              </button>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-muted/50 rounded-lg p-4 transition-smooth hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="caption text-muted-foreground">
                    Last updated: {formatDate(note.updatedAt)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1 text-primary hover:bg-primary/10 rounded transition-smooth"
                      title="Edit note"
                    >
                      <Icon name="PencilIcon" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-error hover:bg-error/10 rounded transition-smooth"
                      title="Delete note"
                    >
                      <Icon name="TrashIcon" size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-foreground whitespace-pre-wrap break-words">
                  {note.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DateNotesEditor;
