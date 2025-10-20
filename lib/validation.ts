/**
 * Input validation and sanitization utilities
 */

// Maximum lengths for different fields
const MAX_LENGTHS = {
  NAME: 50,
  TITLE: 100,
  OPTION: 200,
  COUPLE_CODE: 6,
} as const;

// Minimum lengths
const MIN_LENGTHS = {
  NAME: 1,
  TITLE: 1,
  OPTION: 1,
  COUPLE_CODE: 6,
} as const;

/**
 * Sanitize string input by trimming and removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break SQL
    .substring(0, 1000); // Limit length to prevent DoS
};

/**
 * Validate and sanitize user name
 */
export const validateName = (name: string): { isValid: boolean; error?: string; sanitized?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const sanitized = sanitizeString(name);
  
  if (sanitized.length < MIN_LENGTHS.NAME) {
    return { isValid: false, error: 'Name must be at least 1 character long' };
  }
  
  if (sanitized.length > MAX_LENGTHS.NAME) {
    return { isValid: false, error: `Name must be no more than ${MAX_LENGTHS.NAME} characters long` };
  }

  // Check for only whitespace
  if (!sanitized.trim()) {
    return { isValid: false, error: 'Name cannot be only whitespace' };
  }

  return { isValid: true, sanitized };
};

/**
 * Validate and sanitize bet title
 */
export const validateTitle = (title: string): { isValid: boolean; error?: string; sanitized?: string } => {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'Title is required' };
  }

  const sanitized = sanitizeString(title);
  
  if (sanitized.length < MIN_LENGTHS.TITLE) {
    return { isValid: false, error: 'Title must be at least 1 character long' };
  }
  
  if (sanitized.length > MAX_LENGTHS.TITLE) {
    return { isValid: false, error: `Title must be no more than ${MAX_LENGTHS.TITLE} characters long` };
  }

  if (!sanitized.trim()) {
    return { isValid: false, error: 'Title cannot be only whitespace' };
  }

  return { isValid: true, sanitized };
};

/**
 * Validate and sanitize bet option
 */
export const validateOption = (option: string): { isValid: boolean; error?: string; sanitized?: string } => {
  if (!option || typeof option !== 'string') {
    return { isValid: false, error: 'Option is required' };
  }

  const sanitized = sanitizeString(option);
  
  if (sanitized.length < MIN_LENGTHS.OPTION) {
    return { isValid: false, error: 'Option must be at least 1 character long' };
  }
  
  if (sanitized.length > MAX_LENGTHS.OPTION) {
    return { isValid: false, error: `Option must be no more than ${MAX_LENGTHS.OPTION} characters long` };
  }

  if (!sanitized.trim()) {
    return { isValid: false, error: 'Option cannot be only whitespace' };
  }

  return { isValid: true, sanitized };
};

/**
 * Validate bet amount
 */
export const validateAmount = (amount: string | number): { isValid: boolean; error?: string; sanitized?: number } => {
  if (!amount) {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount > 1000000) {
    return { isValid: false, error: 'Amount cannot exceed ₹1,000,000' };
  }

  // Round to 2 decimal places to prevent floating point issues
  const sanitized = Math.round(numAmount * 100) / 100;
  
  return { isValid: true, sanitized };
};

/**
 * Validate couple code format
 */
export const validateCoupleCode = (code: string): { isValid: boolean; error?: string; sanitized?: string } => {
  if (!code || typeof code !== 'string') {
    return { isValid: false, error: 'Couple code is required' };
  }

  const sanitized = code.trim().toUpperCase();
  
  if (sanitized.length !== MAX_LENGTHS.COUPLE_CODE) {
    return { isValid: false, error: `Couple code must be exactly ${MAX_LENGTHS.COUPLE_CODE} characters long` };
  }

  // Check format: only alphanumeric characters
  const codeRegex = /^[A-Z0-9]{6}$/;
  if (!codeRegex.test(sanitized)) {
    return { isValid: false, error: 'Couple code must contain only letters and numbers' };
  }

  return { isValid: true, sanitized };
};

/**
 * Validate creator choice
 */
export const validateCreatorChoice = (choice: string): { isValid: boolean; error?: string; sanitized?: 'a' | 'b' } => {
  if (!choice || typeof choice !== 'string') {
    return { isValid: false, error: 'Creator choice is required' };
  }

  const sanitized = choice.toLowerCase().trim();
  
  if (sanitized !== 'a' && sanitized !== 'b') {
    return { isValid: false, error: 'Creator choice must be either "a" or "b"' };
  }

  return { isValid: true, sanitized: sanitized as 'a' | 'b' };
};

/**
 * Validate winner option
 */
export const validateWinnerOption = (option: string): { isValid: boolean; error?: string; sanitized?: 'a' | 'b' } => {
  if (!option || typeof option !== 'string') {
    return { isValid: false, error: 'Winner option is required' };
  }

  const sanitized = option.toLowerCase().trim();
  
  if (sanitized !== 'a' && sanitized !== 'b') {
    return { isValid: false, error: 'Winner option must be either "a" or "b"' };
  }

  return { isValid: true, sanitized: sanitized as 'a' | 'b' };
};

/**
 * Validate bet status
 */
export const validateBetStatus = (status: string): { isValid: boolean; error?: string; sanitized?: 'pending' | 'active' | 'concluded' } => {
  if (!status || typeof status !== 'string') {
    return { isValid: false, error: 'Status is required' };
  }

  const sanitized = status.toLowerCase().trim();
  
  if (!['pending', 'active', 'concluded'].includes(sanitized)) {
    return { isValid: false, error: 'Status must be "pending", "active", or "concluded"' };
  }

  return { isValid: true, sanitized: sanitized as 'pending' | 'active' | 'concluded' };
};

