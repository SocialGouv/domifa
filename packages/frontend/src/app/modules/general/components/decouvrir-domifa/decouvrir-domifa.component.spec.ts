import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DecouvrirDomifaComponent } from "./decouvrir-domifa.component";

describe("DecouvrirDomifaComponent", () => {
  let component: DecouvrirDomifaComponent;
  let fixture: ComponentFixture<DecouvrirDomifaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecouvrirDomifaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DecouvrirDomifaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
