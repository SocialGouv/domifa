/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@angular/core";
import { isValid, differenceInDays } from "date-fns";
import {
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
  USER_STRUCTURE_ROLES_LABELS,
  UserStructure,
} from "@domifa/common";

export type TallyOptions = {
  key?: string; // This is used as a unique identifier used for the "Show only once" and "Don't show after submit" functionality
  layout?: "default" | "modal";
  width?: number;
  alignLeft?: boolean;
  hideTitle?: boolean;
  overlay?: boolean;
  emoji?: {
    text: string;
    animation:
      | "none"
      | "wave"
      | "tada"
      | "heart-beat"
      | "spin"
      | "flash"
      | "bounce"
      | "rubber-band"
      | "head-shake";
  };
  autoClose?: number; // in milliseconds
  showOnce?: boolean;
  doNotShowAfterSubmit?: boolean;
  customFormUrl?: string; // when you want to load the form via it's custom domain URL
  hiddenFields?: {
    [key: string]: any;
  };
  onOpen?: () => void;
  onClose?: () => void;
  onPageView?: (page: number) => void;
  onSubmit?: (payload: any) => void;
};

declare global {
  interface Window {
    Tally: {
      openPopup: (formId: string, options: TallyOptions) => void;
    };
  }
}

@Injectable({
  providedIn: "root",
})
export class TallyService {
  private readonly FORM_ID = "mZQLke";
  private readonly STORAGE_KEY = `${this.FORM_ID}_lastDate`;
  private readonly DISPLAY_INTERVAL_DAYS = 5;
  private readonly SUBMITTED_KEY = `${this.FORM_ID}_submitted`;

  constructor() {}

  public openTally(user: UserStructure): void {
    if (this.shouldDisplayTally()) {
      this.showTallyAndSaveDate(user);
    }
  }

  private shouldDisplayTally(): boolean {
    const isSubmitted = localStorage.getItem(this.SUBMITTED_KEY) === "true";

    if (isSubmitted) {
      return false;
    }

    const lastResponseDate = localStorage.getItem(this.STORAGE_KEY);

    if (!lastResponseDate) {
      return true;
    }

    try {
      const timestamp = parseInt(lastResponseDate, 10);
      const lastDate = new Date(timestamp);

      if (!isValid(lastDate)) {
        return true;
      }

      const currentDate = new Date();
      const diffDays = differenceInDays(currentDate, lastDate);

      return diffDays >= this.DISPLAY_INTERVAL_DAYS;
    } catch (error) {
      return true;
    }
  }

  private showTallyAndSaveDate(user: UserStructure): void {
    const currentDate = new Date().getTime().toString();
    localStorage.setItem(this.STORAGE_KEY, currentDate);

    const departement = `${user.structure.departement} - ${
      DEPARTEMENTS_LISTE[user.structure.departement]
    }`;

    const hiddenFields = {
      nom_structure: user.structure.nom,
      type_structure: user.structure.structureType,
      code_postal: user.structure.codePostal,
      ville: user.structure.ville,
      departement: departement,
      logiciel_domiciliation: "domifa",
      source: "domifa",
      structureId: user.structureId,
      role: USER_STRUCTURE_ROLES_LABELS[user.role],
      region: REGIONS_LISTE[user.structure.region],
      nom_prenom_fonction: `${user.nom} ${user.prenom} (${
        user?.fonction || "Non spécifié"
      })`,
      email: user.email,
    };

    window.Tally.openPopup(this.FORM_ID, {
      width: 900,
      overlay: true,
      emoji: {
        text: "👋",
        animation: "wave",
      },
      layout: "modal",
      showOnce: false,
      doNotShowAfterSubmit: true,
      hideTitle: true,
      onSubmit: () => {
        localStorage.setItem(this.SUBMITTED_KEY, "true");
      },
      hiddenFields,
    });
  }
}
