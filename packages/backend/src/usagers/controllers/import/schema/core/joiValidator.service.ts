import * as Joi from "joi";

const custom = Joi.extend((joi) => {
  return {
    type: "million",
    base: joi.number(),
    messages: {
      "million.base": "{{#label}} must be at least a million",
      "million.big": "{{#label}} must be at least five millions",
      "million.round": "{{#label}} must be a round number",
      "million.dividable": "{{#label}} must be dividable by {{#q}}",
    },
    coerce(value, helpers) {
      // Only called when prefs.convert is true

      if (helpers.schema.$_getRule("round")) {
        return { value: Math.round(value) };
      }
    },
    validate(value, helpers) {
      // Base validation regardless of the rules applied

      if (value < 1000000) {
        return { value, errors: helpers.error("million.base") };
      }

      // Check flags for global state

      if (helpers.schema.$_getFlag("big") && value < 5000000) {
        return { value, errors: helpers.error("million.big") };
      }
    },
    rules: {
      big: {
        alias: "large",
        method() {
          return this.$_setFlag("big", true);
        },
      },
      round: {
        convert: true, // Dual rule: converts or validates
        method() {
          return this.$_addRule("round");
        },
        validate(value, helpers, args, options) {
          // Only called when prefs.convert is false (due to rule convert option)

          if (value % 1 !== 0) {
            return helpers.error("million.round");
          }
        },
      },
      dividable: {
        multi: true, // Rule supports multiple invocations
        method(q) {
          return this.$_addRule({ name: "dividable", args: { q } });
        },
        args: [
          {
            name: "q",
            ref: true,
            assert: (value) => typeof value === "number" && !isNaN(value),
            message: "must be a number",
          },
        ],
        validate(value, helpers, args, options) {
          if (value % args.q === 0) {
            return value; // Value is valid
          }

          return helpers.error("million.dividable", { q: args.q });
        },
      },
      even: {
        method() {
          // Rule with only method used to alias another rule

          return this.dividable(2);
        },
      },
    },
  };
});
