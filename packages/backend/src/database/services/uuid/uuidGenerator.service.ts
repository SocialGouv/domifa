import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

export const uuidGenerator = {
  byName,
  byNameAndDomain,
  random,
};

function random() {
  return uuidv4();
}

// https://en.wikipedia.org/wiki/Universally_unique_identifier#Versions_3_and_5_(namespace_name-based)

// examples:

// const domainNamespace = uuidGenerator.byName('my-domain.com');
// const myUUIDByDomain = uuidGenerator.byName('value', domainNamespace);

// const localNamespace = uuidGenerator.random();
// const myUUIDLocal = uuidGenerator.byName('value', localNamespace);

function byName(value: string, namespace?: string) {
  if (!namespace) {
    namespace = uuidv5.URL;
  }
  return uuidv5(value, namespace);
}

function byNameAndDomain(value: string, domain: string) {
  const domainNamespace = byName(domain);
  return byName(value, domainNamespace);
}
