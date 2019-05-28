import {TestBed} from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import {DocumentService} from './document.service';

describe('DocumentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      providers: [DocumentService]
    });
  });
  it('should be created', () => {
    const service: DocumentService = TestBed.get(DocumentService);
    expect(service).toBeTruthy();
  });
});
