import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilHistoriqueComponent } from './profil-historique.component';

describe('ProfilHistoriqueComponent', () => {
  let component: ProfilHistoriqueComponent;
  let fixture: ComponentFixture<ProfilHistoriqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilHistoriqueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
