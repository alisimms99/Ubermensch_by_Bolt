import React, { useState, useEffect } from 'react';
import { FoodItem } from '../../types';
import { Table } from '../ui/Table';
import { Plus, Download, Upload, AlertCircle } from 'lucide-react';

export const FoodInventoryTracker: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('ubermensch_food_items');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Organic Eggs', quantity: '12', source: 'Local Farm', notes: 'Cage-free', currentStock: 24, lowStockThreshold: 6 },
      { id: '2', name: 'Almond Milk', quantity: '1 carton', source: 'Thrive Market', notes: 'Unsweetened', currentStock: 3, lowStockThreshold: 2 },
      { id: '3', name: 'Chicken Breast', quantity: '2 lbs', source: 'Whole Foods', notes: 'Free-range, organic', currentStock: 4, lowStockThreshold: 2 },
      { id: '4', name: 'Sweet Potatoes', quantity: '5', source: 'Farmers Market', notes: 'Medium size', currentStock: 8, lowStockThreshold: 3 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('ubermensch_food_items', JSON.stringify(foodItems));
  }, [foodItems]);
  
  const [showForm, setShowForm] = useState(false);
  const [newFoodItem, setNewFoodItem] = useState<Partial<FoodItem>>({
    name: '',
    quantity: '',
    source: '',
    notes: '',
    currentStock: 0,
    lowStockThreshold: 0
  });

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const newItems: FoodItem[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(val => 
            val.trim().replace(/^"|"$/g, '')
          );
          
          if (values.length >= 6) {
            newItems.push({
              id: Date.now() + i.toString(),
              name: values[0],
              quantity: values[1],
              source: values[2],
              notes: values[3],
              currentStock: parseInt(values[4]) || 0,
              lowStockThreshold: parseInt(values[5]) || 0
            });
          }
        }
        
        if (newItems.length > 0) {
          setFoodItems(prev => [...prev, ...newItems]);
          alert(`Successfully imported ${newItems.length} food items`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error importing food items. Please check the CSV format.');
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleAddFoodItem = () => {
    if (!newFoodItem.name) return;
    
    const item: FoodItem = {
      id: Date.now().toString(),
      name: newFoodItem.name || '',
      quantity: newFoodItem.quantity || '',
      source: newFoodItem.source || '',
      notes: newFoodItem.notes || '',
      lowStockThreshold: newFoodItem.lowStockThreshold,
      currentStock: newFoodItem.currentStock
    };
    
    setFoodItems([...foodItems, item]);
    setNewFoodItem({
      name: '',
      quantity: '',
      source: '',
      notes: '',
      lowStockThreshold: 0,
      currentStock: 0
    });
    setShowForm(false);
  };
  
  const handleExportCsv = () => {
    const headers = ['Name', 'Quantity', 'Source', 'Notes', 'Current Stock', 'Low Stock Threshold'];
    const csvContent = [
      headers.join(','),
      ...foodItems.map(item => 
        [
          item.name,
          item.quantity,
          item.source,
          item.notes,
          item.currentStock || '',
          item.lowStockThreshold || ''
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'food_inventory.csv');
    link.click();
  };

  const handleUpdateStock = (id: string, change: number) => {
    setFoodItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, currentStock: Math.max(0, (item.currentStock || 0) + change) }
        : item
    ));
  };
  
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Source', accessor: 'source' },
    {
      header: 'Stock',
      accessor: 'currentStock',
      render: (value: number, row: FoodItem) => (
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
    { header: 'Notes', accessor: 'notes' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Food Inventory Tracker</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Food Item</span>
          </button>

          <input
            type="file"
            id="import-food"
            accept=".csv"
            className="hidden"
            onChange={handleImportCsv}
          />
          
          <label
            htmlFor="import-food"
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
          <h3 className="text-md font-medium text-gray-700 mb-4">Add New Food Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newFoodItem.name}
                onChange={(e) => setNewFoodItem({ ...newFoodItem, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="text"
                value={newFoodItem.quantity}
                onChange={(e) => setNewFoodItem({ ...newFoodItem, quantity: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <input
                type="text"
                value={newFoodItem.source}
                onChange={(e) => setNewFoodItem({ ...newFoodItem, source: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Stock</label>
              <input
                type="number"
                value={newFoodItem.currentStock}
                onChange={(e) => setNewFoodItem({ ...newFoodItem, currentStock: parseInt(e.target.value) })}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
              <input
                type="number"
                value={newFoodItem.lowStockThreshold}
                onChange={(e) => setNewFoodItem({ ...newFoodItem, lowStockThreshold: parseInt(e.target.value) })}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <input
                type="text"
                value={newFoodItem.notes}
                onChange={(e) => setNewFoodItem({ ...newFoodItem, notes: e.target.value })}
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
              onClick={handleAddFoodItem}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      <Table columns={columns} data={foodItems} />
    </div>
  );
};