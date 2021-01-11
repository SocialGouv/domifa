import { hexEncoder } from "./hexEncoder.service";

describe("hexEncoder", () => {
  it("encode + decode should return input data", () => {
    const input = "sdqfqs f564sdf654sdf6sd5f sd5";
    expect(hexEncoder.decode(hexEncoder.encode(input))).toEqual(input);
  });
});
