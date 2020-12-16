import { AbstractControl } from "@angular/forms";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { LANGUAGES, LANGUAGES_MAP } from "./constants";

const typeahead = ({ maxResults = 10 }: { maxResults: number }) => (
  text$: Observable<string>
) => {
  return text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map((term) => _filterLanguages(term, { maxResults }))
  );
};

const formatter = (languageCode: string) => LANGUAGES_MAP[languageCode]?.label;

const validator = (errorName = "language") =>
  function validate(control: AbstractControl): { [key: string]: any } | null {
    if (_isInvalid(control.value)) {
      return { errorName: true }; // error
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
