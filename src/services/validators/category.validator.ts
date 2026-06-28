import type {
  CategoryFormData,
  CategoryValidationErrors,
  CategoryValidationResult,
} from "@/models/category.model";

const LABEL_MAX = 60;

export const categoryValidator = {
  validate(
    data: CategoryFormData,
    existingLabels: string[] = [],
  ): CategoryValidationResult {
    const errors: CategoryValidationErrors = {};
    const label = data.label.trim();

    if (!label) {
      errors.label = "Category name is required.";
    } else if (label.length < 2) {
      errors.label = "Category name must be at least 2 characters.";
    } else if (label.length > LABEL_MAX) {
      errors.label = `Category name must be at most ${LABEL_MAX} characters.`;
    } else if (
      existingLabels.some((l) => l.toLowerCase() === label.toLowerCase())
    ) {
      errors.label = "A category with this name already exists.";
    }

    return { valid: Object.keys(errors).length === 0, errors };
  },
};
