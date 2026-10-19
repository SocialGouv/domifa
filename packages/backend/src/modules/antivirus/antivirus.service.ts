import { Injectable, OnModuleInit } from "@nestjs/common";
import NodeClam from "clamscan";
import { Readable } from "node:stream";

import { domifaConfig } from "../../config";
import { ANTIVIRUS_SCAN_TIMEOUT_MS } from "./antivirus.constants";
import { AntivirusScanResult } from "./antivirus.types";
import { AntivirusUnavailableError } from "./AntivirusUnavailableError";

@Injectable()
export class AntivirusService implements OnModuleInit {
  private scanner: NodeClam | null = null;

  public async onModuleInit(): Promise<void> {
    const { host, port } = domifaConfig().antivirus;

    this.scanner = await new NodeClam().init({
      removeInfected: false,
      quarantineInfected: false,
      scanLog: null,
      debugMode: false,
      preference: "clamdscan",
      clamscan: { active: false },
      clamdscan: {
        host,
        port,
        socket: null,
        timeout: ANTIVIRUS_SCAN_TIMEOUT_MS,
        localFallback: false,
        bypassTest: true,
        active: true,
      },
    });
  }

  public async scanBuffer(buffer: Buffer): Promise<AntivirusScanResult> {
    if (!this.scanner) {
      throw new AntivirusUnavailableError("Scanner not initialized");
    }

    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error("Scan timeout")),
        ANTIVIRUS_SCAN_TIMEOUT_MS
      );
    });

    try {
      const { isInfected, viruses } = await Promise.race([
        this.scanner.scanStream(Readable.from([buffer])),
        timeout,
      ]);

      if (isInfected === true) {
        return { isInfected: true, viruses };
      }
      if (isInfected === false) {
        return { isInfected: false };
      }
      throw new Error("Inconclusive scan result");
    } catch (error) {
      throw new AntivirusUnavailableError(error);
    } finally {
      clearTimeout(timer);
    }
  }
}
