export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 250] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
