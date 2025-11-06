import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureFormDeleteComponent } from "./structure-form-delete.component";
import { APP_BASE_HREF } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { AdminStructuresApiClient } from "../../../shared/services/api";

describe("StructureFormDeleteComponent", () => {
  let component: StructureFormDeleteComponent;
  let fixture: ComponentFixture<StructureFormDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureFormDeleteComponent],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
        AdminStructuresApiClient,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureFormDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
