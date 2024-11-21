import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DeleteUsagerComponent } from "./delete-usager.component";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("DeleteUsagerComponent", () => {
  let component: DeleteUsagerComponent;
  let fixture: ComponentFixture<DeleteUsagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgbModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      declarations: [DeleteUsagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteUsagerComponent);
    component = fixture.componentInstance;
    component.selectedRefs = new Set<number>();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
