import Papa from 'papaparse';
import { Pokemon, CSVColumnMapping } from '@/types/pokemon';

export interface CSVParseResult {
  headers: string[];
  data: any[][];
  totalRows: number;
}

export const parseCSVFile = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<CSVParseResult> => {
  return new Promise((resolve, reject) => {
    let totalRows = 0;
    let processedRows = 0;
    const allData: any[][] = [];
    let headers: string[] = [];

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      chunk: (results, parser) => {
        if (results.data.length === 0) return;

        if (headers.length === 0) {
          headers = results.data[0] as string[];
          // Estimate total rows based on file size
          totalRows = Math.ceil(file.size / 100); // Rough estimate
        } else {
          allData.push(...(results.data as any[][]));
        }

        processedRows += results.data.length;
        onProgress?.(processedRows / totalRows);

        // Continue parsing
        parser.resume();
      },
      complete: () => {
        resolve({
          headers,
          data: allData,
          totalRows: processedRows,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const mapCSVToPokemon = (
  csvData: any[][],
  mappings: CSVColumnMapping[]
): Pokemon[] => {
  return csvData.map((row, index) => {
    const pokemon: Partial<Pokemon> = {
      id: index + 1,
      name: '',
      types: [],
      stats: [],
      abilities: [],
      sprites: {
        front_default: '',
        front_shiny: '',
        front_female: '',
        front_shiny_female: '',
        back_default: '',
        back_shiny: '',
        back_female: '',
        back_shiny_female: '',
      },
      species: { name: '', url: '' },
    };

    mappings.forEach((mapping) => {
      const csvIndex = parseInt(mapping.csvColumn);
      const value = row[csvIndex];

      if (mapping.targetField === 'name') {
        pokemon.name = String(value);
      } else if (mapping.targetField === 'types') {
        if (typeof value === 'string') {
          pokemon.types = value.split('/').map((type, slot) => ({
            slot,
            type: { name: type.trim(), url: '' },
          }));
        }
      } else if (mapping.targetField.startsWith('stats.')) {
        const statIndex = parseInt(mapping.targetField.split('.')[1]);
        const statName = mapping.targetField.split('.')[2];
        
        if (!pokemon.stats) pokemon.stats = [];
        if (!pokemon.stats[statIndex]) {
          pokemon.stats[statIndex] = {
            base_stat: 0,
            effort: 0,
            stat: { name: statName, url: '' },
          };
        }
        
        if (mapping.dataType === 'number') {
          pokemon.stats[statIndex].base_stat = Number(value) || 0;
        }
      } else {
        // Handle custom fields
        if (mapping.dataType === 'number') {
          (pokemon as any)[mapping.targetField] = Number(value) || 0;
        } else if (mapping.dataType === 'boolean') {
          (pokemon as any)[mapping.targetField] = Boolean(value);
        } else {
          (pokemon as any)[mapping.targetField] = String(value);
        }
      }
    });

    return pokemon as Pokemon;
  });
};

export const exportToCSV = (data: any[], columns: string[]): string => {
  const csvContent = [
    columns.join(','),
    ...data.map(row => 
      columns.map(col => {
        const value = col.includes('.') 
          ? col.split('.').reduce((obj, key) => obj?.[key], row)
          : row[col];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};
