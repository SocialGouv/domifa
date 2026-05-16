import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureInformationComponent } from "./structure-information.component";
import { provideHttpClient } from "@angular/common/http";

describe("StructureInformationComponent", () => {
  let component: StructureInformationComponent;
  let fixture: ComponentFixture<StructureInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StructureInformationComponent],
      providers: [provideHttpClient()],
    });
    fixture = TestBed.createComponent(StructureInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
