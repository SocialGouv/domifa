import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureFormRefuseComponent } from "./structure-form-refuse.component";
import { APP_BASE_HREF } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { AdminStructuresApiClient } from "../../../shared/services";

describe("StructureFormRefuseComponent", () => {
  let component: StructureFormRefuseComponent;
  let fixture: ComponentFixture<StructureFormRefuseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureFormRefuseComponent],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
        AdminStructuresApiClient,
      ],

      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureFormRefuseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
