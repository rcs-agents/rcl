/**
 * Result pattern implementation for type-safe error handling
 * Inspired by Effect and neverthrow libraries but lightweight and focused
 */

import type { GrammarError, GrammarValidationError } from './types.js';

// Core Result types
export interface Ok<T> {
  readonly _tag: 'Ok';
  readonly value: T;
}

export interface Error<E> {
  readonly _tag: 'Error';
  readonly error: E;
}

export type ResultType<T, E = unknown> = Ok<T> | Error<E>;

// Construction functions
export function ok<T>(value: T): Ok<T> {
  return { _tag: 'Ok', value };
}

export function error<E>(error: E): Error<E> {
  return { _tag: 'Error', error };
}

// Type guards that force error checking
export function isOk<T, E>(result: ResultType<T, E>): result is Ok<T> {
  return result._tag === 'Ok';
}

export function isError<T, E>(result: ResultType<T, E>): result is Error<E> {
  return result._tag === 'Error';
}

// Utility class for chaining operations
export class ResultUtils<T, E> {
  constructor(private result: ResultType<T, E>) {}

  /**
   * Transform the Ok value, leave Error unchanged
   */
  map<U>(fn: (value: T) => U): ResultUtils<U, E> {
    if (isOk(this.result)) {
      return new ResultUtils(ok(fn(this.result.value)));
    }
    return new ResultUtils(this.result as Error<E>);
  }

  /**
   * Transform the Error value, leave Ok unchanged
   */
  mapError<F>(fn: (error: E) => F): ResultUtils<T, F> {
    if (isError(this.result)) {
      return new ResultUtils(error(fn(this.result.error)));
    }
    return new ResultUtils(this.result as Ok<T>);
  }

  /**
   * Chain operations that return Results (flatMap/bind)
   */
  flatMap<U, F>(fn: (value: T) => ResultType<U, F>): ResultUtils<U, E | F> {
    if (isOk(this.result)) {
      return new ResultUtils(fn(this.result.value));
    }
    return new ResultUtils(this.result as Error<E>);
  }

  /**
   * Execute a side effect on Ok values
   */
  tap(fn: (value: T) => void): ResultUtils<T, E> {
    if (isOk(this.result)) {
      fn(this.result.value);
    }
    return this;
  }

  /**
   * Execute a side effect on Error values
   */
  tapError(fn: (error: E) => void): ResultUtils<T, E> {
    if (isError(this.result)) {
      fn(this.result.error);
    }
    return this;
  }

  /**
   * Extract the value, throwing on Error
   */
  unwrap(): T {
    if (isOk(this.result)) {
      return this.result.value;
    }
    throw this.result.error;
  }

  /**
   * Extract the value or return a default
   */
  unwrapOr(defaultValue: T): T {
    if (isOk(this.result)) {
      return this.result.value;
    }
    return defaultValue;
  }

  /**
   * Extract the value or compute a default
   */
  unwrapOrElse(fn: (error: E) => T): T {
    if (isOk(this.result)) {
      return this.result.value;
    }
    return fn(this.result.error);
  }

  /**
   * Pattern matching for both Ok and Error cases
   */
  match<U>(onOk: (value: T) => U, onError: (error: E) => U): U {
    if (isOk(this.result)) {
      return onOk(this.result.value);
    }
    return onError(this.result.error);
  }

  /**
   * Convert to Promise
   */
  toPromise(): Promise<T> {
    if (isOk(this.result)) {
      return Promise.resolve(this.result.value);
    }
    return Promise.reject(this.result.error);
  }

  /**
   * Get the underlying Result
   */
  get(): ResultType<T, E> {
    return this.result;
  }
}

// Functional composition helper
export function pipe<T, E>(result: ResultType<T, E>): ResultUtils<T, E> {
  return new ResultUtils(result);
}

// Promise integration
export async function fromPromise<T>(
  promise: Promise<T>
): Promise<ResultType<T, unknown>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (err) {
    return error(err);
  }
}

export function toPromise<T, E>(result: ResultType<T, E>): Promise<T> {
  if (isOk(result)) {
    return Promise.resolve(result.value);
  }
  return Promise.reject(result.error);
}

// Convert throwing functions to Results
export function fromThrowable<T, Args extends readonly unknown[]>(
  fn: (...args: Args) => T
) {
  return (...args: Args): ResultType<T, unknown> => {
    try {
      return ok(fn(...args));
    } catch (err) {
      return error(err);
    }
  };
}

export async function fromThrowableAsync<T, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<T>
) {
  return async (...args: Args): Promise<ResultType<T, unknown>> => {
    try {
      const value = await fn(...args);
      return ok(value);
    } catch (err) {
      return error(err);
    }
  };
}

// Combine multiple Results
export function all<T, E>(
  results: readonly ResultType<T, E>[]
): ResultType<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (isError(result)) {
      return result;
    }
    values.push(result.value);
  }
  return ok(values);
}

export function allSettled<T, E>(
  results: readonly ResultType<T, E>[]
): ResultType<T[], E[]> {
  const values: T[] = [];
  const errors: E[] = [];
  
  for (const result of results) {
    if (isOk(result)) {
      values.push(result.value);
    } else {
      errors.push(result.error);
    }
  }
  
  if (errors.length > 0) {
    return error(errors);
  }
  return ok(values);
}

// Utility namespace
export const Result = {
  ok,
  error,
  isOk,
  isError,
  pipe,
  fromPromise,
  toPromise,
  fromThrowable,
  fromThrowableAsync,
  all,
  allSettled
} as const;

// Type aliases for common use cases in this project
export type ValidationResult<T> = ResultType<T, GrammarValidationError>;
export type GrammarResult<T> = ResultType<T, GrammarError>;
export type StringResult<T> = ResultType<T, string>;