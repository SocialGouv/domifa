export function generateDateForCerfa(date?: Date | string): {
  annee: string;
  heure: string;
  jour: string;
  minutes: string;
  mois: string;
} {
  let annee = "";
  let heure = "";
  let jour = "";
  let minutes = "";
  let mois = "";

  if (date !== null && typeof date !== "undefined") {
    if (typeof date === "string") {
      date = new Date(date);
    }

    annee = date.getFullYear().toString();

    heure =
      date.getHours() < 10
        ? "0" + date.getHours().toString()
        : date.getHours().toString();

    minutes =
      date.getMinutes() < 10
        ? "0" + date.getMinutes().toString()
        : date.getMinutes().toString();

    jour =
      date.getDate() < 10
        ? "0" + date.getDate().toString()
        : date.getDate().toString();

    mois =
      date.getMonth() < 9
        ? "0" + (date.getMonth() + 1).toString()
        : (date.getMonth() + 1).toString();
  }

  return {
    annee,
    heure,
    jour,
    minutes,
    mois,
  };
}

// TODO: générer le fichier stats
