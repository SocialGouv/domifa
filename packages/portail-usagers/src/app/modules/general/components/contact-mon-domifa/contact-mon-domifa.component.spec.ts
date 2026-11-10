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

  it("shows the information and sends the request for linked subjects", () => {
    fillIdentity();
    component.contactForm.controls.subject.setValue("MOT_DE_PASSE_IDENTIFIANT");
    fixture.detectChanges();

    expect(component.response).toContain("mot de passe");
    expect(component.needsMessage).toBe(false);
    expect(fixture.nativeElement.querySelector(".fr-callout")).not.toBeNull();
    // Optional message
    expect(
      fixture.nativeElement.querySelector("textarea#content")
    ).not.toBeNull();
    expect(component.contactForm.valid).toBe(true);
    // Nothing is tracked before sending
    expect(matomo.trackEvent).not.toHaveBeenCalled();

    component.sendContactMessage();
    const req = httpMock.expectOne("http://localhost:3000/contact/mon-domifa");
    expect(req.request.body.subject).toEqual("MOT_DE_PASSE_IDENTIFIANT");
    req.flush({ message: "OK" });
    expect(component.success).toBe(true);
    expect(matomo.trackEvent).toHaveBeenCalledWith(
      "contact-mon-domifa",
      "envoi_formulaire",
      "MOT_DE_PASSE_IDENTIFIANT"
    );
  });

  it("rejects a too short optional message", () => {
    fillIdentity();
    component.contactForm.patchValue({
      subject: "SUPPRESSION_DONNEES",
      content: "court",
    });
    expect(component.contactForm.valid).toBe(false);
    component.contactForm.controls.content.setValue("");
    expect(component.contactForm.valid).toBe(true);
  });

  it("requires a subject before sending", () => {
    fillIdentity();
    component.sendContactMessage();
    httpMock.expectNone("http://localhost:3000/contact/mon-domifa");
    expect(component.showError("subject")).toBe(true);
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
