import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilDossierComponent } from './profil-dossier.component';

describe('ProfilDossierComponent', () => {
  let component: ProfilDossierComponent;
  let fixture: ComponentFixture<ProfilDossierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilDossierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
