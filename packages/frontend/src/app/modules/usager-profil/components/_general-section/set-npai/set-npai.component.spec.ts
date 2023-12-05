import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SetNpaiComponent } from "./set-npai.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";

describe("SetNpaiComponent", () => {
  let component: SetNpaiComponent;
  let fixture: ComponentFixture<SetNpaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetNpaiComponent],
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetNpaiComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
