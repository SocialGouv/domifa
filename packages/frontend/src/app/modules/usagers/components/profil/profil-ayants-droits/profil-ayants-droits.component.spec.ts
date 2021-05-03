import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { usagerValideMock } from "../../../../../../_common/mocks/usager.mock";
import { ProfilAyantsDroitsComponent } from "./profil-ayants-droits.component";

describe("ProfilAyantsDroitsComponent", () => {
  let component: ProfilAyantsDroitsComponent;
  let fixture: ComponentFixture<ProfilAyantsDroitsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilAyantsDroitsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilAyantsDroitsComponent);
    component = fixture.componentInstance;
    component.ayantsDroits = usagerValideMock.ayantsDroits;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
