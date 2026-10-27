import { generateRegionUserCreatedEmailHtml } from "./region-user-created-email.template";

describe("generateRegionUserCreatedEmailHtml", () => {
  const html = generateRegionUserCreatedEmailHtml(
    {
      createdAt: new Date("2026-10-27T10:00:00Z"),
      region: "53",
      creator: {
        prenom: "Anne",
        nom: "Martin",
        email: "anne.martin@dreets.gouv.fr",
      },
      createdUser: {
        prenom: "<script>",
        nom: "Durand",
        email: "paul.durand@dreets.gouv.fr",
      },
    },
    "preprod"
  );

  it("names the region, the creator and the created account", () => {
    expect(html).toContain("53 - Bretagne");
    expect(html).toContain("anne.martin@dreets.gouv.fr");
    expect(html).toContain("paul.durand@dreets.gouv.fr");
    expect(html).toContain("27/10/2026 11:00:00");
  });

  it("escapes user-provided values", () => {
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
