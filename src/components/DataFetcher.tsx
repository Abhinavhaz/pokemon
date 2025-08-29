'use client';

import { useState } from 'react';
import { usePokemonData } from '@/hooks/usePokemonData';
import { usePokemonStore } from '@/lib/store';
import { Download, Database } from 'lucide-react';

export const DataFetcher = () => {
  const { fetchPokemonData, isLoading, hasData } = usePokemonData();
  const { fetchProgress } = usePokemonStore();
  const [showProgress, setShowProgress] = useState(false);

  const handleFetchData = async () => {
    setShowProgress(true);
    await fetchPokemonData();
    setShowProgress(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Data Sources</h2>
        {hasData && (
          <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
            {fetchProgress.total} Pokémon loaded
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {/* API Fetch Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-700">Fetch from PokeAPI</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Fetch the complete Pokédex dataset from the official PokeAPI. This will retrieve all available Pokémon with detailed information.
          </p>
          
          <button
            onClick={handleFetchData}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Fetch Full Pokédex Dataset
              </>
            )}
          </button>
          
          {showProgress && isLoading && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{fetchProgress.current} / {fetchProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(fetchProgress.current / fetchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* CSV Upload Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Download className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-700">Upload CSV File</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Upload your own CSV file with Pokémon data. The file will be processed on the client-side for optimal performance.
          </p>
          
          <CSVUploader />
        </div>
      </div>
    </div>
  );
};

const CSVUploader = () => {
  const [isUploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMapping, setShowMapping] = useState(false);
  const [csvData, setCsvData] = useState<any>(null);
  const { setPokemon } = usePokemonStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const { parseCSVFile } = await import('@/lib/csv');
      const result = await parseCSVFile(file, (progress) => {
        setUploadProgress(progress * 100);
      });

      setCsvData(result);
      setShowMapping(true);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />
      
      {isUploading && (
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Processing CSV</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {showMapping && csvData && (
        <CSVSchemaMapping 
          csvData={csvData} 
          onComplete={(pokemon) => {
            setPokemon(pokemon);
            setShowMapping(false);
            setCsvData(null);
          }}
          onCancel={() => {
            setShowMapping(false);
            setCsvData(null);
          }}
        />
      )}
    </div>
  );
};

const CSVSchemaMapping = ({ 
  csvData, 
  onComplete, 
  onCancel 
}: { 
  csvData: any; 
  onComplete: (pokemon: any[]) => void; 
  onCancel: () => void; 
}) => {
  const [mappings, setMappings] = useState<Array<{ csvColumn: string; targetField: string; dataType: 'text' | 'number' | 'boolean' }>>([]);
  
  const targetFields = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'types', label: 'Types', type: 'text' },
    { key: 'stats.0.base_stat', label: 'HP', type: 'number' },
    { key: 'stats.1.base_stat', label: 'Attack', type: 'number' },
    { key: 'stats.2.base_stat', label: 'Defense', type: 'number' },
    { key: 'stats.3.base_stat', label: 'Special Attack', type: 'number' },
    { key: 'stats.4.base_stat', label: 'Special Defense', type: 'number' },
    { key: 'stats.5.base_stat', label: 'Speed', type: 'number' },
  ];

  const handleMappingChange = (index: number, field: string, value: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  const handleComplete = async () => {
    try {
      const { mapCSVToPokemon } = await import('@/lib/csv');
      const pokemon = mapCSVToPokemon(csvData.data, mappings);
      onComplete(pokemon);
    } catch (error) {
      console.error('Error mapping CSV:', error);
      alert('Error processing CSV data.');
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-700 mb-3">Map CSV Columns</h4>
      <div className="space-y-3">
        {targetFields.map((field, index) => (
          <div key={field.key} className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 min-w-[120px]">
              {field.label}:
            </label>
            <select
              value={mappings[index]?.csvColumn || ''}
              onChange={(e) => handleMappingChange(index, 'csvColumn', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select CSV column</option>
              {csvData.headers.map((header: string, headerIndex: number) => (
                <option key={headerIndex} value={headerIndex}>
                  {headerIndex}: {header}
                </option>
              ))}
            </select>
            <select
              value={mappings[index]?.dataType || field.type}
              onChange={(e) => handleMappingChange(index, 'dataType', e.target.value as any)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>
        ))}
      </div>
      
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Import Data
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

