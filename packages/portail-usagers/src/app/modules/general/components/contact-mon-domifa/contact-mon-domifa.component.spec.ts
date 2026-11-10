import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { MatomoTracker } from "ngx-matomo-client";

import { ContactMonDomifaComponent } from "./contact-mon-domifa.component";

describe("ContactMonDomifaComponent", () => {
  let component: ContactMonDomifaComponent;
  let fixture: ComponentFixture<ContactMonDomifaComponent>;
  let httpMock: HttpTestingController;
  const matomo = { trackEvent: jest.fn() };

  const fillIdentity = () => {
    component.contactForm.patchValue({
      nom: "Dupont",
      prenom: "Jean",
      email: "jean@example.org",
      structureName: "CCAS de Saint-Denis",
    });
  };

  beforeEach(async () => {
    matomo.trackEvent.mockReset();
    await TestBed.configureTestingModule({
      imports: [ContactMonDomifaComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatomoTracker, useValue: matomo },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactMonDomifaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows an auto-response without sending anything, tracked once", () => {
    component.contactForm.controls.subject.setValue("MOT_DE_PASSE_IDENTIFIANT");
    component.contactForm.controls.subject.setValue("COPIE_DOCUMENT");
    component.contactForm.controls.subject.setValue("MOT_DE_PASSE_IDENTIFIANT");
    fixture.detectChanges();

    expect(component.response).toContain("réinitialisation");
    expect(component.canSend).toBe(false);
    expect(component.needsMessage).toBe(false);
    expect(
      fixture.nativeElement.querySelector("button[type=submit]")
    ).toBeNull();
    expect(matomo.trackEvent).toHaveBeenCalledTimes(2);
    expect(matomo.trackEvent).toHaveBeenCalledWith(
      "contact-mon-domifa",
      "reponse_automatique",
      "MOT_DE_PASSE_IDENTIFIANT"
    );

    component.sendContactMessage();
    httpMock.expectNone(() => true);
    expect(fixture.nativeElement.querySelector("textarea#content")).toBeNull();
  });

  it("sends a data deletion request without a message", () => {
    fillIdentity();
    component.contactForm.controls.subject.setValue("SUPPRESSION_DONNEES");
    fixture.detectChanges();

    expect(component.response).toContain("suppression de vos données");
    expect(component.canSend).toBe(true);
    expect(fixture.nativeElement.querySelector("textarea#content")).toBeNull();
    expect(
      fixture.nativeElement.querySelector("button[type=submit]")
    ).not.toBeNull();
    // Not an auto-response: tracked only once sent
    expect(matomo.trackEvent).not.toHaveBeenCalled();

    component.sendContactMessage();
    const req = httpMock.expectOne("http://localhost:3000/contact/mon-domifa");
    expect(req.request.body.subject).toEqual("SUPPRESSION_DONNEES");
    req.flush({ message: "OK" });
    expect(component.success).toBe(true);
    expect(matomo.trackEvent).toHaveBeenCalledWith(
      "contact-mon-domifa",
      "envoi_formulaire",
      "SUPPRESSION_DONNEES"
    );
  });

  it("requires a message for free-text subjects", () => {
    fillIdentity();
    component.contactForm.controls.subject.setValue("AUTRE");
    fixture.detectChanges();
    expect(component.contactForm.valid).toBe(false);
    expect(
      fixture.nativeElement.querySelector("textarea#content")
    ).not.toBeNull();

    component.contactForm.controls.content.setValue("Bonjour, j'ai un souci");
    expect(component.contactForm.valid).toBe(true);
  });

  it("requires a valid email, phone is optional", () => {
    fillIdentity();
    component.contactForm.patchValue({
      subject: "AUTRE",
      content: "Bonjour, j'ai un souci",
    });
    expect(component.contactForm.valid).toBe(true);

    component.contactForm.controls.email.setValue("");
    expect(component.contactForm.controls.email.hasError("required")).toBe(
      true
    );
    component.contactForm.controls.email.setValue("pas-un-email");
    expect(component.contactForm.valid).toBe(false);
  });

  it("keeps region and departement consistent", () => {
    component.contactForm.controls.departement.setValue("93");
    expect(component.contactForm.controls.regionCode.value).toEqual("11");
    component.contactForm.controls.regionCode.setValue("84");
    expect(component.contactForm.controls.departement.value).toEqual("");
  });

  it("sends free-text requests and tracks the subject only", () => {
    fillIdentity();
    component.contactForm.patchValue({
      subject: "PROBLEME_ACCESSIBILITE",
      content: "Le contraste du bouton est trop faible",
    });
    component.sendContactMessage();

    const req = httpMock.expectOne("http://localhost:3000/contact/mon-domifa");
    expect(req.request.method).toEqual("POST");
    expect(req.request.body.subject).toEqual("PROBLEME_ACCESSIBILITE");
    req.flush({ message: "OK" });

    expect(component.success).toBe(true);
    expect(component.contactForm.controls.nom.value).toEqual("");
    expect(matomo.trackEvent).toHaveBeenCalledWith(
      "contact-mon-domifa",
      "envoi_formulaire",
      "PROBLEME_ACCESSIBILITE"
    );
  });
});
