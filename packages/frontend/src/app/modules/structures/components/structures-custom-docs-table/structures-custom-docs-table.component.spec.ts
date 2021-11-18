import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";

import { StructuresCustomDocsTableComponent } from "./structures-custom-docs-table.component";

describe("StructuresCustomDocsTableComponent", () => {
  let component: StructuresCustomDocsTableComponent;
  let fixture: ComponentFixture<StructuresCustomDocsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructuresCustomDocsTableComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresCustomDocsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
