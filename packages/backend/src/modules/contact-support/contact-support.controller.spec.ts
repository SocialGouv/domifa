import { Test, TestingModule } from "@nestjs/testing";
import { ContactSupportController } from "./contact-support.controller";
import { MailsModule } from "../mails/mails.module";
import { AntivirusModule } from "../antivirus";

describe("ContactSupportController", () => {
  let controller: ContactSupportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactSupportController],
      imports: [MailsModule, AntivirusModule],
    }).compile();

    controller = module.get<ContactSupportController>(ContactSupportController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
