import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DecouvrirDomifaComponent } from "./decouvrir-domifa.component";
import { MATOMO_INJECTORS } from "../../../../shared";

describe("DecouvrirDomifaComponent", () => {
  let component: DecouvrirDomifaComponent;
  let fixture: ComponentFixture<DecouvrirDomifaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecouvrirDomifaComponent],
      imports: [...MATOMO_INJECTORS],
    }).compileComponents();

    fixture = TestBed.createComponent(DecouvrirDomifaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
