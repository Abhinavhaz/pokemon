'use client';

import { useState } from 'react';
import { usePokemonStore } from '@/lib/store';
import { ColumnDefinition } from '@/types/pokemon';
import { Plus, X } from 'lucide-react';

interface AddColumnProps {
  onClose: () => void;
}

export const AddColumn = ({ onClose }: AddColumnProps) => {
  const { addColumn } = usePokemonStore();
  const [columnName, setColumnName] = useState('');
  const [dataType, setDataType] = useState<'text' | 'number' | 'boolean'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnName.trim()) return;

    setIsSubmitting(true);
    
    const newColumn: ColumnDefinition = {
      id: `custom_${Date.now()}`,
      header: columnName.trim(),
      accessorKey: columnName.trim().toLowerCase().replace(/\s+/g, '_'),
      type: dataType,
      editable: true,
    };

    addColumn(newColumn);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Column</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="columnName" className="block text-sm font-medium text-gray-700 mb-2">
              Column Name
            </label>
            <input
              type="text"
              id="columnName"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter column name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <select
              id="dataType"
              value={dataType}
              onChange={(e) => setDataType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !columnName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Column
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p>• The new column will be added to all existing Pokémon</p>
          <p>• Default values will be: empty string for text, 0 for numbers, false for booleans</p>
          <p>• All cells in the new column will be editable</p>
        </div>
      </div>
    </div>
  );
};

