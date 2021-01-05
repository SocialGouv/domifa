import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";

@Injectable()
export class SmsService {
  // Délai entre chaque message envoyé
  public interactionDelay: number = 60 * 60;

  constructor() {}

  // Check si un sms de la même catégorie est déjà en route
  public newInteraction() {
    // Si un sms est déjà programmé on édite juste le nombre de courriers prévus
  }

  // Messages de rappel de renouvellement
  public renewReminder() {}
}
