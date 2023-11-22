import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsagerAcceptCguComponent } from "./usager-accept-cgu.component";

describe("UsagerAcceptCguComponent", () => {
  let component: UsagerAcceptCguComponent;
  let fixture: ComponentFixture<UsagerAcceptCguComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsagerAcceptCguComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsagerAcceptCguComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
