export type SiteMapLink = {
  label: string;
  path: string;
};

export type SiteMapSection = {
  section: string;
  links: SiteMapLink[];
};
