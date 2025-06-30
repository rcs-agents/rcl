import type { ValidationAcceptor } from 'langium';
import type { TypeConversion } from '../generated/ast.js';
import { isTypeConversion } from '../generated/ast.js';
import { KW } from '../constants.js';

/**
 * Validates type conversions and type constraints.
 */
export class TypeValidator {
  constructor() {
    // Constructor simplified for current grammar implementation
  }

  /**
   * Validate a TypeConversion node
   */
  checkTypeConversion(typeConversion: TypeConversion, accept: ValidationAcceptor): void {
    const typeName = typeConversion.target;
    const value = this.getTypeConversionValue(typeConversion);

    if (!typeName) {
      accept('error', 'Type conversion must specify a target type', {
        node: typeConversion,
        property: 'target',
        code: 'missing-type'
      });
      return;
    }

    const validator = this.getTypeValidator(typeName);
    if (!validator) {
      accept('error', `Unknown type: ${typeName}`, {
        node: typeConversion,
        property: 'target',
        code: 'unknown-type'
      });
      return;
    }

    if (!value) {
      accept('error', 'Type conversion must have a value', {
        node: typeConversion,
        property: 'value',
        code: 'missing-type-value'
      });
      return;
    }

    const validationResult = validator(value);
    if (!validationResult.isValid) {
      accept('error', `Invalid ${typeName}: ${validationResult.message}`, {
        node: typeConversion,
        property: 'value',
        code: 'invalid-type-value'
      });
    }
  }

  /**
   * Get the string value from SimpleValue
   */
  private getTypeConversionValue(typeConversion: TypeConversion): string | undefined {
    const value = typeConversion.value;
    if (!value) return undefined;

    // Handle SimpleValue with a value property
    if (value.value) {
      return value.value;
    }

    // For nested TypeConversion
    if (isTypeConversion(value)) {
      return this.getTypeConversionValue(value);
    }

    // Try to extract from CST if available
    if (value.$cstNode) {
      return value.$cstNode.text;
    }

    return undefined;
  }

  /**
   * Get type validator function for a given type name
   */
  private getTypeValidator(typeName: string): TypeValidatorFunction | undefined {
    const validators: Record<string, TypeValidatorFunction> = {
      [KW.Date]: this.validateDate,
      [KW.Time]: this.validateTime,
      [KW.Datetime]: this.validateDateTime,
      [KW.Email]: this.validateEmail,
      [KW.Phone]: this.validatePhone,
      [KW.Url]: this.validateUrl,
      'duration': this.validateDuration,
      'number': this.validateNumber,
      'integer': this.validateInteger,
      'float': this.validateFloat,
      'currency': this.validateCurrency,
      'percentage': this.validatePercentage,
      'latitude': this.validateLatitude,
      'longitude': this.validateLongitude,
      'coordinate': this.validateCoordinate
    };

    return validators[typeName];
  }

