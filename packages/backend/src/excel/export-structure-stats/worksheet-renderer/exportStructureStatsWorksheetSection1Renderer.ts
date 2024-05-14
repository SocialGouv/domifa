import { format } from "date-fns";
import { WorksheetRenderer } from "../../xlLib";
import { StructureStatsExportModel } from "../StructureStatsExportModel.type";

export const exportStructureStatsWorksheetSection1Renderer = {
  renderSection1ValidUsagers,
};

function renderSection1ValidUsagers(context: {
  currentRowNumber: number;
  worksheetRendered: WorksheetRenderer;
  model: StructureStatsExportModel;
}) {
  const { currentRowNumber, worksheetRendered, model } = context;
  let i = currentRowNumber;

  const data = model.stats.data.validUsagers;
  worksheetRendered.renderCell(i++, "b", {
    value: `Axe 1. Connaissance du public domicilié au ${format(
      model.stats.period.endDateUTC,
      "dd/MM/yyyy"
    )} (en nombre de personnes)`,
  });
  i++; // blank line
  worksheetRendered.renderCell(i++, "c", {
    value: data.total.usagerEtAyantsDroits,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.total.usagers,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.total.ayantsDroits,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.sexe.f,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.sexe.h,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.typeDom.premiere,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.typeDom.renouvellement,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.mineurs + data.age.ayantsDroits.mineurs,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.majeurs + data.age.ayantsDroits.majeurs,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.mineurs,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.majeurs,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_18_25,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_26_29,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_30_34,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_35_39,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_40_44,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_45_49,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_50_54,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_55_59,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_60_64,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_65_69,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_70_74,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.age.usagers.t_75_plus,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.aah,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.etudiant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.france_travail,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.independant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.retraite,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.rsa,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.salarie,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.autre,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.situationPro.non_renseigne,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.liencommune.residentiel,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.liencommune.parental,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.liencommune.familial,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.liencommune.professionnel,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.liencommune.social,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.liencommune.autre,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.liencommune.non_renseigne,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.menage.couple_avec_enfant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.menage.couple_sans_enfant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.menage.femme_isole_avec_enfant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.menage.femme_isole_sans_enfant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.menage.homme_isole_avec_enfant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.menage.homme_isole_sans_enfant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.menage.non_renseigne,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.errance,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.expulsion,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.heberge_sans_adresse,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.itinerant,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.rupture,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.sortie_structure,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.sortie_incarceration,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.sortie_hospitalisation,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.violence,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.autre,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.cause.non_renseigne,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.residence.domicile_mobile,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.residence.hebergement_social,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.residence.hebergement_tiers,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.residence.hotel,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.residence.sans_abri,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.residence.logement_sans_adresse,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.residence.autre,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.residence.non_renseigne,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.raison.exercice_droits,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.raison.prestations_sociales,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.raison.exercice_activite_pro,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.raison.lutte_violence,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.raison.autre,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.raison.non_renseigne,
  });
  i++; // blank line
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.accompagnement.oui,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.accompagnement.non,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.accompagnement.non_renseigne,
  });
  i++; // blank line

  context.currentRowNumber = i;
}
