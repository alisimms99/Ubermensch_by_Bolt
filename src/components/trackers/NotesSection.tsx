import React, { useState } from 'react';
import { Note } from '../../types';
import { Plus, Download } from 'lucide-react';

export const NotesSection: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Need to research new protein supplement options - current one causing mild digestive discomfort.',
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      content: 'Schedule appointment with nutritionist to discuss meal plan optimization for muscle recovery.',
      createdAt: '2025-01-16T14:45:00Z'
    }
  ]);
  
  const [newNote, setNewNote] = useState('');
  
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date().toISOString()
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  const handleExportNotes = () => {
    const notesContent = notes.map(note => 
      `[${new Date(note.createdAt).toLocaleString()}]\n${note.content}\n\n`
    ).join('---\n\n');
    
    const blob = new Blob([notesContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'health_notes.txt');
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">General Notes</h2>
        <button
          onClick={handleExportNotes}
          className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Notes</span>
        </button>
      </div>
      
      <div className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note, observation, or reminder..."
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              newNote.trim()
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Delete
                </button>
              </div>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No notes yet. Add your first note above.</p>
        )}
      </div>
    </div>
  );
};