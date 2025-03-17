import { readFileSync } from "fs";
import { CUSTOM_DOCS_LABELS } from "../../../../_common/model";
import {
  extractTagsFromTemplate,
  validateCustomDocKeys,
  validateDocTemplate,
} from "../validateCustomDoc";
import { resolve } from "path";

describe("validateCustomDocKeys", () => {
  it("should return true when the keys array is empty", () => {
    const emptyKeys = [];
    const result = validateCustomDocKeys(emptyKeys);
    expect(result).toBe(true);
  });

  it("should return true when all available keys are provided", () => {
    const allKeys = Object.keys(CUSTOM_DOCS_LABELS);
    const result = validateCustomDocKeys(allKeys);
    expect(result).toBe(true);
  });

  it("should return false when at least one key is invalid", () => {
    const invalidKeys = ["NOM", "PRENOM", "PRE_NOM"];
    const result = validateCustomDocKeys(invalidKeys);
    expect(result).toBe(false);
  });
});

describe("extractTagsFromTemplate: should return ", () => {
  it("should extract all tags from the document", () => {
    const filePath = resolve(__dirname, "./docx-for-tests/all_keys.docx");
    const docxBuffer = readFileSync(filePath);
    const extractedTags = extractTagsFromTemplate(docxBuffer).sort();
    const EXPECTED_TAGS = Object.keys(CUSTOM_DOCS_LABELS).sort();

    expect(EXPECTED_TAGS).toEqual(extractedTags);
    expect(EXPECTED_TAGS.length).toEqual(extractedTags.length);
  });
});

describe("Should load and check if a doc is valid", () => {
  beforeAll(() => {});

  it("Should return true if the doc is valid", async () => {
    const filePath = resolve(__dirname, "./docx-for-tests/all_keys.docx");
    const docxBuffer = readFileSync(filePath);
    const result = await validateDocTemplate(docxBuffer);
    expect(result.isValid).toEqual(true);
  });

  it("Should return false if there are an unclosed key", async () => {
    const filePath = resolve(__dirname, "./docx-for-tests/unclosed_tag.docx");
    const docxBuffer = readFileSync(filePath);
    const result = await validateDocTemplate(docxBuffer);
    expect(result.isValid).toEqual(false);
  });

  it("Should return false if there are an unknown tag", async () => {
    const filePath = resolve(__dirname, "./docx-for-tests/unknown_tag.docx");
    const docxBuffer = readFileSync(filePath);
    const extractedTags = extractTagsFromTemplate(docxBuffer).sort();

    const areKeysValid = validateCustomDocKeys(extractedTags);
    expect(areKeysValid).toEqual(false);
  });
});
