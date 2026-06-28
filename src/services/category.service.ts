import api from "@/config/axios.config";
import type { Category } from "@/models/category.model";

const BASE_URL = "/categories";

export const categoryService = {
  getAllCategories: () => api.get<Category[]>(BASE_URL),

  getCategoryById: (id: string) => api.get<Category>(`${BASE_URL}/${id}`),

  insertCategory: (payload: Omit<Category, "id">) =>
    api.post<Category>(BASE_URL, payload),

  updateCategory: (id: string, payload: Partial<Category>) =>
    api.put<Category>(`${BASE_URL}/${id}`, payload),

  deleteCategory: (id: string) => api.delete(`${BASE_URL}/${id}`),
};
