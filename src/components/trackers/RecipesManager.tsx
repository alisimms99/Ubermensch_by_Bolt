import React, { useState, useEffect } from 'react';
import { Recipe } from '../../types';
import { Table } from '../ui/Table';
import { Plus, Download, Upload, Tag } from 'lucide-react';

const MEAL_TAGS = [
  'Kidney Support',
  'Liver Detox',
  'Energy Boost',
  'High Protein Recovery',
  'Anti-Inflammatory',
  'Gut Health',
  'Immune Support',
  'Pre-Workout',
  'Post-Workout',
  'Muscle Building'
];

export const RecipesManager: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('ubermensch_recipes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    ingredients: '',
    instructions: '',
    tags: [],
    calories: undefined,
    protein: undefined,
    prepTime: ''
  });
  
  useEffect(() => {
    localStorage.setItem('ubermensch_recipes', JSON.stringify(recipes));
  }, [recipes]);

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const newRecipes: Recipe[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(val => 
            val.trim().replace(/^"|"$/g, '')
          );
          
          if (values.length >= 7) {
            newRecipes.push({
              id: Date.now() + i.toString(),
              name: values[0],
              ingredients: values[1],
              instructions: values[2],
              tags: values[3].split(';').filter(Boolean),
              calories: parseInt(values[4]) || undefined,
              protein: parseInt(values[5]) || undefined,
              prepTime: values[6]
            });
          }
        }
        
        if (newRecipes.length > 0) {
          setRecipes(prev => [...prev, ...newRecipes]);
          alert(`Successfully imported ${newRecipes.length} recipes`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error importing recipes. Please check the CSV format.');
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleAddRecipe = () => {
    if (!newRecipe.name) return;
    
    const recipe: Recipe = {
      id: Date.now().toString(),
      name: newRecipe.name || '',
      ingredients: newRecipe.ingredients || '',
      instructions: newRecipe.instructions || '',
      tags: newRecipe.tags || [],
      calories: newRecipe.calories,
      protein: newRecipe.protein,
      prepTime: newRecipe.prepTime
    };
    
    setRecipes([...recipes, recipe]);
    setNewRecipe({
      name: '',
      ingredients: '',
      instructions: '',
      tags: [],
      calories: undefined,
      protein: undefined,
      prepTime: ''
    });
    setShowForm(false);
  };
  
  const handleTagToggle = (tag: string) => {
    setNewRecipe(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };
  
  const handleExportCsv = () => {
    const headers = ['Name', 'Ingredients', 'Instructions', 'Tags', 'Calories', 'Protein (g)', 'Prep Time'];
    const csvContent = [
      headers.join(','),
      ...recipes.map(recipe => 
        [
          recipe.name,
          recipe.ingredients,
          recipe.instructions,
          recipe.tags.join(';'),
          recipe.calories || '',
          recipe.protein || '',
          recipe.prepTime || ''
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'recipes.csv');
    link.click();
  };
  
  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Tags',
      accessor: 'tags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )
    },
    { 
      header: 'Nutrition',
      accessor: 'calories',
      render: (_: any, recipe: Recipe) => (
        <div className="space-y-1">
          {recipe.calories && (
            <div className="text-sm text-gray-600">
              {recipe.calories} calories
            </div>
          )}
          {recipe.protein && (
            <div className="text-sm text-gray-600">
              {recipe.protein}g protein
            </div>
          )}
        </div>
      )
    },
    { header: 'Prep Time', accessor: 'prepTime' },
    { header: 'Instructions', accessor: 'instructions' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Recipes Manager</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Recipe</span>
          </button>

          <input
            type="file"
            id="import-recipes"
            accept=".csv"
            className="hidden"
            onChange={handleImportCsv}
          />
          
          <label
            htmlFor="import-recipes"
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
          <h3 className="text-md font-medium text-gray-700 mb-4">Add New Recipe</h3>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {MEAL_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                      newRecipe.tags?.includes(tag)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Calories</label>
                <input
                  type="number"
                  value={newRecipe.calories || ''}
                  onChange={(e) => setNewRecipe({ ...newRecipe, calories: parseInt(e.target.value) || undefined })}
                  placeholder="Optional"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                <input
                  type="number"
                  value={newRecipe.protein || ''}
                  onChange={(e) => setNewRecipe({ ...newRecipe, protein: parseInt(e.target.value) || undefined })}
                  placeholder="Optional"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prep Time</label>
                <input
                  type="text"
                  value={newRecipe.prepTime}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: e.target.value })}
                  placeholder="e.g., 30 mins"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingredients</label>
              <textarea
                value={newRecipe.ingredients}
                onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                placeholder="Enter ingredients, separated by new lines"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Instructions</label>
              <textarea
                value={newRecipe.instructions}
                onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                placeholder="Enter step-by-step instructions"
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
              onClick={handleAddRecipe}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      <Table columns={columns} data={recipes} />
    </div>
  );
};