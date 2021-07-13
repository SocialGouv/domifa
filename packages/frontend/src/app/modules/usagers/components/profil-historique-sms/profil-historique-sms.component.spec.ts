import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilHistoriqueSmsComponent } from './profil-historique-sms.component';

describe('ProfilHistoriqueSmsComponent', () => {
  let component: ProfilHistoriqueSmsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueSmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilHistoriqueSmsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
