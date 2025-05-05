import React, { useState } from 'react';
import { Tabs } from './components/ui/Tabs';
import { SupplementsTracker } from './components/trackers/SupplementsTracker';
import { FitnessEquipmentTracker } from './components/trackers/FitnessEquipmentTracker';
import { RecipesManager } from './components/trackers/RecipesManager';
import { FoodInventoryTracker } from './components/trackers/FoodInventoryTracker';
import { HealthMetricsTracker } from './components/trackers/HealthMetricsTracker';
import { WorkoutPlansManager } from './components/trackers/WorkoutPlansManager';
import { TodayPanel } from './components/trackers/TodayPanel';
import { NotesSection } from './components/trackers/NotesSection';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { AiAssistant } from './components/ai/AiAssistant';
import { Header } from './components/layout/Header';
import { AiAssistantButton } from './components/ai/AiAssistantButton';

function App() {
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  const tabs = [
    { id: 'today', label: 'Today', content: <TodayPanel /> },
    { id: 'supplements', label: 'Supplements', content: <SupplementsTracker /> },
    { id: 'equipment', label: 'Fitness Equipment', content: <FitnessEquipmentTracker /> },
    { id: 'recipes', label: 'Recipes', content: <RecipesManager /> },
    { id: 'food', label: 'Food Inventory', content: <FoodInventoryTracker /> },
    { id: 'metrics', label: 'Health Metrics', content: <HealthMetricsTracker /> },
    { id: 'workouts', label: 'Workout Plans', content: <WorkoutPlansManager /> },
    { id: 'notes', label: 'Notes', content: <NotesSection /> },
    { id: 'analytics', label: 'Analytics', content: <AnalyticsDashboard /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <Tabs tabs={tabs} />
        <AiAssistantButton onClick={() => setShowAiAssistant(true)} />
        {showAiAssistant && (
          <AiAssistant onClose={() => setShowAiAssistant(false)} />
        )}
      </main>
    </div>
  );
}

export default App;