import api from "@/config/axios.config";
import type { AIModel } from "@/models/aiModel.model";

const BASE_URL = "/aimodels";

export const aiModelService = {
  getAllAiModels: () => api.get<AIModel[]>(BASE_URL),

  getAiModelById: (id: string) => api.get<AIModel>(`${BASE_URL}/${id}`),

  insertAiModel: (payload: Omit<AIModel, "id">) =>
    api.post<AIModel>(BASE_URL, payload),

  updateAiModel: (id: string, payload: Partial<AIModel>) =>
    api.put<AIModel>(`${BASE_URL}/${id}`, payload),

  deleteAiModel: (id: string) => api.delete(`${BASE_URL}/${id}`),
};