  /**
   * Validate email format
   */
  private validateEmail = (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(value),
      message: emailRegex.test(value) ? '' : 'Invalid email format (expected: user@domain.com)'
    };
  };

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private validateDate = (value: string): ValidationResult => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return { isValid: false, message: 'Date must be in YYYY-MM-DD format (e.g., 2024-12-25)' };
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const isValidDate = date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;

    return {
      isValid: isValidDate,
      message: isValidDate ? '' : 'Invalid date value (e.g., February 30th does not exist)'
    };
  };

  /**
   * Validate time format (HH:MM or HH:MM:SS)
   */
  private validateTime = (value: string): ValidationResult => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return {
      isValid: timeRegex.test(value),
      message: timeRegex.test(value) ? '' : 'Time must be in HH:MM or HH:MM:SS format (e.g., 14:30:00)'
    };
  };

  /**
   * Validate datetime format (ISO 8601)
   */
  private validateDateTime = (value: string): ValidationResult => {
    try {
      const date = new Date(value);
      const isValid = !isNaN(date.getTime()) && value.includes('T');
      return {
        isValid,
        message: isValid ? '' : 'DateTime must be in ISO 8601 format (e.g., 2024-12-25T14:30:00Z)'
      };
    } catch {
      return { isValid: false, message: 'Invalid datetime format' };
    }
  };

  /**
   * Validate duration format
   */
  private validateDuration = (value: string): ValidationResult => {
    const durationRegex = /^(\d+)(ms|s|m|h|d|w|y)$/;
    const match = durationRegex.exec(value);

    if (!match) {
      return {
        isValid: false,
        message: 'Duration must be a number followed by a unit: ms, s, m, h, d, w, y (e.g., 30s, 5m, 2h)'
      };
    }

    const [, amount] = match;
    const numericAmount = parseInt(amount, 10);

    if (numericAmount <= 0) {
      return { isValid: false, message: 'Duration must be positive' };
    }

    return { isValid: true, message: '' };
  };

  /**
   * Validate phone number
   */
  private validatePhone = (value: string): ValidationResult => {
    // Clean phone number (remove spaces, dashes, parentheses)
    const cleaned = value.replace(/[\s\-\(\)]/g, '');

    // International phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return {
      isValid: phoneRegex.test(cleaned),
      message: phoneRegex.test(cleaned) ? '' : 'Invalid phone number format (expected: +1234567890 or international format)'
    };
  };

  /**
   * Validate URL format
   */
  private validateUrl = (value: string): ValidationResult => {
    try {
      new URL(value);
      return { isValid: true, message: '' };
    } catch {
      return { isValid: false, message: 'Invalid URL format (expected: https://example.com)' };
    }
  };

  /**
   * Validate number format
   */
  private validateNumber = (value: string): ValidationResult => {
    const numValue = parseFloat(value);
    return {
      isValid: !isNaN(numValue) && isFinite(numValue),
      message: !isNaN(numValue) && isFinite(numValue) ? '' : 'Invalid number format'
    };
  };

  /**
   * Validate integer format
   */
  private validateInteger = (value: string): ValidationResult => {
    const intValue = parseInt(value, 10);
    const isValid = !isNaN(intValue) && intValue.toString() === value;
    return {
      isValid,
      message: isValid ? '' : 'Invalid integer format (no decimal points allowed)'
    };
  };

  /**
   * Validate float format
   */
  private validateFloat = (value: string): ValidationResult => {
    const floatValue = parseFloat(value);
    return {
      isValid: !isNaN(floatValue) && isFinite(floatValue),
      message: !isNaN(floatValue) && isFinite(floatValue) ? '' : 'Invalid float format'
    };
  };

  /**
   * Validate currency format
   */
  private validateCurrency = (value: string): ValidationResult => {
    const currencyRegex = /^\d+(\.\d{1,2})?$/;
    return {
      isValid: currencyRegex.test(value),
      message: currencyRegex.test(value) ? '' : 'Currency must be a positive number with up to 2 decimal places (e.g., 19.99)'
    };
  };

  /**
   * Validate percentage format
   */
  private validatePercentage = (value: string): ValidationResult => {
    const percentage = parseFloat(value);
    const isValid = !isNaN(percentage) && percentage >= 0 && percentage <= 100;
    return {
      isValid,
      message: isValid ? '' : 'Percentage must be a number between 0 and 100'
    };
  };

  /**
   * Validate latitude
   */
  private validateLatitude = (value: string): ValidationResult => {
    const lat = parseFloat(value);
    const isValid = !isNaN(lat) && lat >= -90 && lat <= 90;
    return {
      isValid,
      message: isValid ? '' : 'Latitude must be a number between -90 and 90'
    };
  };

  /**
   * Validate longitude
   */
  private validateLongitude = (value: string): ValidationResult => {
    const lng = parseFloat(value);
    const isValid = !isNaN(lng) && lng >= -180 && lng <= 180;
    return {
      isValid,
      message: isValid ? '' : 'Longitude must be a number between -180 and 180'
    };
  };

  /**
   * Validate coordinate (lat,lng format)
   */
  private validateCoordinate = (value: string): ValidationResult => {
    const coordRegex = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;
    const match = coordRegex.exec(value);

    if (!match) {
      return {
        isValid: false,
        message: 'Coordinate must be in "latitude,longitude" format (e.g., 40.7128,-74.0060)'
      };
    }

    const [, latStr, lngStr] = match;
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const latValid = lat >= -90 && lat <= 90;
    const lngValid = lng >= -180 && lng <= 180;

    if (!latValid) {
      return { isValid: false, message: 'Latitude must be between -90 and 90' };
    }
    if (!lngValid) {
      return { isValid: false, message: 'Longitude must be between -180 and 180' };
    }

    return { isValid: true, message: '' };
  };


}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Type validator function signature
 */
export type TypeValidatorFunction = (value: string) => ValidationResult;