import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuresCustomDocsTableComponent } from './structures-custom-docs-table.component';

describe('StructuresCustomDocsTableComponent', () => {
  let component: StructuresCustomDocsTableComponent;
  let fixture: ComponentFixture<StructuresCustomDocsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructuresCustomDocsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresCustomDocsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
