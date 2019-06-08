import { HttpClient, HttpHandler } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { AutocompleteAdresseService } from './autocomplete-adresse';

describe('AutocompleteAdresseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpHandler ],
      providers: [AutocompleteAdresseService, HttpClient]
    });
  });
   it('should be created', () => {
    const service: AutocompleteAdresseService = TestBed.get(AutocompleteAdresseService);
    expect(service).toBeTruthy();
  });
});
