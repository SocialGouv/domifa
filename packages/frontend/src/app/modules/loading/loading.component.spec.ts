import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LoadingComponent } from "./loading.component";
import { LoadingService } from "./loading.service";

describe("LoadingComponent", () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let service: LoadingService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingComponent],
      imports: [NgbModule, RouterModule.forRoot([])],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    service = TestBed.get(LoadingService);
    fixture.detectChanges();
  }));

  it("should create", async(() => {
    expect(component).toBeTruthy();
    expect(component.loading).toBeFalsy();

    service.startLoading();
    component.ngOnInit();
    setTimeout(() => {
      expect(component.loading).toBeTruthy();
    }, 1000);

    component.ngOnDestroy();
    expect(component.loading).toBeFalsy();
  }));
});
