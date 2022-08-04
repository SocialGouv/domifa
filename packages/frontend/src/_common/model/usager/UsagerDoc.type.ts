export type UsagerDoc = {
  createdAt: Date;
  createdBy: string;
  filetype: string;
  label: string;
  path?: string;
  updatedAt?: Date;
  uuid: string; // postgres id
  version?: number;
};
