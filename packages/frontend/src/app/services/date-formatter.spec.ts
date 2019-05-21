import { inject, TestBed } from '@angular/core/testing';

import { NgbDateCustomParserFormatter } from './date-formatter';

describe('NgbDateCustomParserFormatter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgbDateCustomParserFormatter]
    });
  });

  it('should be created', inject([NgbDateCustomParserFormatter], (service: NgbDateCustomParserFormatter) => {
    expect(service).toBeTruthy();
  }));
});
