import React, { useState, useEffect } from 'react';
import { Supplement } from '../../types';
import { Table } from '../ui/Table';
import { Plus, Download, Upload, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

export const SupplementsTracker: React.FC = () => {
  const [supplements, setSupplements] = useState<Supplement[]>(() => {
    const saved = localStorage.getItem('ubermensch_supplements');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSupplement, setNewSupplement] = useState<Partial<Supplement>>({
    name: '',
    purpose: '',
    category: '',
    notes: '',
    timing: 'BOTH',
    takenToday: false,
    currentStock: 0,
    lowStockThreshold: 0
  });

  useEffect(() => {
    localStorage.setItem('ubermensch_supplements', JSON.stringify(supplements));
  }, [supplements]);

  // Reset takenToday flag at midnight
  useEffect(() => {
    const checkDate = () => {
      const lastReset = localStorage.getItem('supplements_last_reset');
      const today = new Date().toDateString();
      
      if (lastReset !== today) {
        setSupplements(prev => prev.map(s => ({ ...s, takenToday: false })));
        localStorage.setItem('supplements_last_reset', today);
      }
    };

    checkDate();
    const interval = setInterval(checkDate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleEdit = (supplement: Supplement) => {
    setEditingId(supplement.id);
    setNewSupplement({
      name: supplement.name,
      purpose: supplement.purpose,
      category: supplement.category,
      notes: supplement.notes,
      timing: supplement.timing,
      nextRefillDate: supplement.nextRefillDate,
      currentStock: supplement.currentStock,
      lowStockThreshold: supplement.lowStockThreshold
    });
    setShowForm(true);
  };

  const handleDelete = (supplement: Supplement) => {
    setSupplements(prev => prev.filter(s => s.id !== supplement.id));
  };
  
  const handleAddSupplement = () => {
    if (!newSupplement.name) return;
    
    if (editingId) {
      setSupplements(prev => prev.map(s => 
        s.id === editingId ? {
          ...s,
          ...newSupplement,
          timing: newSupplement.timing as 'AM' | 'PM' | 'BOTH'
        } : s
      ));
    } else {
      const supplement: Supplement = {
        id: Date.now().toString(),
        name: newSupplement.name || '',
        purpose: newSupplement.purpose || '',
        category: newSupplement.category || '',
        notes: newSupplement.notes || '',
        timing: newSupplement.timing as 'AM' | 'PM' | 'BOTH',
        nextRefillDate: newSupplement.nextRefillDate,
        takenToday: false,
        lowStockThreshold: newSupplement.lowStockThreshold || 0,
        currentStock: newSupplement.currentStock || 0
      };
      
      setSupplements(prev => [...prev, supplement]);
    }
    
    setNewSupplement({
      name: '',
      purpose: '',
      category: '',
      notes: '',
      timing: 'BOTH',
      takenToday: false,
      currentStock: 0,
      lowStockThreshold: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleToggleTaken = (id: string) => {
    setSupplements(prev => prev.map(s =>
      s.id === id ? { ...s, takenToday: !s.takenToday } : s
    ));
  };

  const handleUpdateStock = (id: string, change: number) => {
    setSupplements(prev => prev.map(s =>
      s.id === id ? { ...s, currentStock: Math.max(0, (s.currentStock || 0) + change) } : s
    ));
  };

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        
        const newSupplements: Supplement[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(val => 
            val.trim().replace(/^"|"$/g, '')
          );
          
          if (values.length >= 4) {
            newSupplements.push({
              id: Date.now() + i.toString(),
              name: values[0],
              purpose: values[1],
              category: values[2],
              notes: values[3],
              timing: values[4] as 'AM' | 'PM' | 'BOTH' || 'BOTH',
              takenToday: false,
              nextRefillDate: values[5] || undefined,
              lowStockThreshold: parseInt(values[6]) || 0,
              currentStock: parseInt(values[7]) || 0
            });
          }
        }
        
        if (newSupplements.length > 0) {
          setSupplements(prev => [...prev, ...newSupplements]);
          alert(`Successfully imported ${newSupplements.length} supplements`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error importing supplements. Please check the CSV format.');
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleExportCsv = () => {
    const headers = ['Name', 'Purpose', 'Category', 'Notes', 'Timing', 'Next Refill Date', 'Low Stock Threshold', 'Current Stock'];
    const csvContent = [
      headers.join(','),
      ...supplements.map(s => 
        [
          s.name,
          s.purpose,
          s.category,
          s.notes,
          s.timing,
          s.nextRefillDate || '',
          s.lowStockThreshold || '',
          s.currentStock || ''
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'supplements.csv');
    link.click();
  };
  
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Purpose', accessor: 'purpose' },
    { header: 'Category', accessor: 'category' },
    { header: 'Timing', accessor: 'timing' },
    { 
      header: 'Stock',
      accessor: 'currentStock',
      render: (value: number, row: Supplement) => (
        <div className="flex items-center space-x-2">
          <span className={`${
            row.lowStockThreshold && value <= row.lowStockThreshold
              ? 'text-red-500'
              : 'text-gray-500'
          }`}>
            {value}
          </span>
          {row.lowStockThreshold && value <= row.lowStockThreshold && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <button
            onClick={() => handleUpdateStock(row.id, -1)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            -
          </button>
          <button
            onClick={() => handleUpdateStock(row.id, 1)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            +
          </button>
        </div>
      )
    },
    {
      header: 'Next Refill',
      accessor: 'nextRefillDate',
      render: (value: string) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    },
    {
      header: 'Taken Today',
      accessor: 'takenToday',
      render: (value: boolean, row: Supplement) => (
        <button
          onClick={() => handleToggleTaken(row.id)}
          className={`px-3 py-1 rounded-full text-sm ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </button>
      )
    },
    { header: 'Notes', accessor: 'notes' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Supplements Tracker</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplement</span>
          </button>

          <input
            type="file"
            id="import-supplements"
            accept=".csv"
            className="hidden"
            onChange={handleImportCsv}
          />
          
          <label
            htmlFor="import-supplements"
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
          <h3 className="text-md font-medium text-gray-700 mb-4">
            {editingId ? 'Edit Supplement' : 'Add New Supplement'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newSupplement.name}
                onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <input
                type="text"
                value={newSupplement.purpose}
                onChange={(e) => setNewSupplement({ ...newSupplement, purpose: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={newSupplement.category}
                onChange={(e) => setNewSupplement({ ...newSupplement, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timing</label>
              <select
                value={newSupplement.timing}
                onChange={(e) => setNewSupplement({ ...newSupplement, timing: e.target.value as 'AM' | 'PM' | 'BOTH' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              >
                <option value="AM">Morning</option>
                <option value="PM">Evening</option>
                <option value="BOTH">Both AM/PM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Next Refill Date</label>
              <input
                type="date"
                value={newSupplement.nextRefillDate}
                onChange={(e) => setNewSupplement({ ...newSupplement, nextRefillDate: e.target.value })}
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Stock</label>
              <input
                type="number"
                value={newSupplement.currentStock}
                onChange={(e) => setNewSupplement({ ...newSupplement, currentStock: parseInt(e.target.value) })}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
              <input
                type="number"
                value={newSupplement.lowStockThreshold}
                onChange={(e) => setNewSupplement({ ...newSupplement, lowStockThreshold: parseInt(e.target.value) })}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={newSupplement.notes}
                onChange={(e) => setNewSupplement({ ...newSupplement, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setNewSupplement({
                  name: '',
                  purpose: '',
                  category: '',
                  notes: '',
                  timing: 'BOTH',
                  takenToday: false,
                  currentStock: 0,
                  lowStockThreshold: 0
                });
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSupplement}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}
      
      <Table
        columns={columns}
        data={supplements}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};