import React, { useState, useEffect } from 'react';
import { WorkoutPlan } from '../../types';
import { Table } from '../ui/Table';
import { Plus, Download, Upload, Calendar, Clock, Activity } from 'lucide-react';
import { format, addDays, isAfter, isBefore, startOfToday } from 'date-fns';

export const WorkoutPlansManager: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>(() => {
    const saved = localStorage.getItem('ubermensch_workouts');
    return saved ? JSON.parse(saved) : [
      { 
        id: '1',
        name: 'Upper Body Power',
        type: 'Strength',
        assignedDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        duration: '60',
        intensity: 'High',
        completed: false,
        notes: 'Focus on progressive overload for chest and back'
      },
      {
        id: '2',
        name: 'Lower Body Hypertrophy',
        type: 'Hypertrophy',
        assignedDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        duration: '75',
        intensity: 'Medium',
        completed: false,
        notes: 'High volume leg workout with moderate weights'
      }
    ];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    name: '',
    type: '',
    assignedDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    duration: '',
    intensity: 'Medium',
    completed: false,
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('ubermensch_workouts', JSON.stringify(workouts));
  }, [workouts]);

  const workoutTypes = [
    'Strength',
    'Hypertrophy',
    'Endurance',
    'HIIT',
    'Recovery',
    'Mobility',
    'Cardio',
    'CrossFit',
    'Calisthenics'
  ];
  
  const handleAddWorkout = () => {
    if (!newWorkout.name || !newWorkout.assignedDate) return;
    
    const workout: WorkoutPlan = {
      id: Date.now().toString(),
      name: newWorkout.name,
      type: newWorkout.type || 'Strength',
      assignedDate: newWorkout.assignedDate,
      duration: newWorkout.duration || '60',
      intensity: newWorkout.intensity || 'Medium',
      completed: false,
      notes: newWorkout.notes || ''
    };
    
    setWorkouts([...workouts, workout]);
    setNewWorkout({
      name: '',
      type: '',
      assignedDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      duration: '',
      intensity: 'Medium',
      completed: false,
      notes: ''
    });
    setShowForm(false);
  };

  const handleToggleComplete = (id: string) => {
    setWorkouts(prev => prev.map(workout =>
      workout.id === id ? { ...workout, completed: !workout.completed } : workout
    ));
  };

  const handleDeleteWorkout = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      setWorkouts(prev => prev.filter(workout => workout.id !== id));
    }
  };
  
  const handleExportCsv = () => {
    const headers = ['Name', 'Type', 'Assigned Date', 'Duration (mins)', 'Intensity', 'Completed', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...workouts.map(workout => 
        [
          workout.name,
          workout.type,
          workout.assignedDate,
          workout.duration,
          workout.intensity,
          workout.completed ? 'Yes' : 'No',
          workout.notes
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'workout_plans.csv');
    link.click();
  };

  const handleImportWorkouts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const newWorkouts: WorkoutPlan[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(val => 
            val.trim().replace(/^"|"$/g, '')
          );
          
          if (values.length >= 7) {
            newWorkouts.push({
              id: Date.now() + i.toString(),
              name: values[0],
              type: values[1],
              assignedDate: values[2],
              duration: values[3],
              intensity: values[4] as 'Low' | 'Medium' | 'High',
              completed: values[5].toLowerCase() === 'yes',
              notes: values[6]
            });
          }
        }
        
        if (newWorkouts.length > 0) {
          setWorkouts(prev => [...prev, ...newWorkouts]);
          alert(`Successfully imported ${newWorkouts.length} workout plans`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error importing workouts. Please check the CSV format.');
      }
    };
    
    reader.readAsText(file);
  };

  const getStatusColor = (workout: WorkoutPlan) => {
    const today = startOfToday();
    const workoutDate = new Date(workout.assignedDate);

    if (workout.completed) return 'bg-green-100 text-green-800';
    if (isBefore(workoutDate, today)) return 'bg-red-100 text-red-800';
    if (format(workoutDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };
  
  const columns = [
    { header: 'Name', accessor: 'name' },
    {
      header: 'Type',
      accessor: 'type',
      render: (type: string) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
          {type}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'assignedDate',
      render: (date: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{format(new Date(date), 'MMM d, yyyy')}</span>
        </div>
      )
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (duration: string) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>{duration} mins</span>
        </div>
      )
    },
    {
      header: 'Intensity',
      accessor: 'intensity',
      render: (intensity: 'Low' | 'Medium' | 'High') => (
        <div className="flex items-center space-x-1">
          <Activity className="h-4 w-4 text-gray-500" />
          <span className={`px-2 py-1 rounded-full text-sm ${
            intensity === 'High' ? 'bg-red-100 text-red-800' :
            intensity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {intensity}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'completed',
      render: (_: boolean, workout: WorkoutPlan) => (
        <button
          onClick={() => handleToggleComplete(workout.id)}
          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(workout)}`}
        >
          {workout.completed ? 'Completed' : 'Pending'}
        </button>
      )
    },
    { header: 'Notes', accessor: 'notes' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_: any, workout: WorkoutPlan) => (
        <button
          onClick={() => handleDeleteWorkout(workout.id)}
          className="text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Workout Plans Manager</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Workout</span>
          </button>
          
          <input
            type="file"
            id="import-workouts"
            accept=".csv"
            className="hidden"
            onChange={handleImportWorkouts}
          />
          
          <label
            htmlFor="import-workouts"
            className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </label>
          
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-md font-medium text-gray-700 mb-4">Add New Workout Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newWorkout.name}
                onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                placeholder="e.g., Upper Body Power"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={newWorkout.type}
                onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              >
                <option value="">Select type</option>
                {workoutTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={newWorkout.assignedDate}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setNewWorkout({ ...newWorkout, assignedDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                value={newWorkout.duration}
                onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Intensity</label>
              <select
                value={newWorkout.intensity}
                onChange={(e) => setNewWorkout({ ...newWorkout, intensity: e.target.value as 'Low' | 'Medium' | 'High' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={newWorkout.notes}
                onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                placeholder="Add any notes or instructions for this workout..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWorkout}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      <Table columns={columns} data={workouts} />
    </div>
  );
};