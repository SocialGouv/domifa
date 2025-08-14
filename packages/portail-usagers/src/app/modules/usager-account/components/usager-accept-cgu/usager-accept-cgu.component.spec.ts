import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsagerAcceptCguComponent } from "./usager-accept-cgu.component";
import { provideHttpClient } from "@angular/common/http";

describe("UsagerAcceptCguComponent", () => {
  let component: UsagerAcceptCguComponent;
  let fixture: ComponentFixture<UsagerAcceptCguComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsagerAcceptCguComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(UsagerAcceptCguComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
