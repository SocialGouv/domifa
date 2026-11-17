import { TestBed } from "@angular/core/testing";

import { CustomToastService } from "./custom-toast.service";

describe("CustomToastService", () => {
  let service: CustomToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomToastService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("live regions", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("announces errors and warnings in the alert region", () => {
      service.error("Impossible de télécharger le fichier");
      jest.runAllTimers();
      expect(service.alertMessage()).toBe(
        "Impossible de télécharger le fichier"
      );

      service.warning("Votre session a expiré");
      jest.runAllTimers();
      expect(service.alertMessage()).toBe("Votre session a expiré");
      expect(service.statusMessage()).toBe("");
    });

    it("announces successes and information in the status region", () => {
      service.success("Merci, vous pouvez continuer votre navigation");
      jest.runAllTimers();
      expect(service.statusMessage()).toBe(
        "Merci, vous pouvez continuer votre navigation"
      );
      expect(service.alertMessage()).toBe("");
    });

    it("empties the region before announcing the same message again", () => {
      service.error("Veuillez accepter les CGU pour continuer");
      jest.runAllTimers();
      service.error("Veuillez accepter les CGU pour continuer");
      expect(service.alertMessage()).toBe("");
      jest.runAllTimers();
      expect(service.alertMessage()).toBe(
        "Veuillez accepter les CGU pour continuer"
      );
    });
  });
});
