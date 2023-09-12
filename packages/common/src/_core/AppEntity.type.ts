export interface AppEntity {
  uuid?: string; // postgres id
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
}
