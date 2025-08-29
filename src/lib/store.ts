import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pokemon, ColumnDefinition } from '@/types/pokemon';

interface PokemonStore {
  pokemon: Pokemon[];
  columns: ColumnDefinition[];
  isLoading: boolean;
  fetchProgress: { current: number; total: number };
  setPokemon: (pokemon: Pokemon[]) => void;
  addPokemon: (pokemon: Pokemon) => void;
  updatePokemon: (id: number, updates: Partial<Pokemon>) => void;
  deletePokemon: (ids: number[]) => void;
  setLoading: (loading: boolean) => void;
  setFetchProgress: (progress: { current: number; total: number }) => void;
  addColumn: (column: ColumnDefinition) => void;
  removeColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<ColumnDefinition>) => void;
  resetStore: () => void;
}

const defaultColumns: ColumnDefinition[] = [
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
    type: 'number',
    editable: false,
    sticky: 'left',
  },
  {
    id: 'sprite',
    header: 'Sprite',
    accessorKey: 'sprites.front_default',
    type: 'image',
    editable: false,
    sticky: 'left',
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    type: 'text',
    editable: true,
  },
  {
    id: 'types',
    header: 'Type(s)',
    accessorKey: 'types',
    type: 'types',
    editable: false,
  },
  {
    id: 'hp',
    header: 'HP',
    accessorKey: 'stats.0.base_stat',
    type: 'number',
    editable: true,
  },
  {
    id: 'attack',
    header: 'Attack',
    accessorKey: 'stats.1.base_stat',
    type: 'number',
    editable: true,
  },
  {
    id: 'defense',
    header: 'Defense',
    accessorKey: 'stats.2.base_stat',
    type: 'number',
    editable: true,
  },
  {
    id: 'specialAttack',
    header: 'Sp. Atk',
    accessorKey: 'stats.3.base_stat',
    type: 'number',
    editable: true,
  },
  {
    id: 'specialDefense',
    header: 'Sp. Def',
    accessorKey: 'stats.4.base_stat',
    type: 'number',
    editable: true,
  },
  {
    id: 'speed',
    header: 'Speed',
    accessorKey: 'stats.5.base_stat',
    type: 'number',
    editable: true,
  },
  {
    id: 'addColumn',
    header: 'Add Column',
    accessorKey: 'addColumn',
    type: 'text',
    editable: false,
    sticky: 'right',
  },
];

export const usePokemonStore = create<PokemonStore>()(
  persist(
    (set, get) => ({
      pokemon: [],
      columns: defaultColumns,
      isLoading: false,
      fetchProgress: { current: 0, total: 0 },
      
      setPokemon: (pokemon) => set({ pokemon }),
      
      addPokemon: (pokemon) => set((state) => ({
        pokemon: [...state.pokemon, pokemon],
      })),
      
      updatePokemon: (id, updates) => set((state) => ({
        pokemon: state.pokemon.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),
      
      deletePokemon: (ids) => set((state) => ({
        pokemon: state.pokemon.filter((p) => !ids.includes(p.id)),
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setFetchProgress: (fetchProgress) => set({ fetchProgress }),
      
      addColumn: (column) => set((state) => {
        const newColumns = [...state.columns];
        // Insert before the last column (addColumn button)
        newColumns.splice(newColumns.length - 1, 0, column);
        
        // Add the new field to all pokemon with default value
        const updatedPokemon = state.pokemon.map((p) => {
          const defaultValue = column.type === 'number' ? 0 : 
                             column.type === 'boolean' ? false : '';
          return { ...p, [column.accessorKey]: defaultValue } as Pokemon;
        });
        
        return {
          columns: newColumns,
          pokemon: updatedPokemon,
        };
      }),
      
      removeColumn: (columnId) => set((state) => {
        const column = state.columns.find(c => c.id === columnId);
        if (!column) return state;
        
        const newColumns = state.columns.filter(c => c.id !== columnId);
        const updatedPokemon = state.pokemon.map((p) => {
          const { [column.accessorKey]: removed, ...rest } = p as any;
          return rest as Pokemon;
        });
        
        return {
          ...state,
          columns: newColumns,
          pokemon: updatedPokemon,
        };
      }),
      
      updateColumn: (columnId, updates) => set((state) => ({
        columns: state.columns.map((c) =>
          c.id === columnId ? { ...c, ...updates } : c
        ),
      })),
      
      resetStore: () => set({
        pokemon: [],
        columns: defaultColumns,
        isLoading: false,
        fetchProgress: { current: 0, total: 0 },
      }),
    }),
    {
      name: 'pokemon-store',
      // Persist only columns to avoid exceeding storage quota
      partialize: (state) => ({
        columns: state.columns,
      }),
    }
  )
);
