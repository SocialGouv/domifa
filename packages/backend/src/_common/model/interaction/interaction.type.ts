export type Interaction = {
  _id: string;
  id: number;
  type: string;
  dateInteraction: Date | null;
  content?: string;
  nbCourrier?: number;
  usagerId: number;
  structureId: number;
  userName?: string;
  userId: number;
  delete: boolean;
  label: string;
};
