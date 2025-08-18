import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../../../shared/shared.module";

import { StructuresCustomDocsComponent } from "./structures-custom-docs.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("StructuresCustomDocsComponent", () => {
  let component: StructuresCustomDocsComponent;
  let fixture: ComponentFixture<StructuresCustomDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        NgbModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
        SharedModule,
      ],
      providers: [provideHttpClient()],
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
