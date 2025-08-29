import { useQuery } from '@tanstack/react-query';
import { usePokemonStore } from '@/lib/store';
import { fetchAllPokemon } from '@/lib/api';

export const usePokemonData = () => {
  const { 
    pokemon, 
    setPokemon, 
    setLoading, 
    setFetchProgress,
    isLoading: storeLoading 
  } = usePokemonStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pokemon'],
    queryFn: () => fetchAllPokemon((current, total) => {
      setFetchProgress({ current, total });
    }),
    enabled: false, // Don't fetch automatically
    staleTime: Infinity, // Keep data fresh indefinitely
    gcTime: Infinity, // Never garbage collect
  });

  const fetchPokemonData = async () => {
    setLoading(true);
    try {
      const result = await refetch();
      if (result.data) {
        setPokemon(result.data);
      }
    } catch (error) {
      console.error('Error fetching Pokemon data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    pokemon,
    isLoading: storeLoading || isLoading,
    error,
    fetchPokemonData,
    hasData: pokemon.length > 0,
  };
};

