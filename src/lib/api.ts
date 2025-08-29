import { Pokemon, PokemonListResponse } from '@/types/pokemon';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit: number = 1302, offset: number = 0): Promise<PokemonListResponse> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon list');
  }
  return response.json();
};

export const fetchPokemonDetails = async (nameOrId: string | number): Promise<Pokemon> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${nameOrId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon details for ${nameOrId}`);
  }
  return response.json();
};

export const fetchAllPokemon = async (
  onProgress?: (current: number, total: number) => void
): Promise<Pokemon[]> => {
  try {
    // First, get the total count
    const listResponse = await fetchPokemonList(1, 0);
    const totalCount = listResponse.count;
    
    // Fetch all Pokemon in batches
    const batchSize = 20;
    const allPokemon: Pokemon[] = [];
    
    for (let offset = 0; offset < totalCount; offset += batchSize) {
      const batchResponse = await fetchPokemonList(batchSize, offset);
      
      // Fetch details for each Pokemon in the batch
      const batchPromises = batchResponse.results.map(async (pokemon) => {
        try {
          const details = await fetchPokemonDetails(pokemon.name);
          return details;
        } catch (error) {
          console.error(`Failed to fetch details for ${pokemon.name}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(Boolean) as Pokemon[];
      allPokemon.push(...validResults);
      
      // Update progress
      onProgress?.(allPokemon.length, totalCount);
      
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return allPokemon;
  } catch (error) {
    console.error('Error fetching all Pokemon:', error);
    throw error;
  }
};

export const getStatValue = (pokemon: Pokemon, statName: string): number => {
  const stat = pokemon.stats.find(s => s.stat.name === statName);
  return stat?.base_stat || 0;
};

export const getTypeNames = (pokemon: Pokemon): string[] => {
  return pokemon.types.map(t => t.type.name);
};

