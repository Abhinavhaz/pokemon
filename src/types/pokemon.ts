export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  front_female: string;
  front_shiny_female: string;
  back_default: string;
  back_shiny: string;
  back_female: string;
  back_shiny_female: string;
}

export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: PokemonSprites;
  species: {
    name: string;
    url: string;
  };
  generation?: number;
  [key: string]: any; // For dynamic columns
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface ColumnDefinition {
  id: string;
  header: string;
  accessorKey: string;
  type: 'text' | 'number' | 'boolean' | 'image' | 'types';
  editable?: boolean;
  sticky?: 'left' | 'right';
}

export interface CSVColumnMapping {
  csvColumn: string;
  targetField: string;
  dataType: 'text' | 'number' | 'boolean';
}

export interface AICommand {
  type: 'set' | 'delete' | 'update';
  field: string;
  value: any;
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: any;
  };
}

