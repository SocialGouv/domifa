import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule, HttpHandler } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';

describe('AuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule, RouterModule.forRoot([])],
      providers: [AuthGuardService, AuthService, { provide: APP_BASE_HREF, useValue : '/' }],
    });
  });
  it('should be created', inject([AuthGuardService], (service: AuthGuardService) => {
    expect(service).toBeTruthy();
  }));

});
