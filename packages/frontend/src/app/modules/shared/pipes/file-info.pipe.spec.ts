import { FileInfoPipe, formatFileSize } from "./file-info.pipe";

describe("FileInfoPipe", () => {
  const pipe = new FileInfoPipe();

  it("gives the format and the size", () => {
    expect(
      pipe.transform({ filetype: "application/pdf", filesize: 123_456 })
    ).toBe(".pdf, 121 Ko");
    expect(
      pipe.transform({
        filetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filesize: 2_621_440,
      })
    ).toBe(".docx, 2,5 Mo");
  });

  it("gives the format alone when the size is unknown", () => {
    expect(pipe.transform({ filetype: "image/png" })).toBe(".png");
    expect(pipe.transform({ filetype: "image/png", filesize: null })).toBe(
      ".png"
    );
  });

  it("returns an empty string without information", () => {
    expect(pipe.transform(null)).toBe("");
    expect(pipe.transform({ filetype: "unknown/type" })).toBe("");
  });

  it("never displays 0 Ko for a small file", () => {
    expect(formatFileSize(100)).toBe("1 Ko");
  });
});
