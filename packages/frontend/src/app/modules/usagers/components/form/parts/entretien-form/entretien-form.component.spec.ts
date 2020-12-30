import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { EntretienFormComponent } from "./entretien-form.component";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";

describe("EntretienFormComponent", () => {
  let component: EntretienFormComponent;
  let fixture: ComponentFixture<EntretienFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        RouterTestingModule,
        NgbModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      declarations: [EntretienFormComponent],
      providers: [],
    });
    fixture = TestBed.createComponent(EntretienFormComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  describe("getAttestation", () => {
    it("makes expected calls", () => {
      const usagerServiceStub: UsagerService = fixture.debugElement.injector.get(
        UsagerService
      );
      spyOn(usagerServiceStub, "attestation").and.callThrough();
      component.getAttestation();
      expect(usagerServiceStub.attestation).toHaveBeenCalled();
    });
  });
});
