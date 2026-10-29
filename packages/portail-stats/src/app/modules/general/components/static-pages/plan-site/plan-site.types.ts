import { UserSupervisorRole } from "@domifa/common";

export type SiteMapLink = {
  label: string;
  path: string;
  // Only shown to these roles, like the matching header menu entry
  roles?: UserSupervisorRole[];
};

export type SiteMapSection = {
  section: string;
  links: SiteMapLink[];
};
