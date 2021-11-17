import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuresCustomDocsComponent } from './structures-custom-docs.component';

describe('StructuresCustomDocsComponent', () => {
  let component: StructuresCustomDocsComponent;
  let fixture: ComponentFixture<StructuresCustomDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructuresCustomDocsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresCustomDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
