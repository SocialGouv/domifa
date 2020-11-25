# Gherkin | Codeceptjs | Puppeteer

## Configuration

Configurer `optional/e2e/.env` à partir de `optional/e2e/.env.e2e.local.example.env`.

## Install

```sh
# In this directory
$ yarn
```

## Usage

```sh
# Test the http://localhost:3000
$ yarn test
# alias to `yarn codeceptjs run --features`
```

By default the test will run in headless mode.  
If you what to see the browser define the `PUPPETEER_CHROME_HEADLESS` env variable.

```sh
export PUPPETEER_CHROME_HEADLESS=true
yarn test
```

You can change the tested URL by setting the CODECEPT_BASEURL

```sh
$ export CODECEPT_BASEURL=http://master.domifa.dev.factory.social.gouv.fr
# Test the http://master.domifa.dev.factory.social.gouv.fr
$ yarn test
```

## Rapport complet exporté sur une interaface, Allure : [a link](https://github.com/allure-framework/allure2)

```sh
# Run & display complete report with Allure plugin
$ yarn rapport
```

## Debug

```sh
# To run one test in debug mode
$ yarn test --steps --verbose --grep "@apropos"
```

Another way to debug is by pausing the tests

```feature
@my_test
Fonctionnalité: Mon test

  Scénario:
    Soit un navigateur web sur le site
    Quand je pause le test
    Alors je vois "foo"
```

`Quand je pause le test` means that the browser will pause there

## Practices

We follow the following rules to write idiomatics tests

- Initial Situation use "Soit" or "Given"
- Actions use "Quand" or ("When"
- Assertions use "Alors" or "Then"

[Check Codecept documentation](https://codecept.io/advanced/#debug)
