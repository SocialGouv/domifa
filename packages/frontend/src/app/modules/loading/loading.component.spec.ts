import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed
} from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LoadingComponent } from "./loading.component";

describe("LoadingComponent", () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingComponent],
      imports: [NgbModule, RouterModule.forRoot([])],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", async(() => {
    expect(component).toBeTruthy();
    expect(component.ngOnInit).toBeTruthy();
    expect(component.loading).toBeFalsy();
  }));
});
