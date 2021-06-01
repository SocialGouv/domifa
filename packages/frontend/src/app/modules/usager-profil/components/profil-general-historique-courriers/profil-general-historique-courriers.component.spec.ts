import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilGeneralHistoriqueCourriersComponent } from './profil-general-historique-courriers.component';

describe('ProfilGeneralHistoriqueCourriersComponent', () => {
  let component: ProfilGeneralHistoriqueCourriersComponent;
  let fixture: ComponentFixture<ProfilGeneralHistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilGeneralHistoriqueCourriersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilGeneralHistoriqueCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
