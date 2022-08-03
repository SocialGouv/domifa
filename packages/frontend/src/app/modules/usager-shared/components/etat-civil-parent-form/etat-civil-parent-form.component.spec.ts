import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatCivilParentFormComponent } from './etat-civil-parent-form.component';

describe('EtatCivilParentFormComponent', () => {
  let component: EtatCivilParentFormComponent;
  let fixture: ComponentFixture<EtatCivilParentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EtatCivilParentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EtatCivilParentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
