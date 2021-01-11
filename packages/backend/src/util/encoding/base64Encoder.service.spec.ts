import { base64Encoder } from "./base64Encoder.service";

const text = "sdqfqs f564sdf654sdf6sd5f sd5";
const base64 = "c2RxZnFzIGY1NjRzZGY2NTRzZGY2c2Q1ZiBzZDU=";
describe("base64Encoder", () => {
  it("base64Encoder.encode", () => {
    expect(base64Encoder.encode(text)).toEqual(base64);
  });
  it("base64Encoder.decode", () => {
    expect(base64Encoder.decode(base64)).toEqual(text);
  });
});
