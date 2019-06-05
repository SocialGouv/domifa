import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UsagersProfilComponent } from './profil-component';

describe('UsagersProfilComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule.forRoot(), ReactiveFormsModule, FormsModule, HttpClientModule, HttpClientTestingModule, RouterModule.forRoot([])],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],

      declarations: [UsagersProfilComponent],
    })
    .compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(UsagersProfilComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
