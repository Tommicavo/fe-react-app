export interface AIModel {
  id: number;
  categoryId: number;
  name: string;
  version: string;
  description: string;
  accuracy: number;
  creator: string;
  isActive: boolean;
}
