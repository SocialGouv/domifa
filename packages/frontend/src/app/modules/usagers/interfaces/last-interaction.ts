export class LastInteraction {
  public nbCourrier: number;
  public courrierIn: Date;
  public courrierOut: Date;
  public recommandeIn: Date;
  public recommandeOut: Date;
  public appel: Date;
  public visite: Date;

  constructor(lastInteraction?: any) {
    this.nbCourrier = lastInteraction && lastInteraction.nbCourrier || 0;
    this.courrierIn = (lastInteraction && lastInteraction.courrierIn !== null) ? new Date(lastInteraction.courrierIn) : null;
    this.courrierOut = (lastInteraction && lastInteraction.courrierOut !== null) ? new Date(lastInteraction.courrierOut) : null;
    this.recommandeIn = (lastInteraction && lastInteraction.recommandeIn !== null) ? new Date(lastInteraction.recommandeIn) : null;
    this.recommandeOut = (lastInteraction && lastInteraction.recommandeOut !== null) ? new Date(lastInteraction.recommandeOut) : null;
    this.appel = (lastInteraction && lastInteraction.appel !== null) ? new Date(lastInteraction.appel) : null;
    this.visite = (lastInteraction && lastInteraction.visite !== null) ? new Date(lastInteraction.visite) : null;
  }
}
