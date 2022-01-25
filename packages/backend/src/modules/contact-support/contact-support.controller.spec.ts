import { Test, TestingModule } from "@nestjs/testing";
import { ContactSupportController } from "./contact-support.controller";

describe("ContactSupportController", () => {
  let controller: ContactSupportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactSupportController],
    }).compile();

    controller = module.get<ContactSupportController>(ContactSupportController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
