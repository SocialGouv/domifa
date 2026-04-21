import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { ProfilStructureDocsComponent } from "./profil-structure-docs.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { SharedModule } from "../../../../shared/shared.module";
import { SortArrayPipe } from "../../../../shared/pipes";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ProfilStructureDocsComponent", () => {
  let component: ProfilStructureDocsComponent;
  let fixture: ComponentFixture<ProfilStructureDocsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilStructureDocsComponent],
      imports: [
        FormsModule,
        RouterModule.forRoot([]),

        ReactiveFormsModule,
        SharedModule,
        SortArrayPipe,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilStructureDocsComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
