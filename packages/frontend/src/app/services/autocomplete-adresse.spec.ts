import { HttpClient } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { AutocompleteAdresseService } from './autocomplete-adresse';

describe('AutocompleteAdresseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AutocompleteAdresseService, HttpClient]
    });
  });
   it('should be created', inject([AutocompleteAdresseService], (service: AutocompleteAdresseService) => {
    expect(service).toBeTruthy();
  }));
});
