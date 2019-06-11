import {TestBed} from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { StructureService} from './structure.service';

describe('StructureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [StructureService]
    });
  });
  it('should be created', () => {
    const service: StructureService = TestBed.get(StructureService);
    expect(service).toBeTruthy();
  });
});
