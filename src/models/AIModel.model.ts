export interface AIModel {
  id: string;
  categoryId: string;
  name: string;
  version: string;
  description: string;
  accuracy: number;
  creator: string;
  isActive: boolean;
}
