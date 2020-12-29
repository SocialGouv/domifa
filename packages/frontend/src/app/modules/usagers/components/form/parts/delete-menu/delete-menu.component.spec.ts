import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { DeleteMenuComponent } from "./delete-menu.component";

describe("DeleteMenuComponent", () => {
  let component: DeleteMenuComponent;
  let fixture: ComponentFixture<DeleteMenuComponent>;

  beforeEach(() => {
    const routerStub = () => ({ navigate: (array) => ({}) });
    const ngbModalStub = () => ({
      open: (content) => ({}),
      dismissAll: () => ({}),
    });
    const toastrServiceStub = () => ({
      success: (string) => ({}),
      error: (string) => ({}),
    });
    const authServiceStub = () => ({
      currentUserSubject: { subscribe: (f) => f({}) },
    });
    const usagerServiceStub = () => ({
      delete: (id) => ({ subscribe: (f) => f({}) }),
      deleteRenew: (id) => ({ subscribe: (f) => f({}) }),
    });
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DeleteMenuComponent],
      providers: [
        { provide: Router, useFactory: routerStub },
        { provide: NgbModal, useFactory: ngbModalStub },
        { provide: ToastrService, useFactory: toastrServiceStub },
        { provide: AuthService, useFactory: authServiceStub },
        { provide: UsagerService, useFactory: usagerServiceStub },
      ],
    });
    fixture = TestBed.createComponent(DeleteMenuComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
