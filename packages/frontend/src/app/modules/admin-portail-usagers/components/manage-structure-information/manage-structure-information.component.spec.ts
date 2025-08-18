import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ManageStructureInformationComponent } from "./manage-structure-information.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ManageStructureInformationComponent", () => {
  let component: ManageStructureInformationComponent;
  let fixture: ComponentFixture<ManageStructureInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageStructureInformationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [NgbModule, RouterModule.forRoot([])],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageStructureInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
