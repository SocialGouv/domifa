import { TestBed } from '@angular/core/testing';

import { UsagerProfilService } from './usager-profil.service';

describe('UsagerProfilService', () => {
  let service: UsagerProfilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsagerProfilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
