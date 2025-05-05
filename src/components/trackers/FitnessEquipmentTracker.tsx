import React, { useState } from 'react';
import { FitnessEquipment } from '../../types';
import { Table } from '../ui/Table';
import { Plus, Download } from 'lucide-react';

export const FitnessEquipmentTracker: React.FC = () => {
  const [equipment, setEquipment] = useState<FitnessEquipment[]>([
    { id: '1', name: 'Dumbbells', type: 'Weights', usageNotes: '5-50lbs set, adjustable' },
    { id: '2', name: 'Resistance Bands', type: 'Strength', usageNotes: 'Various resistance levels' },
    { id: '3', name: 'Yoga Mat', type: 'Recovery', usageNotes: 'Extra thick for comfort' },
    { id: '4', name: 'Jump Rope', type: 'Cardio', usageNotes: 'Speed rope with ball bearings' },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [newEquipment, setNewEquipment] = useState<Partial<FitnessEquipment>>({
    name: '',
    type: '',
    usageNotes: ''
  });
  
  const handleAddEquipment = () => {
    if (!newEquipment.name) return;
    
    const item: FitnessEquipment = {
      id: Date.now().toString(),
      name: newEquipment.name || '',
      type: newEquipment.type || '',
      usageNotes: newEquipment.usageNotes || ''
    };
    
    setEquipment([...equipment, item]);
    setNewEquipment({ name: '', type: '', usageNotes: '' });
    setShowForm(false);
  };
  
  const handleExportCsv = () => {
    const headers = ['Name', 'Type', 'Usage Notes'];
    const csvContent = [
      headers.join(','),
      ...equipment.map(e => 
        [e.name, e.type, e.usageNotes].map(field => `"${field}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'fitness_equipment.csv');
    link.click();
  };
  
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Type', accessor: 'type' },
    { header: 'Usage Notes', accessor: 'usageNotes' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Fitness Equipment Tracker</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Equipment</span>
          </button>
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
          <h3 className="text-md font-medium text-gray-700 mb-4">Add New Equipment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <input
                type="text"
                value={newEquipment.type}
                onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Usage Notes</label>
              <textarea
                value={newEquipment.usageNotes}
                onChange={(e) => setNewEquipment({ ...newEquipment, usageNotes: e.target.value })}
                rows={3}
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
              onClick={handleAddEquipment}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      <Table columns={columns} data={equipment} />
    </div>
  );
};