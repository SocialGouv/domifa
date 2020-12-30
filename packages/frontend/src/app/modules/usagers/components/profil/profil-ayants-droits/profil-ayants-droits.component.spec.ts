import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { usagerValideMock } from "../../../../../../_common/mocks/usager.mock";
import { Usager } from "../../../interfaces/usager";

import { ProfilAyantsDroitsComponent } from "./profil-ayants-droits.component";

describe("ProfilAyantsDroitsComponent", () => {
  let component: ProfilAyantsDroitsComponent;
  let fixture: ComponentFixture<ProfilAyantsDroitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilAyantsDroitsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilAyantsDroitsComponent);
    component = fixture.componentInstance;
    component.usager = new Usager(usagerValideMock);
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
