import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Activity, Scale, Heart, Droplet } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [supplements, setSupplements] = useState<any[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      const healthMetrics = JSON.parse(localStorage.getItem('ubermensch_health_metrics') || '[]');
      const workoutPlans = JSON.parse(localStorage.getItem('ubermensch_workouts') || '[]');
      const supplementsList = JSON.parse(localStorage.getItem('ubermensch_supplements') || '[]');
      
      setMetrics(healthMetrics);
      setWorkouts(workoutPlans);
      setSupplements(supplementsList);
    };

    loadData();
  }, []);

  const generateDateRange = (days: number) => {
    return Array.from({ length: days }).map((_, i) => ({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      weight: Math.random() * 10 + 170,
      heartRate: Math.random() * 20 + 60,
      energy: Math.random() * 5 + 5,
      hydration: Math.random() * 40 + 60
    })).reverse();
  };

  const dateRangeData = generateDateRange(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

  const workoutCompletionData = [
    { name: 'Completed', value: workouts.filter(w => w.completed).length },
    { name: 'Pending', value: workouts.filter(w => !w.completed).length }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === range
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Trend */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <Scale className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-md font-medium text-gray-700">Weight Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dateRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (lbs)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heart Rate Trend */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-md font-medium text-gray-700">Heart Rate Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dateRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[40, 100]} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="heartRate" stroke="#ff7300" fill="#fff1e6" name="BPM" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Level */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-md font-medium text-gray-700">Energy Level Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="energy" fill="#ffc658" name="Energy Level (1-10)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hydration */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <Droplet className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-md font-medium text-gray-700">Hydration Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dateRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 120]} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="hydration" stroke="#82ca9d" fill="#ecfdf5" name="Hydration (oz)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Workout Completion */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-gray-700 mb-4">Workout Completion</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workoutCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {workoutCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplement Usage */}
        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-gray-700 mb-4">Supplement Usage</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplement
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplements.map((supplement) => (
                  <tr key={supplement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplement.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplement.currentStock || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        supplement.takenToday
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {supplement.takenToday ? 'Taken' : 'Not Taken'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};