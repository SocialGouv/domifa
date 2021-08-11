export type MessageSmsSuivi = {
  numero: string; // 	Numéro du destinataire
  statut: number; // 	Statut du message
  // 1 = Envoyé et bien reçu
  // 2 = Envoyé et non reçu
  // 3 = En cours
  // 4 = Echec
  // 5 = Expiré
  date_emission: Date; // 	Date d'émission du message (UNIX timestamp)
  date_mise_a_jour: Date; // 	Date du dernier changement de statut du message (UNIX timestamp)
  statut_detaille: string; // 	Statut détaillé du message (disponible auprès de votre gestionnaire de compte).
  id_message: string; // 	Identifiant du message.
  operateur: string; // 	Code MCCMNC correspondant à l'opérateur du destinataire.
};
