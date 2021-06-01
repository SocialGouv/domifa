import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilDocumentsSectionComponent } from "./profil-documents-section.component";

describe("ProfilDocumentsSectionComponent", () => {
  let component: ProfilDocumentsSectionComponent;
  let fixture: ComponentFixture<ProfilDocumentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilDocumentsSectionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilDocumentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
