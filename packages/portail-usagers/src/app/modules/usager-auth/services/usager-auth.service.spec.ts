import { TestBed } from '@angular/core/testing';

import { UsagerAuthService } from './usager-auth.service';

describe('UsagerAuthService', () => {
  let service: UsagerAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsagerAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
