import { AICommand } from '@/types/pokemon';

export const parseAICommand = (command: string): AICommand | null => {
  const lowerCommand = command.toLowerCase().trim();
  
  // Pattern: "set [field] to [value] for all pokemon of type '[type]'"
  const setPattern = /set\s+(\w+)\s+to\s+([^for]+)\s+for\s+all\s+pokemon\s+of\s+type\s+'([^']+)'/i;
  const setMatch = lowerCommand.match(setPattern);
  if (setMatch) {
    return {
      type: 'set',
      field: setMatch[1],
      value: setMatch[2].trim(),
      condition: {
        field: 'types',
        operator: 'contains',
        value: setMatch[3],
      },
    };
  }
  
  // Pattern: "delete rows where [field] is [value]"
  const deletePattern = /delete\s+rows?\s+where\s+(\w+)\s+is\s+([^']+)/i;
  const deleteMatch = lowerCommand.match(deletePattern);
  if (deleteMatch) {
    return {
      type: 'delete',
      field: deleteMatch[1],
      value: deleteMatch[2].trim(),
    };
  }
  
  // Pattern: "update [field] to '[value]' where [condition_field] is [condition_value]"
  const updatePattern = /update\s+(\w+)\s+to\s+'([^']+)'\s+where\s+(\w+)\s+is\s+([^']+)/i;
  const updateMatch = lowerCommand.match(updatePattern);
  if (updateMatch) {
    return {
      type: 'update',
      field: updateMatch[1],
      value: updateMatch[2],
      condition: {
        field: updateMatch[3],
        operator: 'equals',
        value: updateMatch[4],
      },
    };
  }
  
  // Pattern: "set [field] to [value] for pokemon with [condition_field] [operator] [condition_value]"
  const setConditionPattern = /set\s+(\w+)\s+to\s+([^for]+)\s+for\s+pokemon\s+with\s+(\w+)\s+(greater|less|equals)\s+([^']+)/i;
  const setConditionMatch = lowerCommand.match(setConditionPattern);
  if (setConditionMatch) {
    return {
      type: 'set',
      field: setConditionMatch[1],
      value: setConditionMatch[2].trim(),
      condition: {
        field: setConditionMatch[3],
        operator: setConditionMatch[4] as 'greater' | 'less' | 'equals',
        value: setConditionMatch[5],
      },
    };
  }
  
  return null;
};

export const executeAICommand = (
  command: AICommand,
  pokemon: any[]
): { success: boolean; message: string; updatedPokemon: any[] } => {
  try {
    let updatedPokemon = [...pokemon];
    let affectedCount = 0;
    
    switch (command.type) {
      case 'set':
        updatedPokemon = updatedPokemon.map((p) => {
          if (command.condition) {
            const shouldUpdate = evaluateCondition(p, command.condition);
            if (shouldUpdate) {
              affectedCount++;
              return { ...p, [command.field]: command.value };
            }
          } else {
            affectedCount++;
            return { ...p, [command.field]: command.value };
          }
          return p;
        });
        break;
        
      case 'update':
        updatedPokemon = updatedPokemon.map((p) => {
          if (command.condition) {
            const shouldUpdate = evaluateCondition(p, command.condition);
            if (shouldUpdate) {
              affectedCount++;
              return { ...p, [command.field]: command.value };
            }
          }
          return p;
        });
        break;
        
      case 'delete':
        const beforeCount = updatedPokemon.length;
        updatedPokemon = updatedPokemon.filter((p) => {
          if (command.condition) {
            return !evaluateCondition(p, command.condition);
          }
          return p[command.field] !== command.value;
        });
        affectedCount = beforeCount - updatedPokemon.length;
        break;
    }
    
    return {
      success: true,
      message: `Successfully ${command.type} operation. ${affectedCount} Pokemon affected.`,
      updatedPokemon,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error executing command: ${error}`,
      updatedPokemon: pokemon,
    };
  }
};

const evaluateCondition = (pokemon: any, condition: AICommand['condition']): boolean => {
  if (!condition) return true;
  
  const fieldValue = getNestedValue(pokemon, condition.field);
  const conditionValue = condition.value;
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === conditionValue;
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(v => 
          typeof v === 'object' ? v.name === conditionValue : v === conditionValue
        );
      }
      return String(fieldValue).includes(conditionValue);
    case 'greater':
      return Number(fieldValue) > Number(conditionValue);
    case 'less':
      return Number(fieldValue) < Number(conditionValue);
    default:
      return false;
  }
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

