module.exports = {
  root: true,
  ignorePatterns: ["dist", "coverage"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  overrides: [
    {
      files: ["*.ts"],
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
      ],

      rules: {
        "@typescript-eslint/array-type": [
          "error",
          {
            default: "array",
          },
        ],
        "@typescript-eslint/member-delimiter-style": [
          "off",
          {
            multiline: {
              delimiter: "none",
              requireLast: true,
            },
            singleline: {
              delimiter: "semi",
              requireLast: false,
            },
          },
        ],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/quotes": [
          "off",
          "single",
          {
            allowTemplateLiterals: true,
          },
        ],
        "@typescript-eslint/semi": ["off", null],
        "@typescript-eslint/type-annotation-spacing": "off",
        "@typescript-eslint/explicit-member-accessibility": [
          "error",
          {
            overrides: {
              constructors: "off",
            },
          },
        ],
        "arrow-parens": ["off", "always"],
        "brace-style": ["off", "off"],
        "dot-notation": "error",
        "eol-last": "off",
        "id-denylist": [
          "error",
          "any",
          "Number",
          "number",
          "String",
          "string",
          "Boolean",
          "boolean",
          "Undefined",
          "undefined",
        ],
        "@angular-eslint/no-empty-lifecycle-method": "off",
        "import/no-extraneous-dependencies": "off",
        "import/no-internal-modules": "off",
        indent: "off",
        "linebreak-style": "off",
        "max-classes-per-file": ["error", 1],
        "max-len": "off",
        "new-parens": "off",
        "newline-per-chained-call": "off",
        "no-duplicate-case": "error",
        "no-duplicate-imports": "error",
        "no-empty": "error",
        "no-empty-function": "off",
        "no-extra-bind": "error",
        "no-extra-semi": "off",
        "no-fallthrough": "off",
        "no-irregular-whitespace": "off",
        "no-new-func": "error",
        "no-redeclare": "error",
        "no-return-await": "error",
        "no-sequences": "error",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "error",
        "no-sparse-arrays": "error",
        "no-template-curly-in-string": "error",
        "no-trailing-spaces": "off",
        "no-unused-expressions": "error",
        "no-use-before-define": "off",
        "padded-blocks": [
          "off",
          {
            blocks: "never",
          },
          {
            allowSingleLineBlocks: true,
          },
        ],
        "prefer-object-spread": "error",
        "quote-props": "off",
        semi: "off",
        "space-before-function-paren": "off",
        "space-in-parens": ["off", "never"],
      },
    },
    {
      files: ["*.html"],
      extends: ["plugin:@angular-eslint/template/recommended"],
      rules: {},
    },
  ],
};
