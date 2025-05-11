import { Test, TestingModule } from "@nestjs/testing";
import { UpdateOpenDataPlacesService } from "./update-open-data-places.service";

describe("UpdateOpenDataPlacesService", () => {
  let service: UpdateOpenDataPlacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateOpenDataPlacesService],
    }).compile();

    service = module.get<UpdateOpenDataPlacesService>(
      UpdateOpenDataPlacesService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
