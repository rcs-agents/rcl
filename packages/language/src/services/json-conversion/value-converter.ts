import type { 
  Value,
  TypeTag as TypeConversion,
  ConfigProperty as Attribute,
  DefaultProperty,
  ListValue,
  DictionaryValue
} from '../../parser/ast/index.js';
import { 
  isTypeTag as isTypeConversion,
  isListValue,
  isDictionaryValue,
  isStringValue,
  isNumberValue,
  isBooleanValue,
  isNullValue,
  isAtomValue
} from '../../parser/ast/index.js';

/**
 * Converts RCL AST values to JSON-compatible values
 * Note: Simplified implementation for current grammar structure
 */
export class ValueConverter {
  
  /**
   * Convert any RCL Value to a JSON-compatible value
   */
  convertValue(value: Value | undefined): any {
    if (!value) {
      return null;
    }

    if (isTypeConversion(value)) {
      return this.convertTypeConversion(value);
    }

    if (isDictionaryValue(value)) {
      return this.convertObject(value);
    }

    if (isListValue(value)) {
      return this.convertList(value);
    }

    // Handle typed values based on their type
    if (isStringValue(value)) {
      return this.convertStringValue(value.value);
    }

    if (isNumberValue(value)) {
      return value.value;
    }

    if (isBooleanValue(value)) {
      return value.value;
    }

    if (isNullValue(value)) {
      return null;
    }

    if (isAtomValue(value)) {
      return value.value;
    }

    // Fallback: return as string
    return String(value);
  }

  /**
   * Convert simple string values (remove quotes, handle booleans, etc.)
   */
  private convertStringValue(str: string): any {
    if (!str) return null;

    // Remove quotes from string literals
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }

    // Handle boolean values
    const truthyValues = ['True', 'On', 'Yes', 'Active', 'Enabled'];
    const falsyValues = ['False', 'Off', 'No', 'Inactive', 'Disabled'];
    if (truthyValues.includes(str)) return true;
    if (falsyValues.includes(str)) return false;

    // Handle null values
    if (['Null', 'None', 'Void'].includes(str)) {
      return null;
    }

    // Handle numbers
    const numValue = Number(str);
    if (!isNaN(numValue) && isFinite(numValue)) {
      return numValue;
    }

    // Handle atoms (remove colon prefix)
    if (str.startsWith(':')) {
      return str.slice(1);
    }

    return str;
  }

  /**
   * Convert RCL TypeConversion to JSON value
   */
  private convertTypeConversion(typeConversion: TypeConversion): any {
    // TypeTag.value is already a string, not a Value object
    const value = typeConversion.value;
    
    // Create a placeholder object for type conversions that need post-processing
    return {
      target: typeConversion.typeName,
      value: value,
      __rclTypeConversion: true
    };
  }

  /**
   * Convert RCL Object (DictionaryValue) to JSON object
   */
  private convertObject(obj: DictionaryValue): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const entry of obj.entries || []) {
      // entry.key is already a string in the new AST
      const key = entry.key;
      const value = this.convertValue(entry.value);
      if (key && typeof key === 'string') {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Convert RCL List to JSON array
   */
  private convertList(list: ListValue): any[] {
    const result: any[] = [];
    
    for (const item of list.items || []) {
      result.push(this.convertValue(item));
    }
    
    return result;
  }

  /**
   * Convert array of attributes to JSON object
   */
  convertAttributes(attributes: (Attribute | DefaultProperty)[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const attr of attributes) {
      if (attr.key) {
        result[attr.key] = this.convertValue(attr.value);
      }
    }
    
    return result;
  }

  /**
   * Extract string value from various value types
   */
  extractStringValue(value: any): string | null {
    if (typeof value === 'string') {
      return value;
    }
    
    if (value && typeof value === 'object' && value.__rclTypeConversion) {
      return this.extractStringValue(value.value);
    }
    
    if (value && isStringValue(value)) {
      return value.value;
    }
    
    return value ? String(value) : null;
  }
} 