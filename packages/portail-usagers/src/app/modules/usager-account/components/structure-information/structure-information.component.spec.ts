import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureInformationComponent } from "./structure-information.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("StructureInformationComponent", () => {
  let component: StructureInformationComponent;
  let fixture: ComponentFixture<StructureInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StructureInformationComponent],
      imports: [HttpClientTestingModule],
    });
    fixture = TestBed.createComponent(StructureInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
