import React, { useState, useEffect } from 'react';
import { DailyLog, Supplement, WorkoutPlan } from '../../types';
import { Mic, ArrowRight, Plus, Minus, Droplet } from 'lucide-react';
import { format } from 'date-fns';

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(time);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

export const TodayPanel: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];

  const [dailyLog, setDailyLog] = useState<DailyLog>({
    id: Date.now().toString(),
    date: today,
    wakeTime: '07:00',
    sleepTime: '22:00',
    weight: '',
    mood: {
      score: 5,
      tags: []
    },
    energyLevel: 5,
    sexualEnergy: 'Normal',
    stoolQuality: 'Solid',
    bowelMovements: 0,
    cramps: {
      severity: 'None',
      location: ''
    },
    supplementsTaken: [],
    meals: [],
    smoothie: {
      had: false,
      ingredients: ''
    },
    hydration: 0,
    workoutCompleted: '',
    notes: ''
  });

  const [supplements] = useState<Supplement[]>(() => {
    const saved = localStorage.getItem('ubermensch_supplements');
    return saved ? JSON.parse(saved) : [];
  });

  const [workouts] = useState<WorkoutPlan[]>(() => {
    const saved = localStorage.getItem('ubermensch_workouts');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('ubermensch_daily_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [showMealForm, setShowMealForm] = useState(false);
  const [newMeal, setNewMeal] = useState({ description: '', calories: '', time: '' });
  const [chatMessage, setChatMessage] = useState('');

  const moodTags = ['Calm', 'Anxious', 'Focused', 'Tired', 'Energetic', 'Happy', 'Sad', 'Stressed'];

  useEffect(() => {
    const existingLog = logs.find(log => log.date === today);
    if (existingLog) {
      setDailyLog(existingLog);
    }
  }, [logs, today]);

  const handleSave = () => {
    const updatedLogs = logs.some(log => log.date === today)
      ? logs.map(log => log.date === today ? { ...dailyLog, id: log.id } : log)
      : [...logs, dailyLog];
    
    setLogs(updatedLogs);
    localStorage.setItem('ubermensch_daily_logs', JSON.stringify(updatedLogs));
    alert('Daily log saved!');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDailyLog(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMoodTagToggle = (tag: string) => {
    setDailyLog(prev => ({
      ...prev,
      mood: {
        ...prev.mood!,
        tags: prev.mood?.tags.includes(tag)
          ? prev.mood.tags.filter(t => t !== tag)
          : [...(prev.mood?.tags || []), tag]
      }
    }));
  };

  const handleSupplementToggle = (supplementId: string) => {
    setDailyLog(prev => ({
      ...prev,
      supplementsTaken: prev.supplementsTaken?.includes(supplementId)
        ? prev.supplementsTaken.filter(id => id !== supplementId)
        : [...(prev.supplementsTaken || []), supplementId]
    }));
  };

  const handleAddMeal = () => {
    if (!newMeal.description) return;
    
    setDailyLog(prev => ({
      ...prev,
      meals: [
        ...(prev.meals || []),
        {
          description: newMeal.description,
          calories: newMeal.calories ? parseInt(newMeal.calories) : undefined,
          time: newMeal.time || format(new Date(), 'HH:mm')
        }
      ]
    }));
    
    setNewMeal({ description: '', calories: '', time: '' });
    setShowMealForm(false);
  };

  const handleHydrationChange = (change: number) => {
    setDailyLog(prev => ({
      ...prev,
      hydration: Math.max(0, (prev.hydration || 0) + change)
    }));
  };

  const handleVoiceInput = () => {
    window.open('https://chatgpt.com/g/g-67b295f6e68c81918ddfa5e5a9884af0-holistic-health-fitness-ai', '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Today's Tracker</h2>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wake Time</label>
              <select
                name="wakeTime"
                value={dailyLog.wakeTime}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              >
                {timeOptions.map(time => (
                  <option key={`wake-${time}`} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Time</label>
              <select
                name="sleepTime"
                value={dailyLog.sleepTime}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              >
                {timeOptions.map(time => (
                  <option key={`sleep-${time}`} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Optional)</label>
            <input
              type="text"
              name="weight"
              value={dailyLog.weight}
              onChange={handleInputChange}
              placeholder="e.g., 185 lbs"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mood Score (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={dailyLog.mood?.score || 5}
              onChange={(e) => setDailyLog(prev => ({
                ...prev,
                mood: { ...prev.mood!, score: parseInt(e.target.value) }
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {moodTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleMoodTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    dailyLog.mood?.tags.includes(tag)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Energy Level (1-10): {dailyLog.energyLevel}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              name="energyLevel"
              value={dailyLog.energyLevel}
              onChange={(e) => setDailyLog(prev => ({
                ...prev,
                energyLevel: parseInt(e.target.value)
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexual Energy</label>
            <select
              name="sexualEnergy"
              value={dailyLog.sexualEnergy}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stool Quality</label>
            <select
              name="stoolQuality"
              value={dailyLog.stoolQuality}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            >
              <option value="Solid">Solid</option>
              <option value="Soft">Soft</option>
              <option value="Loose">Loose</option>
              <option value="Liquid">Liquid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bowel Movements</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDailyLog(prev => ({
                  ...prev,
                  bowelMovements: Math.max(0, (prev.bowelMovements || 0) - 1)
                }))}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-medium w-8 text-center">
                {dailyLog.bowelMovements || 0}
              </span>
              <button
                onClick={() => setDailyLog(prev => ({
                  ...prev,
                  bowelMovements: (prev.bowelMovements || 0) + 1
                }))}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cramps</label>
            <select
              name="cramps.severity"
              value={dailyLog.cramps?.severity}
              onChange={(e) => setDailyLog(prev => ({
                ...prev,
                cramps: { ...prev.cramps!, severity: e.target.value as any }
              }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            >
              <option value="None">None</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
            {dailyLog.cramps?.severity !== 'None' && (
              <input
                type="text"
                placeholder="Location (e.g., Lower abdomen)"
                value={dailyLog.cramps?.location}
                onChange={(e) => setDailyLog(prev => ({
                  ...prev,
                  cramps: { ...prev.cramps!, location: e.target.value }
                }))}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hydration (oz): {dailyLog.hydration}
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleHydrationChange(-8)}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${Math.min(100, (dailyLog.hydration || 0) / 100 * 100)}%` }}
                />
              </div>
              <button
                onClick={() => handleHydrationChange(8)}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-center mt-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500 ml-1">Target: 100 oz</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-700 mb-4">Supplements Taken Today</h3>
        {supplements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {supplements.map(supplement => (
              <div
                key={supplement.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  dailyLog.supplementsTaken?.includes(supplement.id)
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-white border-2 border-gray-200 hover:border-purple-500'
                }`}
                onClick={() => handleSupplementToggle(supplement.id)}
              >
                <input
                  type="checkbox"
                  checked={dailyLog.supplementsTaken?.includes(supplement.id)}
                  onChange={() => handleSupplementToggle(supplement.id)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{supplement.name}</p>
                  <p className="text-xs text-gray-500">{supplement.timing}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No supplements added yet. Add supplements in the Supplements tab.
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium text-gray-700">Meals</h3>
          <button
            onClick={() => setShowMealForm(true)}
            className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Meal</span>
          </button>
        </div>

        {showMealForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Meal description"
                  value={newMeal.description}
                  onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Calories (optional)"
                  value={newMeal.calories}
                  onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => setShowMealForm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMeal}
                className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {dailyLog.meals?.map((meal, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span>{meal.description}</span>
              {meal.calories && <span className="text-sm text-gray-500">{meal.calories} cal</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={dailyLog.smoothie?.had}
            onChange={(e) => setDailyLog(prev => ({
              ...prev,
              smoothie: {
                had: e.target.checked,
                ingredients: e.target.checked ? prev.smoothie?.ingredients || '' : ''
              }
            }))}
            className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
          />
          <label className="text-sm font-medium text-gray-700">Had a smoothie today</label>
        </div>
        {dailyLog.smoothie?.had && (
          <textarea
            placeholder="Smoothie ingredients..."
            value={dailyLog.smoothie.ingredients}
            onChange={(e) => setDailyLog(prev => ({
              ...prev,
              smoothie: { ...prev.smoothie!, ingredients: e.target.value }
            }))}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
            rows={2}
          />
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Workout</label>
        <select
          name="workoutCompleted"
          value={dailyLog.workoutCompleted}
          onChange={handleInputChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
        >
          <option value="">Select a workout</option>
          {workouts.map(workout => (
            <option key={workout.id} value={workout.id}>
              {workout.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={dailyLog.notes}
          onChange={handleInputChange}
          rows={4}
          placeholder="Any additional notes or observations for today..."
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-md font-medium text-gray-700 mb-3">Quick Entry (Chat Style)</h3>
        <div className="flex items-center">
          <button
            onClick={handleVoiceInput}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 p-2"
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your entry (e.g., 'Weight is 185 lbs', 'Feeling energetic today')"
            className="flex-1 p-2 border-none focus:ring-0 text-sm"
          />
          <button
            onClick={() => {
              setChatMessage('');
            }}
            disabled={!chatMessage.trim()}
            className={`flex-shrink-0 p-2 ${
              chatMessage.trim()
                ? 'text-purple-600 hover:text-purple-700'
                : 'text-gray-300'
            }`}
            aria-label="Submit entry"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Save Today's Log
        </button>
      </div>
    </div>
  );
};