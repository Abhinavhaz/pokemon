'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePokemonStore } from '@/lib/store';
import { Pokemon, ColumnDefinition } from '@/types/pokemon';
import { AddColumn } from './AddColumn';
import { Plus, Download, Search, Trash2 } from 'lucide-react';

const columnHelper = createColumnHelper<Pokemon>();

export const PokemonTable = () => {
  const { pokemon, columns, updatePokemon, deletePokemon } = usePokemonStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filterText, setFilterText] = useState('');

  // Create table columns from store columns
  const tableColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.id === 'addColumn') {
        return columnHelper.display({
          id: col.id,
          header: () => (
            <button
              onClick={() => setShowAddColumn(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
          ),
          size: 150,
        });
      }

      return columnHelper.accessor(col.accessorKey as any, {
        id: col.id,
        header: col.header,
        size: col.type === 'image' ? 80 : col.type === 'types' ? 120 : 100,
        cell: ({ getValue, row }) => {
          const value = getValue();
          const pokemon = row.original;
          
          if (col.type === 'image') {
            return (
              <img
                src={value || '/pokeball-placeholder.svg'}
                alt={pokemon.name}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/pokeball-placeholder.svg';
                }}
              />
            );
          }
          
          if (col.type === 'types') {
            return (
              <div className="flex flex-wrap gap-1">
                {Array.isArray(value) && value.map((type, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700"
                  >
                    {type.type?.name || type}
                  </span>
                ))}
              </div>
            );
          }
          
          if (col.editable) {
            return (
              <EditableCell
                value={value}
                type={col.type}
                onChange={(newValue) => {
                  if (col.accessorKey.includes('.')) {
                    // Handle nested properties like stats.0.base_stat
                    const keys = col.accessorKey.split('.');
                    const updates: any = {};
                    let current = updates;
                    for (let i = 0; i < keys.length - 1; i++) {
                      current[keys[i]] = {};
                      current = current[keys[i]];
                    }
                    current[keys[keys.length - 1]] = newValue;
                    updatePokemon(pokemon.id, updates);
                  } else {
                    updatePokemon(pokemon.id, { [col.accessorKey]: newValue });
                  }
                }}
              />
            );
          }
          
          return <span className="text-sm">{String(value)}</span>;
        },
      });
    });
  }, [columns, updatePokemon]);

  const filteredData = useMemo(() => {
    const term = filterText.trim().toLowerCase();
    if (!term) return pokemon;
    return pokemon.filter((p) =>
      (p.name?.toLowerCase()?.includes(term)) ||
      String(p.id).includes(term) ||
      (Array.isArray(p.types) && p.types.some(t => (t.type?.name || String(t)).toLowerCase().includes(term)))
    );
  }, [pokemon, filterText]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => document.querySelector('.pokemon-table-container'),
    estimateSize: () => 60,
    overscan: 10,
  });

  const handleExportCSV = () => {
    const { exportToCSV } = require('@/lib/csv');
    const csvContent = exportToCSV(
      pokemon,
      columns.filter(c => c.id !== 'addColumn').map(c => c.accessorKey)
    );
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pokemon-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size > 0) {
      deletePokemon(Array.from(selectedRows));
      setSelectedRows(new Set());
    }
  };

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  if (pokemon.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pokemon Data</h3>
        <p className="text-gray-500">Start by fetching data from the PokeAPI or uploading a CSV file above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
              Pokemon Dataset <span className="text-gray-500 font-normal">({filteredData.length} shown)</span>
            </h2>
            {selectedRows.size > 0 && (
              <span className="text-xs text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                {selectedRows.size} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search by name, id, or type..."
                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            {selectedRows.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            )}
            
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
        {/* Mobile search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search by name, id, or type..."
              className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pokemon-table-container overflow-auto" style={{ height: '600px' }}>
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(filteredData.map(p => p.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider ${
                      header.column.columnDef.id === 'id' || header.column.columnDef.id === 'sprite' 
                        ? 'sticky left-0 bg-gray-50 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]' 
                        : header.column.columnDef.id === 'addColumn'
                        ? 'sticky right-0 bg-gray-50 z-20 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]'
                        : ''
                    }`}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="text-gray-700">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '↕'}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 hover:bg-indigo-50/40 ${rows.indexOf(row) % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <td className="px-4 py-3 sticky left-0 bg-white z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.original.id)}
                      onChange={() => toggleRowSelection(row.original.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 align-middle ${
                        cell.column.columnDef.id === 'id' || cell.column.columnDef.id === 'sprite'
                          ? 'sticky left-0 bg-white z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]'
                          : cell.column.columnDef.id === 'addColumn'
                          ? 'sticky right-0 bg-white z-20 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)]'
                          : ''
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddColumn && <AddColumn onClose={() => setShowAddColumn(false)} />}
    </div>
  );
};

interface EditableCellProps {
  value: any;
  type: string;
  onChange: (value: any) => void;
}

const EditableCell = ({ value, type, onChange }: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSubmit = () => {
    let processedValue = editValue;
    
    if (type === 'number') {
      processedValue = Number(editValue) || 0;
    } else if (type === 'boolean') {
      processedValue = Boolean(editValue);
    }
    
    onChange(processedValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (type === 'boolean') {
      return (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value === 'true')}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }
    
    return (
      <input
        type={type === 'number' ? 'number' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-sm"
    >
      {type === 'boolean' ? (value ? 'True' : 'False') : String(value)}
    </div>
  );
};
