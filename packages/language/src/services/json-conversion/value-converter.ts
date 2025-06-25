import type { 
  Value, 
  LiteralValue, 
  Identifier, 
  TypeConversion, 
  Dictionary, 
  ExplicitMap, 
  List,
  Attribute,
  DictionaryEntry
} from '../../generated/ast.js';
import { 
  isLiteralValue, 
  isIdentifier, 
  isTypeConversion, 
  isDictionary, 
  isExplicitMap, 
  isList,
  isIndentedList,
  isInlineList
} from '../../generated/ast.js';

/**
 * Converts RCL AST values to JSON-compatible values
 */
export class ValueConverter {
  
  /**
   * Convert any RCL Value to a JSON-compatible value
   */
  convertValue(value: Value | undefined): any {
    if (!value) {
      return null;
    }

    if (isLiteralValue(value)) {
      return this.convertLiteralValue(value);
    }

    if (isIdentifier(value)) {
      return this.convertIdentifier(value);
    }

    if (isTypeConversion(value)) {
      return this.convertTypeConversion(value);
    }

    if (isDictionary(value)) {
      return this.convertDictionary(value);
    }

    if (isExplicitMap(value)) {
      return this.convertExplicitMap(value);
    }

    if (isList(value)) {
      return this.convertList(value);
    }

    // Fallback: return string representation
    return value.$cstNode?.text || null;
  }

  /**
   * Convert RCL LiteralValue to JSON value
   */
  private convertLiteralValue(literal: LiteralValue): any {
    if (literal.val_str !== undefined) {
      // Remove quotes from string literals
      return literal.val_str.replace(/^"|"$/g, '');
    }

    if (literal.val_num !== undefined) {
      return literal.val_num;
    }

    if (literal.val_bool !== undefined) {
      return this.convertBooleanValue(literal.val_bool.value);
    }

    if (literal.val_atom !== undefined) {
      // Convert atoms (e.g., :TRANSACTIONAL) to strings without the colon
      return literal.val_atom.startsWith(':') ? literal.val_atom.slice(1) : literal.val_atom;
    }

    if (literal.val_null !== undefined) {
      return null;
    }

    return null;
  }

  /**
   * Convert RCL boolean values to JSON boolean
   */
  private convertBooleanValue(boolValue: string): boolean {
    const truthyValues = ['True', 'On', 'Yes', 'Active', 'Enabled'];
    return truthyValues.includes(boolValue);
  }

  /**
   * Convert RCL Identifier to JSON value
   */
  private convertIdentifier(identifier: Identifier): string {
    return identifier.value || '';
  }

  /**
   * Convert RCL TypeConversion to JSON value
   */
  private convertTypeConversion(typeConversion: TypeConversion): any {
    // For now, return the converted value as a placeholder
    // In a more complete implementation, this would apply the type conversion
    const value = this.convertValue(typeConversion.value as Value);
    
    // Create a placeholder object for type conversions that need post-processing
    return {
      type: typeConversion.type,
      value: value,
      modifier: typeConversion.modifier,
      __rclTypeConversion: true
    };
  }

  /**
   * Convert RCL Dictionary to JSON object
   */
  private convertDictionary(dictionary: Dictionary): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const entry of dictionary.entries) {
      const key = this.convertDictionaryKey(entry);
      const value = this.convertValue(entry.value);
      if (key) {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Convert RCL ExplicitMap to JSON object
   */
  private convertExplicitMap(map: ExplicitMap): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const entry of map.entries) {
      const key = entry.key;
      const value = this.convertValue(entry.value);
      if (key) {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Convert RCL List to JSON array
   */
  private convertList(list: List): any[] {
    if (isIndentedList(list)) {
      return list.items.map(item => this.convertValue(item.item as Value));
    }
    
    if (isInlineList(list)) {
      const result: any[] = [];
      
      // Handle first item
      if (list.firstSimpleListItem) {
        result.push(this.convertValue(list.firstSimpleListItem as Value));
      }
      if (list.firstNestedListItem) {
        result.push(this.convertValue(list.firstNestedListItem as unknown as Value));
      }
      
      // Handle second item
      if (list.secondListItem) {
        result.push(this.convertValue(list.secondListItem as Value));
      }
      
      // Handle remaining items
      for (const item of list.remainingItems || []) {
        result.push(this.convertValue(item as Value));
      }
      
      // Handle subsequent items
      for (const item of list.subsequentItems || []) {
        result.push(this.convertValue(item as Value));
      }
      
      return result;
    }
    
    return [];
  }

  /**
   * Convert dictionary entry key to string
   */
  private convertDictionaryKey(entry: DictionaryEntry): string | null {
    if (typeof entry.key === 'string') {
      return entry.key;
    }
    
    if (isIdentifier(entry.key)) {
      return entry.key.value || '';
    }
    
    return (entry.key as any)?.$cstNode?.text || null;
  }

  /**
   * Convert RCL attributes to a JSON object
   */
  convertAttributes(attributes: Attribute[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const attr of attributes) {
      if (attr.key) {
        result[attr.key] = this.convertValue(attr.value as Value);
      }
    }
    
    return result;
  }

  /**
   * Extract string value from various RCL constructs
   */
  extractStringValue(value: any): string | null {
    if (typeof value === 'string') {
      return value;
    }
    
    if (value && typeof value === 'object' && value.__rclTypeConversion) {
      return this.extractStringValue(value.value);
    }
    
    if (value && value.$cstNode) {
      return value.$cstNode.text;
    }
    
    return value ? String(value) : null;
  }
} 