import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../../../shared/shared.module";

import { StructuresCustomDocsComponent } from "./structures-custom-docs.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("StructuresCustomDocsComponent", () => {
  let component: StructuresCustomDocsComponent;
  let fixture: ComponentFixture<StructuresCustomDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),

        RouterTestingModule,
        SharedModule,
      ],
      declarations: [StructuresCustomDocsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresCustomDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
