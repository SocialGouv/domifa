import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignReferrersComponent } from "./assign-referrers.component";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { FullNamePipe } from "../../../shared/pipes";

describe("AssignReferrersComponent", () => {
  let component: AssignReferrersComponent;
  let fixture: ComponentFixture<AssignReferrersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignReferrersComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        FullNamePipe,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignReferrersComponent);
    component = fixture.componentInstance;
    component.selectedRefs = new Set<number>();
    component.newReferrerId = null;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
