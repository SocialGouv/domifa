export type UsagerDoc = {
  createdAt: Date;
  createdBy: string;
  label: string;
  filetype: string;
  // TODO: récupérer le Path dans docsPath
  path?: string;
};
