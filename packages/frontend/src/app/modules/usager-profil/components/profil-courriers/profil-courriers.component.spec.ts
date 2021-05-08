import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilCourriersComponent } from './profil-courriers.component';

describe('ProfilCourriersComponent', () => {
  let component: ProfilCourriersComponent;
  let fixture: ComponentFixture<ProfilCourriersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilCourriersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
