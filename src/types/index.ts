export interface Supplement {
  id: string;
  name: string;
  purpose: string;
  category: string;
  notes: string;
  timing: 'AM' | 'PM' | 'BOTH';
  nextRefillDate?: string;
  takenToday: boolean;
  lowStockThreshold?: number;
  currentStock?: number;
}

export interface FitnessEquipment {
  id: string;
  name: string;
  type: string;
  usageNotes: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string;
  instructions: string;
  tags: string[];
  calories?: number;
  protein?: number;
  prepTime?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  source: string;
  notes: string;
  lowStockThreshold?: number;
  currentStock?: number;
}

export interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit?: string;
  targetValue?: string;
  timestamp: string;
  notes: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  assignedDate: string;
  completed: boolean;
  notes: string;
  type?: string;
  duration?: string;
  intensity?: 'Low' | 'Medium' | 'High';
}

export interface DailyLog {
  id: string;
  date: string;
  wakeTime?: string;
  sleepTime?: string;
  weight?: string;
  mood?: {
    score: number;
    tags: string[];
  };
  energyLevel?: number;
  sexualEnergy?: 'Low' | 'Normal' | 'High';
  stoolQuality?: 'Solid' | 'Soft' | 'Loose' | 'Liquid';
  bowelMovements?: number;
  cramps?: {
    severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
    location?: string;
  };
  supplementsTaken?: string[];
  meals?: {
    description: string;
    calories?: number;
    time?: string;
  }[];
  smoothie?: {
    had: boolean;
    ingredients?: string;
  };
  hydration?: number;
  workoutCompleted?: string;
  notes?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  reminder?: {
    time: string;
    notified: boolean;
  };
}

export type AiAssistantRole = 'Health Advisor' | 'Fitness Trainer' | 'Nutrition Assistant';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AiConversation {
  id: string;
  messages: AiMessage[];
  assistantRole: AiAssistantRole;
}

export interface AnalyticsData {
  weightTrend: {
    date: string;
    value: number;
  }[];
  energyTrend: {
    date: string;
    value: number;
  }[];
  libidoTrend: {
    date: string;
    value: string;
  }[];
  stoolConsistency: {
    type: string;
    percentage: number;
  }[];
  workoutCompletion: {
    month: string;
    completed: number;
    total: number;
  }[];
  supplementUsage: {
    name: string;
    adherence: number;
  }[];
}