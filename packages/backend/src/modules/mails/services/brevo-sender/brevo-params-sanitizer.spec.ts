import {
  sanitizeBrevoHeader,
  sanitizeBrevoParams,
  sanitizeBrevoText,
} from "./brevo-params-sanitizer";

describe("brevo-params-sanitizer", () => {
  describe("sanitizeBrevoText", () => {
    it("neutralizes template syntax", () => {
      expect(
        sanitizeBrevoText("{{ params.lien }} {% if x %}", { escapeHtml: false })
      ).toEqual("{ { params.lien } } { % if x % }");
    });

    it("removes invisible control characters but keeps line breaks", () => {
      expect(
        sanitizeBrevoText("abc\u202Edef\u0007\nligne 2", { escapeHtml: false })
      ).toEqual("abcdef\nligne 2");
    });

    it("escapes HTML and entities when enabled", () => {
      expect(
        sanitizeBrevoText("&lt;img src=x onerror=alert(1)&gt; <b>", {
          escapeHtml: true,
        })
      ).toEqual("&amp;lt;img src=x onerror=alert(1)&amp;gt; &lt;b&gt;");
    });

    it("leaves HTML untouched when escaping is disabled", () => {
      expect(sanitizeBrevoText("<b>", { escapeHtml: false })).toEqual("<b>");
    });
  });

  describe("sanitizeBrevoHeader", () => {
    it("removes line breaks and control characters", () => {
      expect(
        sanitizeBrevoHeader(" Jean\r\nBcc: pirate@example.org\t\u202E ")
      ).toEqual("Jean Bcc: pirate@example.org");
    });
  });

  describe("sanitizeBrevoParams", () => {
    it("cleans every string at any depth and keeps other values", () => {
      const date = new Date("2026-01-01");
      expect(
        sanitizeBrevoParams(
          {
            name: "{{ x }}",
            count: 3,
            empty: null,
            date,
            list: ["a\u202Eb", { nested: "{%" }],
          },
          { escapeHtml: true }
        )
      ).toEqual({
        name: "{ { x } }",
        count: 3,
        empty: null,
        date,
        list: ["ab", { nested: "{ %" }],
      });
    });

    it("keeps links usable when escaping is disabled", () => {
      const lien = "https://domifa.fr/reset?token=abc&userId=1";
      expect(sanitizeBrevoParams({ lien }, { escapeHtml: false })).toEqual({
        lien,
      });
    });
  });
});
