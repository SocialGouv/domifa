import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilEtatCivilFormComponent } from './profil-etat-civil-form.component';

describe('ProfilEtatCivilFormComponent', () => {
  let component: ProfilEtatCivilFormComponent;
  let fixture: ComponentFixture<ProfilEtatCivilFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilEtatCivilFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilEtatCivilFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
