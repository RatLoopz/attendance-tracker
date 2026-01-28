import { supabase } from './supabase';

export interface DailyNote {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch daily notes for a specific date
 */
export async function getDailyNotes(userId: string, date: string) {
  try {
    // For now, we'll use attendance_records table's notes field
    // We'll fetch all records for the date and combine notes
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      console.error('Error fetching daily notes:', error);
      return { data: [], error };
    }

    // Combine all notes from different records into a single daily note
    const notes =
      data
        ?.filter((record) => record.notes && record.notes.trim())
        .map((record) => ({
          id: record.id,
          userId: record.user_id,
          date: record.date,
          content: record.notes,
          createdAt: record.created_at,
          updatedAt: record.updated_at,
        })) || [];

    return { data: notes, error: null };
  } catch (err) {
    console.error('Unexpected error fetching daily notes:', err);
    return { data: [], error: err };
  }
}

/**
 * Save or update a daily note
 * For now, we'll store it as a special attendance record with a marker subject ID
 */
export async function saveDailyNote(
  userId: string,
  date: string,
  content: string,
  noteId?: string
) {
  try {
    const dailyNoteSubjectId = 'DAILY_NOTE'; // Special marker for general daily notes

    if (noteId) {
      // Update existing note
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          notes: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating daily note:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } else {
      // Create new note
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          user_id: userId,
          subject_id: dailyNoteSubjectId,
          date: date,
          status: 'present', // Dummy status for notes
          notes: content,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating daily note:', error);
        return { data: null, error };
      }

      return { data, error: null };
    }
  } catch (err) {
    console.error('Unexpected error saving daily note:', err);
    return { data: null, error: err };
  }
}

/**
 * Delete a daily note
 */
export async function deleteDailyNote(userId: string, noteId: string) {
  try {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting daily note:', error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error deleting daily note:', err);
    return { error: err };
  }
}
