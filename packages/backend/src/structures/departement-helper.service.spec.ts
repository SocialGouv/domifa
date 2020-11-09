import { AppTestContext, AppTestHelper } from "../util/test";
import { DepartementHelper } from "./departement-helper.service";

describe("Departement helper Service", () => {
  let service: DepartementHelper;

  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [],
      providers: [DepartementHelper],
    });
    service = context.module.get<DepartementHelper>(DepartementHelper);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("common case", () => {
    expect(service.getDepartementFromCodePostal("75000")).toEqual("75");
    expect(service.getDepartementFromCodePostal("49530")).toEqual("49");
    expect(service.getDepartementFromCodePostal("33600")).toEqual("33");
    expect(service.getDepartementFromCodePostal("01100")).toEqual("01");
  });

  it("invalid format", () => {
    expect(() => service.getDepartementFromCodePostal("7500")).toThrow();
    expect(() => service.getDepartementFromCodePostal("750000")).toThrow();
  });

  it("corse", () => {
    expect(service.getDepartementFromCodePostal("20146")).toEqual("2A");
    expect(service.getDepartementFromCodePostal("20000")).toEqual("2A");
    expect(service.getDepartementFromCodePostal("20090")).toEqual("2A");
    expect(service.getDepartementFromCodePostal("20200")).toEqual("2B");
    expect(service.getDepartementFromCodePostal("20600")).toEqual("2B");
  });

  it("exceptions", () => {
    expect(service.getDepartementFromCodePostal("97133")).toEqual("977");
    expect(service.getDepartementFromCodePostal("97150")).toEqual("978");
    expect(service.getDepartementFromCodePostal("05110")).toEqual("04");
    expect(service.getDepartementFromCodePostal("73670")).toEqual("38");
    expect(service.getDepartementFromCodePostal("01590")).toEqual("39");
  });
});
