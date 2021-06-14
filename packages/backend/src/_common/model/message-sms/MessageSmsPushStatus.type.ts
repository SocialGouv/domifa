export type MessageSmsPushStatus = {
  id_accuse: string; // 	Identifiant unique du message pour ce numéro.
  id_message: string; // 	Identifiant commun en cas d'envoi d'un message groupé.
  numero: string; // N* téléphone du destinataire
  statut: number; // 0 = En attente -  1 = Livré -  2 = Envoyé -  3 = En cours -  4 = Echec -  5 = Expiré
  date_envoi: Date; // Date d'envoi du message (timestamp).
  date_update: Date; // Date de dernière mise à jour du statut (timestamp).
  statut_code: number; // Statut détaillé de 0 à 9999 (détails à demander à votre gestionnaire de compte).
  nom: string; // Le nom ou l'identifiant personnel de votre message
};
