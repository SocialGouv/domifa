import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SetNpaiComponent } from "./set-npai.component";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { ComponentRef } from "@angular/core";

describe("SetNpaiComponent", () => {
  let component: SetNpaiComponent;
  let componentRef: ComponentRef<SetNpaiComponent>;
  let fixture: ComponentFixture<SetNpaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetNpaiComponent, StoreModule.forRoot({ app: _usagerReducer })],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SetNpaiComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput("usager", new UsagerFormModel());
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
