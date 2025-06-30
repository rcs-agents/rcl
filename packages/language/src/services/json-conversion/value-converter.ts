import type { 
  SimpleValue,
  TypeConversion,
  Attribute,
  ParenthesesList,
  InlineList,
  IndentedList,
  BraceObject,
  IndentedObject
} from '../../generated/ast.js';
import { 
  isTypeConversion,
  isParenthesesList,
  isInlineList,
  isIndentedList,
  isBraceObject,
  isIndentedObject
} from '../../generated/ast.js';

/**
 * Converts RCL AST values to JSON-compatible values
 * Note: Simplified implementation for current grammar structure
 */
export class ValueConverter {
  
  /**
   * Convert any RCL SimpleValue to a JSON-compatible value
   */
  convertValue(value: SimpleValue | undefined): any {
    if (!value) {
      return null;
    }

    if (isTypeConversion(value)) {
      return this.convertTypeConversion(value);
    }

    if (isBraceObject(value) || isIndentedObject(value)) {
      return this.convertObject(value);
    }

    if (isParenthesesList(value) || isInlineList(value) || isIndentedList(value)) {
      return this.convertList(value);
    }

    // Handle simple string values
    if (value.value !== undefined) {
      return this.convertStringValue(value.value);
    }

    // Fallback: return string representation from CST
    return value.$cstNode?.text?.trim() || null;
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
    const value = this.convertValue(typeConversion.value);
    
    // Create a placeholder object for type conversions that need post-processing
    return {
      target: typeConversion.target,
      value: value,
      __rclTypeConversion: true
    };
  }

  /**
   * Convert RCL Object (BraceObject or IndentedObject) to JSON object
   */
  private convertObject(obj: BraceObject | IndentedObject): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const pair of obj.pairs || []) {
      const key = this.convertValue(pair.key);
      const value = this.convertValue(pair.value);
      if (key && typeof key === 'string') {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Convert RCL List to JSON array
   */
  private convertList(list: ParenthesesList | InlineList | IndentedList): any[] {
    const result: any[] = [];
    
    for (const item of list.items || []) {
      result.push(this.convertValue(item));
    }
    
    return result;
  }

  /**
   * Convert array of attributes to JSON object
   */
  convertAttributes(attributes: Attribute[]): Record<string, any> {
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
    
    if (value && value.$cstNode) {
      return value.$cstNode.text?.trim() || null;
    }
    
    return value ? String(value) : null;
  }
} 