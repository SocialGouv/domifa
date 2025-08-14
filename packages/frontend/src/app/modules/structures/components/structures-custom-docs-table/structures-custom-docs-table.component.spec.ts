import { USER_STRUCTURE_MOCK } from "../../../../../_common/mocks/USER_STRUCTURE.mock";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { StructuresCustomDocsTableComponent } from "./structures-custom-docs-table.component";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("StructuresCustomDocsTableComponent", () => {
  let component: StructuresCustomDocsTableComponent;
  let fixture: ComponentFixture<StructuresCustomDocsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructuresCustomDocsTableComponent],
      imports: [NgbModule, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresCustomDocsTableComponent);
    component = fixture.componentInstance;
    component.structureDocs = [];
    component.me = USER_STRUCTURE_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
