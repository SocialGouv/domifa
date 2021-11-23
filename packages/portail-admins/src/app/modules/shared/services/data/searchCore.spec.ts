import { searchCore } from './searchCore';

it('trim', () => {
  expect(searchCore.trim('  \ttwo  words\n   \t  ')).toEqual('two  words');
});

it('clean', () => {
  expect(searchCore.clean('à la C@mpagne éÂ!')).toEqual('a la c@mpagne ea!');
});

it('buildWords', () => {
  expect(searchCore.buildWords('a few words')).toEqual(['a', 'few', 'words']);
  expect(searchCore.buildWords('one_word')).toEqual(['one_word']);
});