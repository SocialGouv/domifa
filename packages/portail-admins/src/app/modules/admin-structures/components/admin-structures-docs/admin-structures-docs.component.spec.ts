import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ToastrModule } from "ngx-toastr";
import { StructuresCustomDocsService } from "../../services/structures-custom-docs.service";

import { AdminStructuresDocsComponent } from "./admin-structures-docs.component";

describe("AdminStructuresDocsComponent", () => {
  let component: AdminStructuresDocsComponent;
  let fixture: ComponentFixture<AdminStructuresDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [StructuresCustomDocsService],
      declarations: [AdminStructuresDocsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminStructuresDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
