export interface Category {
  id: string;
  label: string;
}

export interface CategoryFormData {
  label: string;
}

export interface CategoryValidationResult {
  valid: boolean;
  errors: CategoryValidationErrors;
}

export interface CategoryValidationErrors {
  label?: string;
}
