import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { RouterTestingModule } from "@angular/router/testing";
import { DocumentsFormComponent } from "./documents-form.component";

describe("DocumentsFormComponent", () => {
  let component: DocumentsFormComponent;
  let fixture: ComponentFixture<DocumentsFormComponent>;

  beforeEach(() => {
    const titleStub = () => ({ setTitle: string => ({}) });
    const activatedRouteStub = () => ({ snapshot: { params: { id: {} } } });
    const routerStub = () => ({ navigate: array => ({}) });
    const authServiceStub = () => ({
      currentUserSubject: { subscribe: f => f({}) }
    });
    const usagerServiceStub = () => ({
      findOne: id => ({ subscribe: f => f({}) }),
      nextStep: (id, step) => ({ subscribe: f => f({}) })
    });
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DocumentsFormComponent],
      providers: [
        { provide: Title, useFactory: titleStub },
        { provide: ActivatedRoute, useFactory: activatedRouteStub },
        { provide: Router, useFactory: routerStub },
        { provide: AuthService, useFactory: authServiceStub },
        { provide: UsagerService, useFactory: usagerServiceStub }
      ]
    });
    fixture = TestBed.createComponent(DocumentsFormComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("makes expected calls", () => {
      const titleStub: Title = fixture.debugElement.injector.get(Title);
      const routerStub: Router = fixture.debugElement.injector.get(Router);
      const usagerServiceStub: UsagerService = fixture.debugElement.injector.get(
        UsagerService
      );
      spyOn(titleStub, "setTitle").and.callThrough();
      spyOn(routerStub, "navigate").and.callThrough();
      spyOn(usagerServiceStub, "findOne").and.callThrough();
      component.ngOnInit();
      expect(titleStub.setTitle).toHaveBeenCalled();
      expect(routerStub.navigate).toHaveBeenCalled();
      expect(usagerServiceStub.findOne).toHaveBeenCalled();
    });
  });
});
