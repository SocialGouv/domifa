import { hexEncoder } from "./hexEncoder.service";

describe("hexEncoder", () => {
  it("encode + decode should return input data", () => {
    const input = {
      id: 5,
      name: "Content",
    };
    const encoded = hexEncoder.encode(input);
    expect(encoded).toEqual(
      "\\x7b226964223a352c226e616d65223a22436f6e74656e74227d"
    );
    expect(hexEncoder.decode(encoded)).toEqual(input);
  });
});
