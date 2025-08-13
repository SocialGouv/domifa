import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExportUserUsagerAccountsComponent } from "./export-user-usager-accounts.component";

describe("ExportUserUsagerAccountsComponent", () => {
  let component: ExportUserUsagerAccountsComponent;
  let fixture: ComponentFixture<ExportUserUsagerAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportUserUsagerAccountsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportUserUsagerAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
