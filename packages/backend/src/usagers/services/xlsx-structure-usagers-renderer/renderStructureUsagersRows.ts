/*
 * Soliguide: Useful information for those who need it
 *
 * SPDX-FileCopyrightText: © 2024 Solinum
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { StructureCommon, UsagerAyantDroit } from "@domifa/common";

import set from "lodash.set";
import {
  StructureCustomDocTags,
  CUSTOM_DOCS_LABELS,
} from "../../../_common/model";
import { buildCustomDoc, buildDecision, DATE_FORMAT } from "../custom-docs";
import { StructureUsagerExport } from "./StructureUsagerExport.type";
import { format } from "date-fns";

export const renderStructureUsagersRows = (
  usagers: StructureUsagerExport[],
  structure: StructureCommon
): {
  firstSheetUsagers: StructureCustomDocTags[];
  secondSheetEntretiens: StructureCustomDocTags[];
} => {
  const usagersListHeader: StructureCustomDocTags = {
    USAGER_REF: CUSTOM_DOCS_LABELS.USAGER_REF,
    USAGER_CIVILITE: CUSTOM_DOCS_LABELS.USAGER_CIVILITE,
    USAGER_NOM: CUSTOM_DOCS_LABELS.USAGER_NOM,
    USAGER_PRENOM: CUSTOM_DOCS_LABELS.USAGER_PRENOM,
    USAGER_SURNOM: CUSTOM_DOCS_LABELS.USAGER_SURNOM,
    USAGER_DATE_NAISSANCE: CUSTOM_DOCS_LABELS.USAGER_DATE_NAISSANCE,
    USAGER_LIEU_NAISSANCE: CUSTOM_DOCS_LABELS.USAGER_LIEU_NAISSANCE,
    USAGER_PHONE: CUSTOM_DOCS_LABELS.USAGER_PHONE,
    USAGER_EMAIL: CUSTOM_DOCS_LABELS.USAGER_EMAIL,
    USAGER_NUMERO_DISTRIBUTION_SPECIALE:
      CUSTOM_DOCS_LABELS.USAGER_NUMERO_DISTRIBUTION_SPECIALE,
    NATIONALITE: CUSTOM_DOCS_LABELS.NATIONALITE,

    // Domiciliation
    STATUT_DOM: CUSTOM_DOCS_LABELS.STATUT_DOM,
    TYPE_DOM: "Type de domiciliation",
    DATE_DEBUT_DOM: CUSTOM_DOCS_LABELS.DATE_DEBUT_DOM,
    DATE_FIN_DOM: CUSTOM_DOCS_LABELS.DATE_FIN_DOM,
    DATE_PREMIERE_DOM: CUSTOM_DOCS_LABELS.DATE_PREMIERE_DOM,
    DATE_DERNIER_PASSAGE: CUSTOM_DOCS_LABELS.DATE_DERNIER_PASSAGE,

    // Radiation
    DATE_RADIATION: CUSTOM_DOCS_LABELS.DATE_RADIATION,
    MOTIF_RADIATION: "Motif refus ou radiation",
  };

  const entretiensHeader: StructureCustomDocTags = {
    USAGER_REF: CUSTOM_DOCS_LABELS.USAGER_REF,
    USAGER_CIVILITE: CUSTOM_DOCS_LABELS.USAGER_CIVILITE,
    USAGER_NOM: CUSTOM_DOCS_LABELS.USAGER_NOM,
    USAGER_PRENOM: CUSTOM_DOCS_LABELS.USAGER_PRENOM,
    USAGER_DATE_NAISSANCE: CUSTOM_DOCS_LABELS.USAGER_DATE_NAISSANCE,
    ENTRETIEN_ORIENTE_PAR: CUSTOM_DOCS_LABELS.ENTRETIEN_ORIENTE_PAR,
    ENTRETIEN_DOMICILIATION_EXISTANTE:
      CUSTOM_DOCS_LABELS.ENTRETIEN_DOMICILIATION_EXISTANTE,
    ENTRETIEN_REVENUS: CUSTOM_DOCS_LABELS.ENTRETIEN_REVENUS,
    ENTRETIEN_LIEN_COMMUNE: CUSTOM_DOCS_LABELS.ENTRETIEN_LIEN_COMMUNE,
    ENTRETIEN_COMPOSITION_MENAGE:
      CUSTOM_DOCS_LABELS.ENTRETIEN_COMPOSITION_MENAGE,
    ENTRETIEN_SITUATION_RESIDENTIELLE:
      CUSTOM_DOCS_LABELS.ENTRETIEN_SITUATION_RESIDENTIELLE,
    ENTRETIEN_CAUSE_INSTABILITE: CUSTOM_DOCS_LABELS.ENTRETIEN_CAUSE_INSTABILITE,
    ENTRETIEN_RAISON_DEMANDE: CUSTOM_DOCS_LABELS.ENTRETIEN_RAISON_DEMANDE,
    ENTRETIEN_ACCOMPAGNEMENT: CUSTOM_DOCS_LABELS.ENTRETIEN_ACCOMPAGNEMENT,
    ENTRETIEN_RATTACHEMENT: CUSTOM_DOCS_LABELS.ENTRETIEN_RATTACHEMENT,
    ENTRETIEN_SITUATION_PROFESSIONNELLE:
      CUSTOM_DOCS_LABELS.ENTRETIEN_SITUATION_PROFESSIONNELLE,
  };

  const firstSheetUsagers = [usagersListHeader];
  const secondSheetEntretiens = [entretiensHeader];

  for (let index = 0; index < 8; index++) {
    set(usagersListHeader, "AD_NOM_" + index, `Nom ayant-droit ${index + 1}`);
    set(
      usagersListHeader,
      "AD_PRENOM_" + index,
      `Prénom ayant-droit ${index + 1}`
    );
    set(
      usagersListHeader,
      "AD_DATE_NAISSANCE_" + index,
      `Date naissance ayant-droit ${index + 1}`
    );
    set(usagersListHeader, "AD_LIEN_" + index, `Lien de parenté ${index + 1}`);
  }

  for (const usagerToExport of usagers) {
    try {
      const customData = {
        ...buildCustomDoc({
          usager: {
            ...usagerToExport,
            structureId: structure.id,
            contactByPhone: null,
            etapeDemande: null,
            rdv: null,
            pinnedNote: null,
          },
          structure,
          date: new Date(),
        }),
        ...buildDecision(usagerToExport, structure, DATE_FORMAT.JOUR),
      };
      const usager = renderFirstSheetData(customData);
      const entretien = renderSecondSheetData(customData);

      let index = 0;

      usagerToExport.ayantsDroits.forEach((ad: UsagerAyantDroit) => {
        set(usager, "AD_NOM_" + index, ad.nom);
        set(usager, "AD_PRENOM_" + index, ad.prenom);
        set(
          usager,
          "AD_DATE_NAISSANCE_" + index,
          format(new Date(ad.dateNaissance), DATE_FORMAT.JOUR)
        );
        set(usager, "AD_LIEN_" + index, ad.lien);
        index++;
      });

      firstSheetUsagers.push(usager);
      secondSheetEntretiens.push(entretien);
    } catch (e) {
      console.error(e);
    }
  }

  return {
    firstSheetUsagers,
    secondSheetEntretiens,
  };
};

export const renderFirstSheetData = (
  usager: StructureCustomDocTags
): StructureCustomDocTags => {
  return {
    USAGER_REF: usager.USAGER_REF,
    USAGER_CIVILITE: usager.USAGER_CIVILITE,
    USAGER_NOM: usager.USAGER_NOM,
    USAGER_PRENOM: usager.USAGER_PRENOM,
    USAGER_SURNOM: usager.USAGER_SURNOM,
    USAGER_DATE_NAISSANCE: usager.USAGER_DATE_NAISSANCE,
    USAGER_LIEU_NAISSANCE: usager.USAGER_LIEU_NAISSANCE,
    USAGER_PHONE: usager.USAGER_PHONE,
    USAGER_EMAIL: usager.USAGER_EMAIL,
    USAGER_NUMERO_DISTRIBUTION_SPECIALE:
      usager.USAGER_NUMERO_DISTRIBUTION_SPECIALE,
    NATIONALITE: usager.NATIONALITE,

    STATUT_DOM: usager.STATUT_DOM,
    TYPE_DOM: usager.TYPE_DOM,
    DATE_DEBUT_DOM: usager.DATE_DEBUT_DOM,
    DATE_FIN_DOM: usager.DATE_FIN_DOM,
    DATE_PREMIERE_DOM: usager.DATE_PREMIERE_DOM,
    DATE_DERNIER_PASSAGE: usager.DATE_DERNIER_PASSAGE,

    DATE_RADIATION: usager.DATE_RADIATION,
    MOTIF_RADIATION: usager.MOTIF_RADIATION,
  };
};

export const renderSecondSheetData = (
  usager: StructureCustomDocTags
): StructureCustomDocTags => {
  return {
    USAGER_REF: usager.USAGER_REF,
    USAGER_CIVILITE: usager.USAGER_CIVILITE,
    USAGER_NOM: usager.USAGER_NOM,
    USAGER_PRENOM: usager.USAGER_PRENOM,
    USAGER_DATE_NAISSANCE: usager.USAGER_DATE_NAISSANCE,
    ENTRETIEN_ORIENTE_PAR: usager.ENTRETIEN_ORIENTE_PAR,
    ENTRETIEN_DOMICILIATION_EXISTANTE: usager.ENTRETIEN_DOMICILIATION_EXISTANTE,
    ENTRETIEN_REVENUS: usager.ENTRETIEN_REVENUS,
    ENTRETIEN_LIEN_COMMUNE: usager.ENTRETIEN_LIEN_COMMUNE,
    ENTRETIEN_COMPOSITION_MENAGE: usager.ENTRETIEN_COMPOSITION_MENAGE,
    ENTRETIEN_SITUATION_RESIDENTIELLE: usager.ENTRETIEN_SITUATION_RESIDENTIELLE,
    ENTRETIEN_CAUSE_INSTABILITE: usager.ENTRETIEN_CAUSE_INSTABILITE,
    ENTRETIEN_RAISON_DEMANDE: usager.ENTRETIEN_RAISON_DEMANDE,
    ENTRETIEN_ACCOMPAGNEMENT: usager.ENTRETIEN_ACCOMPAGNEMENT,
    ENTRETIEN_RATTACHEMENT: usager.ENTRETIEN_RATTACHEMENT,
    ENTRETIEN_SITUATION_PROFESSIONNELLE:
      usager.ENTRETIEN_SITUATION_PROFESSIONNELLE,
  };
};
