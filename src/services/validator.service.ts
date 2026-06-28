import type { AIModel } from "@/models/aiModel.model";

export type AiModelFormData = Omit<AIModel, "id">;

export type AiModelValidationErrors = Partial<
  Record<keyof AiModelFormData, string>
>;

export interface ValidationResult {
  valid: boolean;
  errors: AiModelValidationErrors;
}

const NAME_MAX = 60;
const VERSION_MAX = 1000;
const CREATOR_MAX = 60;
const DESCRIPTION_MAX = 500;

export const validatorService = {
  validateAiModel(data: AiModelFormData): ValidationResult {
    const errors: AiModelValidationErrors = {};

    const name = data.name.trim();
    if (!name) {
      errors.name = "Name is required.";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (name.length > NAME_MAX) {
      errors.name = `Name must be at most ${NAME_MAX} characters.`;
    }

    const version = data.version.trim();
    if (!version) {
      errors.version = "Version is required.";
    } else if (version.length > VERSION_MAX) {
      errors.version = `Version must be at most ${VERSION_MAX} characters.`;
    }

    const creator = data.creator.trim();
    if (!creator) {
      errors.creator = "Creator is required.";
    } else if (creator.length < 2) {
      errors.creator = "Creator must be at least 2 characters.";
    } else if (creator.length > CREATOR_MAX) {
      errors.creator = `Creator must be at most ${CREATOR_MAX} characters.`;
    }

    if (!data.categoryId || data.categoryId === "") {
      errors.categoryId = "Please select a category.";
    }

    const acc = Number(data.accuracy);
    if (isNaN(acc)) {
      errors.accuracy = "Accuracy must be a number.";
    } else if (acc < 0 || acc > 100) {
      errors.accuracy = "Accuracy must be between 0 and 100.";
    }

    if (data.description.trim().length > DESCRIPTION_MAX) {
      errors.description = `Description must be at most ${DESCRIPTION_MAX} characters.`;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateField(
    field: keyof AiModelFormData,
    value: AiModelFormData[keyof AiModelFormData],
  ): string | undefined {
    const patch = { [field]: value } as Partial<AiModelFormData>;
    const dummy: AiModelFormData = {
      name: "",
      version: "",
      creator: "",
      categoryId: "",
      accuracy: 0,
      description: "",
      isActive: true,
      ...patch,
    };
    const { errors } = validatorService.validateAiModel(dummy);
    return errors[field];
  },
};
