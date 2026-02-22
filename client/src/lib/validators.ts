// Form validation utilities
export interface ValidationError {
  field: string;
  message: string;
}

export const validators = {
  email: (email: string): ValidationError | null => {
    if (!email) return { field: 'email', message: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { field: 'email', message: 'Invalid email format' };
    }
    return null;
  },

  password: (password: string, minLength = 8): ValidationError | null => {
    if (!password) return { field: 'password', message: 'Password is required' };
    if (password.length < minLength) {
      return { field: 'password', message: `Password must be at least ${minLength} characters` };
    }
    if (!/[A-Z]/.test(password)) {
      return { field: 'password', message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { field: 'password', message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { field: 'password', message: 'Password must contain at least one number' };
    }
    return null;
  },

  name: (name: string): ValidationError | null => {
    if (!name) return { field: 'name', message: 'Name is required' };
    if (name.length < 2) return { field: 'name', message: 'Name must be at least 2 characters' };
    if (name.length > 100) return { field: 'name', message: 'Name must be less than 100 characters' };
    return null;
  },

  title: (title: string, minLength = 3): ValidationError | null => {
    if (!title) return { field: 'title', message: 'Title is required' };
    if (title.length < minLength) {
      return { field: 'title', message: `Title must be at least ${minLength} characters` };
    }
    if (title.length > 200) return { field: 'title', message: 'Title must be less than 200 characters' };
    return null;
  },

  description: (description: string, minLength = 10): ValidationError | null => {
    if (!description) return { field: 'description', message: 'Description is required' };
    if (description.length < minLength) {
      return { field: 'description', message: `Description must be at least ${minLength} characters` };
    }
    if (description.length > 5000) return { field: 'description', message: 'Description is too long' };
    return null;
  },

  price: (price: string | number): ValidationError | null => {
    if (price === '' || price === null || price === undefined) {
      return { field: 'price', message: 'Price is required' };
    }
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return { field: 'price', message: 'Price must be a number' };
    if (numPrice <= 0) return { field: 'price', message: 'Price must be greater than 0' };
    if (numPrice > 9999) return { field: 'price', message: 'Price must be less than $9999' };
    return null;
  },

  file: (file: File | null, maxSizeMB = 50, allowedTypes: string[] = []): ValidationError | null => {
    if (!file) return { field: 'file', message: 'File is required' };
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { field: 'file', message: `File size must be less than ${maxSizeMB}MB` };
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { field: 'file', message: `File type must be one of: ${allowedTypes.join(', ')}` };
    }
    
    return null;
  },

  image: (file: File | null, maxSizeMB = 5): ValidationError | null => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validators.file(file, maxSizeMB, imageTypes);
  },

  url: (url: string): ValidationError | null => {
    if (!url) return { field: 'url', message: 'URL is required' };
    try {
      new URL(url);
      return null;
    } catch {
      return { field: 'url', message: 'Invalid URL format' };
    }
  },

  matchPasswords: (password: string, confirmPassword: string): ValidationError | null => {
    if (password !== confirmPassword) {
      return { field: 'confirmPassword', message: 'Passwords do not match' };
    }
    return null;
  }
};

// Form validation helper
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => ValidationError | null>
): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  Object.entries(rules).forEach(([field, validationFn]) => {
    const error = validationFn(data[field]);
    if (error) {
      errors.push(error);
    }
  });
  
  return errors;
};

// Get error message for a specific field
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(e => e.field === field);
  return error?.message || null;
};
