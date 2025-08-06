import { useState, useCallback } from 'react';

interface ValidationRule {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
    match?: string;
}

interface ValidationRules {
    [fieldName: string]: ValidationRule;
}

interface ValidationErrors {
    [fieldName: string]: string;
}

interface FormValues {
    [fieldName: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateField = useCallback((fieldName: string, value: string, allValues?: FormValues): string => {
        const rule = rules[fieldName];
        if (!rule) return '';

        // Required validation
        if (rule.required && !value.trim()) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }

        // Skip other validations if field is empty and not required
        if (!value.trim() && !rule.required) {
            return '';
        }

        // Minimum length validation
        if (rule.minLength && value.length < rule.minLength) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rule.minLength} characters`;
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} format is invalid`;
        }

        // Match validation (for confirm password, etc.)
        if (rule.match && allValues && value !== allValues[rule.match]) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} do not match`;
        }

        // Custom validation
        if (rule.custom) {
            const customError = rule.custom(value);
            if (customError) return customError;
        }

        return '';
    }, [rules]);

    const validateForm = useCallback((values: FormValues): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        Object.keys(rules).forEach(fieldName => {
            const error = validateField(fieldName, values[fieldName] || '', values);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [rules, validateField]);

    const clearError = useCallback((fieldName: string) => {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }, []);

    const clearAllErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        errors,
        validateField,
        validateForm,
        clearError,
        clearAllErrors,
        setErrors
    };
};

// Common validation rules
export const commonValidationRules = {
    required: { required: true },
    email: { 
        required: true, 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    },
    password: { 
        required: true, 
        minLength: 4 
    },
    strongPassword: {
        required: true,
        minLength: 8,
        custom: (value: string) => {
            if (!/(?=.*[a-z])/.test(value)) {
                return 'Password must contain at least one lowercase letter';
            }
            if (!/(?=.*[A-Z])/.test(value)) {
                return 'Password must contain at least one uppercase letter';
            }
            if (!/(?=.*\d)/.test(value)) {
                return 'Password must contain at least one number';
            }
            return null;
        }
    }
};