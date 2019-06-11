import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MentionsLegalesComponent } from './mentions-legales.component';

describe('MentionsLegalesComponent', () => {
  let component: MentionsLegalesComponent;
  let fixture: ComponentFixture<MentionsLegalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MentionsLegalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MentionsLegalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
