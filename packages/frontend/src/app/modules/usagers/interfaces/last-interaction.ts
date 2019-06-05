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
    this.courrierIn = lastInteraction && new Date(lastInteraction.courrierIn) || null;
    this.courrierOut = lastInteraction && new Date(lastInteraction.courrierOut) || null;
    this.recommandeIn = lastInteraction && new Date(lastInteraction.recommandeIn) || null;
    this.recommandeOut = lastInteraction && new Date(lastInteraction.recommandeOut) || null;
    this.appel = lastInteraction && new Date(lastInteraction.appel) || null;
    this.visite = lastInteraction && new Date(lastInteraction.visite) || null;
  }
}
