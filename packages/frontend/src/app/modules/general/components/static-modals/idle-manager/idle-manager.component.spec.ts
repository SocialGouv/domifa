import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { IdleManagerComponent } from "./idle-manager.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";

describe("IdleManagerComponent", () => {
  let component: IdleManagerComponent;
  let fixture: ComponentFixture<IdleManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdleManagerComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdleManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
