/**
 * RIDLY Mobile SDK - Error Utilities
 *
 * Error handling utilities and custom error classes.
 */

import type { ErrorType } from '../components/error';

/**
 * Base error class for RIDLY SDK errors
 */
export class RidlyError extends Error {
  public readonly code: string;
  public readonly type: ErrorType;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    type: ErrorType = 'generic',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RidlyError';
    this.code = code;
    this.type = type;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RidlyError);
    }
  }
}

/**
 * Network error class
 */
export class NetworkError extends RidlyError {
  constructor(message = 'Network request failed', details?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', 'network', details);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication error class
 */
export class AuthError extends RidlyError {
  constructor(message = 'Authentication required', details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 'auth', details);
    this.name = 'AuthError';
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends RidlyError {
  constructor(message = 'Resource not found', details?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', 'notFound', details);
    this.name = 'NotFoundError';
  }
}

/**
 * Server error class
 */
export class ServerError extends RidlyError {
  public readonly statusCode: number;

  constructor(
    message = 'Server error',
    statusCode = 500,
    details?: Record<string, unknown>
  ) {
    super(message, 'SERVER_ERROR', 'server', details);
    this.name = 'ServerError';
    this.statusCode = statusCode;
  }
}

/**
 * Validation error class
 */
export class ValidationError extends RidlyError {
  public readonly fields: Record<string, string>;

  constructor(message = 'Validation failed', fields: Record<string, string> = {}) {
    super(message, 'VALIDATION_ERROR', 'generic', { fields });
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Determines error type from any error
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof RidlyError) {
    return error.type;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (
      name.includes('network') ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('offline')
    ) {
      return 'network';
    }

    // Auth errors
    if (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('unauthenticated') ||
      message.includes('forbidden') ||
      message.includes('401') ||
      message.includes('403')
    ) {
      return 'auth';
    }

    // Not found errors
    if (
      message.includes('not found') ||
      message.includes('404') ||
      message.includes('does not exist')
    ) {
      return 'notFound';
    }

    // Server errors
    if (
      message.includes('server') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    ) {
      return 'server';
    }
  }

  return 'generic';
}

/**
 * Extracts user-friendly message from error
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof RidlyError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Don't expose technical error messages to users
    const technicalPatterns = [
      /\bGraphQL\b/i,
      /\bJSON\b/i,
      /\bTypeError\b/i,
      /\bReferenceError\b/i,
      /\bSyntaxError\b/i,
      /\bstack\b/i,
      /\bmodule\b/i,
    ];

    const isTechnical = technicalPatterns.some((pattern) => pattern.test(error.message));
    if (isTechnical && !__DEV__) {
      return fallback;
    }

    // Clean up common error message patterns
    let message = error.message
      .replace(/^Error:\s*/i, '')
      .replace(/\s*at\s+.+$/g, '')
      .trim();

    // Limit length
    if (message.length > 150) {
      message = message.substring(0, 150) + '...';
    }

    return message || fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}

/**
 * Checks if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return getErrorType(error) === 'network';
}

/**
 * Checks if error is an auth error
 */
export function isAuthError(error: unknown): boolean {
  return getErrorType(error) === 'auth';
}

/**
 * Checks if error is recoverable (can retry)
 */
export function isRecoverableError(error: unknown): boolean {
  const type = getErrorType(error);
  return type === 'network' || type === 'server';
}

/**
 * Error reporter interface for external error tracking
 */
export interface ErrorReporter {
  /** Report an error */
  captureException(error: Error, context?: Record<string, unknown>): void;

  /** Report a message */
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;

  /** Set user context */
  setUser(user: { id: string; email?: string; username?: string } | null): void;

  /** Add breadcrumb for debugging */
  addBreadcrumb(breadcrumb: { category: string; message: string; data?: Record<string, unknown> }): void;
}

/**
 * Default console error reporter (for development)
 */
export const consoleErrorReporter: ErrorReporter = {
  captureException(error, context) {
    console.error('[ErrorReporter] Exception:', error);
    if (context) {
      console.error('[ErrorReporter] Context:', context);
    }
  },

  captureMessage(message, level = 'info') {
    const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    logFn(`[ErrorReporter] ${level.toUpperCase()}:`, message);
  },

  setUser(user) {
    if (user) {
      console.log('[ErrorReporter] User set:', user.id);
    } else {
      console.log('[ErrorReporter] User cleared');
    }
  },

  addBreadcrumb(breadcrumb) {
    console.log('[ErrorReporter] Breadcrumb:', breadcrumb.category, '-', breadcrumb.message);
  },
};

// Global error reporter instance
let errorReporter: ErrorReporter = consoleErrorReporter;

/**
 * Sets the global error reporter
 */
export function setErrorReporter(reporter: ErrorReporter): void {
  errorReporter = reporter;
}

/**
 * Gets the current error reporter
 */
export function getErrorReporter(): ErrorReporter {
  return errorReporter;
}

/**
 * Reports an error using the global error reporter
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (error instanceof Error) {
    errorReporter.captureException(error, {
      ...context,
      errorType: getErrorType(error),
    });
  } else {
    errorReporter.captureMessage(String(error), 'error');
  }
}
