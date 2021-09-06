import { AbstractControl } from "@angular/forms";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { LANGUAGES, LANGUAGES_MAP } from ".";

const typeahead = ({ maxResults = 10 }: { maxResults: number }) => {
  return (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => _filterLanguages(term, { maxResults }))
    );
  };
};

const formatter = (languageCode: string) => {
  return LANGUAGES_MAP[languageCode]?.label;
};

const validator = (errorName = "language") =>
  function validate(control: AbstractControl): { [key: string]: any } | null {
    if (_isInvalid(control.value)) {
      const errorObj = {};
      errorObj[errorName] = true;
      return errorObj; // error
    }
    return null; // ok
  };

export const languagesAutocomplete = {
  typeahead,
  formatter,
  validator,
  _filterLanguages,
  _isInvalid,
};

function _isInvalid(value: string) {
  return value && LANGUAGES_MAP[value]?.isoCode === undefined;
}

function _filterLanguages(
  term: string,
  { maxResults = 10 }: { maxResults: number }
): any[] {
  return term.length < 2
    ? []
    : LANGUAGES.filter(
        (v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1
      )
        .slice(0, maxResults)
        .map((x) => x.isoCode);
}
