import { Test, TestingModule } from "@nestjs/testing";
import { ContactSupportController } from "./contact-support.controller";
import { MailsModule } from "../mails/mails.module";

describe("ContactSupportController", () => {
  let controller: ContactSupportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactSupportController],
      imports: [MailsModule],
    }).compile();

    controller = module.get<ContactSupportController>(ContactSupportController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
