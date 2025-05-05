import React, { useState, useEffect } from 'react';
import { X, Send, Mic } from 'lucide-react';
import { AiAssistantRole, AiMessage, DailyLog, Supplement, WorkoutPlan, FoodItem, HealthMetric, Recipe, Note } from '../../types';
import OpenAI from 'openai';

interface AiAssistantProps {
  onClose: () => void;
}

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

const ASSISTANT_ID = 'asst_kAuX8frgHkz1gP6cpxV0iOLN';

const LOCAL_STORAGE_KEYS = {
  DAILY_LOGS: 'ubermensch_daily_logs',
  SUPPLEMENTS: 'ubermensch_supplements',
  WORKOUTS: 'ubermensch_workouts',
  FOOD_ITEMS: 'ubermensch_food_items',
  HEALTH_METRICS: 'ubermensch_health_metrics',
  RECIPES: 'ubermensch_recipes',
  NOTES: 'ubermensch_notes'
};

export const AiAssistant: React.FC<AiAssistantProps> = ({ onClose }) => {
  const [role, setRole] = useState<AiAssistantRole>('Health Advisor');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AiMessage[]>([
    { 
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your health assistant. I can help you track and analyze your health data. Try asking me about your records or to update them.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const getData = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  const saveData = (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const updateRecord = (type: string, id: string, updates: any) => {
    const storageKey = LOCAL_STORAGE_KEYS[type as keyof typeof LOCAL_STORAGE_KEYS];
    const records = getData(storageKey);
    const updatedRecords = records.map((record: any) => 
      record.id === id ? { ...record, ...updates } : record
    );
    saveData(storageKey, updatedRecords);
    return updatedRecords;
  };

  const addRecord = (type: string, record: any) => {
    const storageKey = LOCAL_STORAGE_KEYS[type as keyof typeof LOCAL_STORAGE_KEYS];
    const records = getData(storageKey);
    const newRecords = [...records, { ...record, id: Date.now().toString() }];
    saveData(storageKey, newRecords);
    return newRecords;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: AiMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      const thread = await openai.beta.threads.create();
      
      // Send current data context along with user message
      const contextMessage = `Current data state:
        Daily Logs: ${JSON.stringify(getData(LOCAL_STORAGE_KEYS.DAILY_LOGS))}
        Supplements: ${JSON.stringify(getData(LOCAL_STORAGE_KEYS.SUPPLEMENTS))}
        Workouts: ${JSON.stringify(getData(LOCAL_STORAGE_KEYS.WORKOUTS))}
        Food Items: ${JSON.stringify(getData(LOCAL_STORAGE_KEYS.FOOD_ITEMS))}
        Health Metrics: ${JSON.stringify(getData(LOCAL_STORAGE_KEYS.HEALTH_METRICS))}
        Recipes: ${JSON.stringify(getData(LOCAL_STORAGE_KEYS.RECIPES))}
        Notes: ${JSON.stringify(getData(LOCAL_STORAGE_KEYS.NOTES))}
      `;
      
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: `Context: ${contextMessage}\n\nUser message: ${message}`
      });
      
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID
      });
      
      const checkCompletion = async () => {
        const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        
        if (runStatus.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(thread.id);
          const lastMessage = messages.data[0];
          
          if (lastMessage.role === 'assistant') {
            // Parse potential data updates from assistant's response
            const response = lastMessage.content[0].text.value;
            
            if (response.includes('UPDATE_DATA:')) {
              const updateInfo = JSON.parse(response.split('UPDATE_DATA:')[1]);
              if (updateInfo.type && updateInfo.id && updateInfo.updates) {
                updateRecord(updateInfo.type, updateInfo.id, updateInfo.updates);
              }
            }
            
            if (response.includes('ADD_DATA:')) {
              const addInfo = JSON.parse(response.split('ADD_DATA:')[1]);
              if (addInfo.type && addInfo.record) {
                addRecord(addInfo.type, addInfo.record);
              }
            }
            
            const assistantMessage: AiMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: response.replace(/UPDATE_DATA:|ADD_DATA:.*$/g, '').trim(),
              timestamp: new Date().toISOString()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
          }
          setIsLoading(false);
        } else if (runStatus.status === 'failed') {
          console.error('Assistant run failed:', runStatus.last_error);
          setIsLoading(false);
        } else {
          setTimeout(checkCompletion, 1000);
        }
      };
      
      await checkCompletion();
    } catch (error) {
      console.error('Error communicating with assistant:', error);
      setIsLoading(false);
      
      const errorMessage: AiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again later.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">AI Assistant</h2>
            <div className="mt-1">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AiAssistantRole)}
                className="text-sm text-gray-500 bg-transparent border-none focus:ring-0 p-0"
              >
                <option value="Health Advisor">Health Advisor</option>
                <option value="Fitness Trainer">Fitness Trainer</option>
                <option value="Nutrition Assistant">Nutrition Assistant</option>
              </select>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close assistant"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3/4 rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 px-4 py-4 flex items-center">
          <button
            onClick={() => window.open('https://chatgpt.com/g/g-67b295f6e68c81918ddfa5e5a9884af0-holistic-health-fitness-ai', '_blank')}
            className="text-gray-500 hover:text-gray-600 p-2"
            aria-label="Use voice input"
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask something..."
            className="flex-1 border-none focus:ring-0 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!message.trim() || isLoading}
            className={`p-2 rounded-full ${
              message.trim() && !isLoading
                ? 'text-purple-600 hover:text-purple-700'
                : 'text-gray-300'
            }`}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};