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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validator(control: AbstractControl): { [key: string]: any } | null {
  return _isInvalid(control.value) ? { language: true } : null;
}

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
): string[] {
  return term.length < 2
    ? []
    : LANGUAGES.filter(
        (v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1
      )
        .slice(0, maxResults)
        .map((x) => x.isoCode);
}
