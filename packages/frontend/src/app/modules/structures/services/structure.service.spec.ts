import { APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { first } from "rxjs/operators";
import { JwtInterceptor } from "src/app/interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "src/app/interceptors/server-error.interceptor";
import { AuthService } from "src/app/services/auth.service";
import { Structure } from "../structure.interface";
import { StructureService } from "./structure.service";

describe("StructureService", () => {
  let service: StructureService;
  let authService: AuthService;

  beforeAll(async (done) => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([])],
      providers: [
        StructureService,
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useClass: ServerErrorInterceptor,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    service = TestBed.get(StructureService);
    authService = TestBed.get(AuthService);

    authService
      .login("ccastest@yopmail.com", "Azerty012345")
      .pipe(first())
      .subscribe(
        (user) => {
          done();
        },
        (error) => {
          done();
        }
      );
  });

  it("0. creation", async(() => {
    expect(service).toBeTruthy();
  }));

  it("1. getStructure & getAll", async(() => {
    /*service.find("").subscribe((structures: Structure[]) => {
      expect(structures.length).toEqual(1);
    });*/

    service.findOne(1).subscribe((structure: Structure) => {
      expect(structure.structureType).toEqual("ccas");
    });
  }));
});
