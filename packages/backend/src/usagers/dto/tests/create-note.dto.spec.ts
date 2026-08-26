import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateNoteDto } from "../create-note.dto";

const build = (json: string) =>
  plainToInstance(CreateNoteDto, JSON.parse(json));

describe("CreateNoteDto — notes keep their line breaks", () => {
  it("accepts a multi-line note as typed in the textarea", async () => {
    const dto = build(
      `{ "message": "Passé ce matin.\\nRappeler la CAF avant vendredi.\\n\\n\\nDossier à jour." }`
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.message).toEqual(
      "Passé ce matin.\nRappeler la CAF avant vendredi.\n\nDossier à jour."
    );
  });

  it("strips markup but keeps the text and line structure", async () => {
    const dto = build(
      `{ "message": "<p>Ligne 1</p>\\n<img src=x onerror=alert(1)><b>Ligne 2</b>  \\r\\n<img src=x onerror=alert(1)>Ligne 3" }`
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.message).toEqual("Ligne 1\nLigne 2\nLigne 3");
  });

  it("rejects an empty, whitespace-only, non-string or oversized note", async () => {
    for (const message of ['""', '"  \\n\\n "', '"<b></b>"', "123", "null"]) {
      const dto = build(`{ "message": ${message} }`);
      expect(
        (await validate(dto, { whitelist: true })).map((e) => e.property)
      ).toEqual(["message"]);
    }
    const tooLong = build(`{ "message": "${"x".repeat(1001)}" }`);
    expect(
      (await validate(tooLong, { whitelist: true })).map((e) => e.property)
    ).toEqual(["message"]);
  });
});
