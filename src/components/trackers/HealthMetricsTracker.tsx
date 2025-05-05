import React, { useState, useEffect } from 'react';
import { HealthMetric } from '../../types';
import { Table } from '../ui/Table';
import { Plus, Download, Upload, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const HealthMetricsTracker: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>(() => {
    const saved = localStorage.getItem('ubermensch_health_metrics');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Weight', value: '185', unit: 'lbs', targetValue: '175', timestamp: new Date().toISOString(), notes: 'Morning weight' },
      { id: '2', name: 'Blood Pressure', value: '120/80', unit: 'mmHg', targetValue: '115/75', timestamp: new Date().toISOString(), notes: 'Pre-workout' },
      { id: '3', name: 'Resting Heart Rate', value: '68', unit: 'bpm', targetValue: '60', timestamp: new Date().toISOString(), notes: 'Morning measurement' },
      { id: '4', name: 'Body Fat', value: '15', unit: '%', targetValue: '12', timestamp: new Date().toISOString(), notes: 'Measured with calipers' },
    ];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<HealthMetric>>({
    name: '',
    value: '',
    unit: '',
    targetValue: '',
    notes: '',
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    localStorage.setItem('ubermensch_health_metrics', JSON.stringify(metrics));
  }, [metrics]);
  
  const handleAddMetric = () => {
    if (!newMetric.name || !newMetric.value) return;
    
    const metric: HealthMetric = {
      id: Date.now().toString(),
      name: newMetric.name || '',
      value: newMetric.value || '',
      unit: newMetric.unit || '',
      targetValue: newMetric.targetValue || '',
      notes: newMetric.notes || '',
      timestamp: newMetric.timestamp || new Date().toISOString()
    };
    
    setMetrics([...metrics, metric]);
    setNewMetric({
      name: '',
      value: '',
      unit: '',
      targetValue: '',
      notes: '',
      timestamp: new Date().toISOString()
    });
    setShowForm(false);
  };

  const calculateProgress = (current: string, target: string): number => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    if (isNaN(currentNum) || isNaN(targetNum)) return 0;
    return (currentNum / targetNum) * 100;
  };
  
  const handleExportCsv = () => {
    const headers = ['Name', 'Value', 'Unit', 'Target Value', 'Timestamp', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...metrics.map(metric => 
        [
          metric.name,
          metric.value,
          metric.unit,
          metric.targetValue,
          format(new Date(metric.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          metric.notes
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'health_metrics.csv');
    link.click();
  };

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const newMetrics: HealthMetric[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(val => 
            val.trim().replace(/^"|"$/g, '')
          );
          
          if (values.length >= 6) {
            newMetrics.push({
              id: Date.now() + i.toString(),
              name: values[0],
              value: values[1],
              unit: values[2],
              targetValue: values[3],
              timestamp: values[4],
              notes: values[5]
            });
          }
        }
        
        if (newMetrics.length > 0) {
          setMetrics(prev => [...prev, ...newMetrics]);
          alert(`Successfully imported ${newMetrics.length} metrics`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error importing metrics. Please check the CSV format.');
      }
    };
    
    reader.readAsText(file);
  };

  const commonMetrics = [
    { name: 'Weight', unit: 'lbs' },
    { name: 'Blood Pressure', unit: 'mmHg' },
    { name: 'Resting Heart Rate', unit: 'bpm' },
    { name: 'Body Fat', unit: '%' },
    { name: 'Waist Circumference', unit: 'inches' },
    { name: 'Body Temperature', unit: '°F' },
    { name: 'Glucose', unit: 'mg/dL' },
    { name: 'Sleep Duration', unit: 'hours' }
  ];
  
  const columns = [
    { header: 'Name', accessor: 'name' },
    {
      header: 'Value',
      accessor: 'value',
      render: (value: string, row: HealthMetric) => (
        <div className="flex items-center space-x-2">
          <span>{value}</span>
          {row.unit && <span className="text-gray-500">{row.unit}</span>}
        </div>
      )
    },
    {
      header: 'Target',
      accessor: 'targetValue',
      render: (target: string, row: HealthMetric) => (
        target ? (
          <div className="flex items-center space-x-2">
            <span>{target}</span>
            {row.unit && <span className="text-gray-500">{row.unit}</span>}
          </div>
        ) : '-'
      )
    },
    {
      header: 'Progress',
      accessor: 'progress',
      render: (_: any, row: HealthMetric) => (
        row.targetValue ? (
          <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  calculateProgress(row.value, row.targetValue) >= 100
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, calculateProgress(row.value, row.targetValue))}%` }}
              />
            </div>
          </div>
        ) : '-'
      )
    },
    {
      header: 'Last Updated',
      accessor: 'timestamp',
      render: (timestamp: string) => format(new Date(timestamp), 'MMM d, yyyy HH:mm')
    },
    { header: 'Notes', accessor: 'notes' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Health Metrics Tracker</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Metric</span>
          </button>

          <input
            type="file"
            id="import-metrics"
            accept=".csv"
            className="hidden"
            onChange={handleImportCsv}
          />
          
          <label
            htmlFor="import-metrics"
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
          <h3 className="text-md font-medium text-gray-700 mb-4">Add New Health Metric</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Metric Name</label>
              <select
                value={newMetric.name}
                onChange={(e) => {
                  const selected = commonMetrics.find(m => m.name === e.target.value);
                  setNewMetric({
                    ...newMetric,
                    name: e.target.value,
                    unit: selected?.unit || ''
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              >
                <option value="">Select a metric</option>
                {commonMetrics.map(metric => (
                  <option key={metric.name} value={metric.name}>{metric.name}</option>
                ))}
                <option value="custom">Custom Metric</option>
              </select>
              {newMetric.name === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom metric name"
                  value={newMetric.name === 'custom' ? '' : newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Value</label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="text"
                  value={newMetric.value}
                  onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                />
                {newMetric.name === 'custom' && (
                  <input
                    type="text"
                    placeholder="Unit"
                    value={newMetric.unit}
                    onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Value (Optional)</label>
              <input
                type="text"
                value={newMetric.targetValue}
                onChange={(e) => setNewMetric({ ...newMetric, targetValue: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <input
                type="text"
                value={newMetric.notes}
                onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
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
              onClick={handleAddMetric}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      <Table columns={columns} data={metrics} />
    </div>
  );
};