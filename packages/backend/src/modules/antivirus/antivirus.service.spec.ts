import { createServer, Server, Socket } from "node:net";
import { AddressInfo } from "node:net";

import { AntivirusService } from "./antivirus.service";
import { AntivirusUnavailableError } from "./AntivirusUnavailableError";

const mockConfig = jest.fn();
jest.mock("../../config", () => ({
  get domifaConfig() {
    return mockConfig;
  },
}));

const INFECTED_MARKER = "infected-marker";

// Built at runtime so the repository never contains the EICAR signature
const EICAR = [
  "X5O!P%@AP[4\\PZX54(P^)7CC)7}$",
  "EICAR-STANDARD-ANTIVIRUS-",
  "TEST-FILE!$H+H*",
].join("");

type FakeClamdReply = "verdict" | "error";

function startFakeClamd(reply: FakeClamdReply): Promise<Server> {
  const server = createServer((socket: Socket) => {
    let received = Buffer.alloc(0);

    socket.on("data", (data: Buffer) => {
      received = Buffer.concat([received, data]);
      const payload = readInstream(received);
      if (payload === null) {
        return;
      }

      if (reply === "error") {
        socket.end("INSTREAM size limit exceeded. ERROR\0");
      } else if (payload.includes(INFECTED_MARKER)) {
        socket.end("stream: Fake.Test.Signature FOUND\0");
      } else {
        socket.end("stream: OK\0");
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

// Returns the streamed payload once the zero-length terminator is received
function readInstream(data: Buffer): string | null {
  const command = "zINSTREAM\0";
  let offset = command.length;
  const chunks: Buffer[] = [];

  while (offset + 4 <= data.length) {
    const size = data.readUInt32BE(offset);
    offset += 4;
    if (size === 0) {
      return Buffer.concat(chunks).toString("utf8");
    }
    if (offset + size > data.length) {
      return null;
    }
    chunks.push(data.subarray(offset, offset + size));
    offset += size;
  }
  return null;
}

async function initService(
  antivirus: Record<string, unknown>
): Promise<AntivirusService> {
  mockConfig.mockReturnValue({ antivirus });
  const service = new AntivirusService();
  await service.onModuleInit();
  return service;
}

describe("AntivirusService", () => {
  describe("with a fake clamd", () => {
    let server: Server;

    afterEach(async () => {
      await new Promise((resolve) => server.close(resolve));
    });

    it("returns clean for a clean file", async () => {
      server = await startFakeClamd("verdict");
      const service = await initService({
        host: "127.0.0.1",
        port: (server.address() as AddressInfo).port,
      });

      await expect(
        service.scanBuffer(Buffer.from("nom;prenom\nDupont;Jean\n"))
      ).resolves.toEqual({ isInfected: false });
    });

    it("returns the virus name for an infected file", async () => {
      server = await startFakeClamd("verdict");
      const service = await initService({
        host: "127.0.0.1",
        port: (server.address() as AddressInfo).port,
      });

      await expect(
        service.scanBuffer(Buffer.from(`content ${INFECTED_MARKER}`))
      ).resolves.toEqual({
        isInfected: true,
        viruses: ["Fake.Test.Signature"],
      });
    });

    it("throws when clamd answers with an error", async () => {
      server = await startFakeClamd("error");
      const service = await initService({
        host: "127.0.0.1",
        port: (server.address() as AddressInfo).port,
      });

      await expect(service.scanBuffer(Buffer.from("data"))).rejects.toThrow(
        AntivirusUnavailableError
      );
    });
  });

  it("throws when clamd is unreachable", async () => {
    const server = await startFakeClamd("verdict");
    const port = (server.address() as AddressInfo).port;
    await new Promise((resolve) => server.close(resolve));

    const service = await initService({
      host: "127.0.0.1",
      port,
    });

    await expect(service.scanBuffer(Buffer.from("data"))).rejects.toThrow(
      AntivirusUnavailableError
    );
  });

  // Real clamd from docker-compose.local.yml / docker-compose.tests.yml
  describe("with a real clamd", () => {
    let service: AntivirusService;

    beforeAll(async () => {
      service = await initService({
        host: "localhost",
        port: 3310,
      });
    });

    it("detects the EICAR test file", async () => {
      const result = await service.scanBuffer(Buffer.from(EICAR));

      expect(result.isInfected).toBe(true);
    });

    it("accepts a clean file", async () => {
      await expect(
        service.scanBuffer(Buffer.from("nom;prenom\nDupont;Jean\n"))
      ).resolves.toEqual({ isInfected: false });
    });
  });
});
