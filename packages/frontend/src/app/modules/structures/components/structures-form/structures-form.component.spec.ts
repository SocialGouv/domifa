import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuresFormComponent } from './structures-form.component';

describe('StructuresFormComponent', () => {
  let component: StructuresFormComponent;
  let fixture: ComponentFixture<StructuresFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructuresFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
