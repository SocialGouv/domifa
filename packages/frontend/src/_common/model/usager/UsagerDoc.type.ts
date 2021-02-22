export type UsagerDoc = {
  createdAt: Date;
  createdBy: string;
  label: string;
  filetype: string;
  loadingDownload?: boolean;
  loadingDelete?: boolean;
};
