'use client';

import { useState } from 'react';
import { DataFetcher } from '@/components/DataFetcher';
import { PokemonTable } from '@/components/PokemonTable';
import { AIChatOverlay } from '@/components/AIChatOverlay';
import { Zap, Database, Table, Bot } from 'lucide-react';

export default function Home() {
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Pokemon Research Lab</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAIChat(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Bot className="w-4 h-4" />
                AI Assistant
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Pokemon Data Analysis
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A high-performance web application for aggregating, analyzing, and manipulating comprehensive Pokemon datasets. 
            Fetch data from the official PokeAPI or upload your own CSV files for advanced research capabilities.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Dual Data Sources</h3>
            <p className="text-gray-600 text-sm">
              Fetch from PokeAPI or upload CSV files with client-side processing for optimal performance.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Table className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">High-Performance Table</h3>
            <p className="text-gray-600 text-sm">
              Virtualized table with sorting, editing, and dynamic column creation for large datasets.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Assistant</h3>
            <p className="text-gray-600 text-sm">
              Natural language commands for data manipulation and analysis tasks.
            </p>
          </div>
        </div>

        {/* Data Fetcher */}
        <DataFetcher />

        {/* Pokemon Table */}
        <PokemonTable />

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Built with Next.js 14, TypeScript, Tailwind CSS, and TanStack technologies.
            Data provided by the{' '}
            <a 
              href="https://pokeapi.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              PokeAPI
            </a>
            .
          </p>
        </footer>
      </main>

      {/* AI Chat Overlay */}
      <AIChatOverlay isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </div>
  );
}


