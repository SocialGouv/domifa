import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  NestInterceptor,
  Type,
} from "@nestjs/common";
import { FileInterceptor, MulterModuleOptions } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { Observable } from "rxjs";

import { AntivirusService } from "./antivirus.service";
import { AntivirusStorageEngine } from "./antivirus-storage.engine";

// Drop-in replacement for FileInterceptor: the file reaches `storage`
// (memory by default) only once its detected type is allowed and the
// antivirus scan is clean.
export function AntivirusFileInterceptor(
  fieldName: string,
  allowedMimeTypes: readonly string[],
  localOptions: MulterModuleOptions = {}
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    private readonly fileInterceptor: NestInterceptor;

    constructor(@Inject(AntivirusService) antivirusService: AntivirusService) {
      const Interceptor = FileInterceptor(fieldName, {
        ...localOptions,
        storage: new AntivirusStorageEngine(
          antivirusService,
          localOptions.storage ?? memoryStorage(),
          allowedMimeTypes
        ),
      });
      this.fileInterceptor = new Interceptor();
    }

    public intercept(
      context: ExecutionContext,
      next: CallHandler
    ): Promise<Observable<unknown>> {
      return this.fileInterceptor.intercept(context, next) as Promise<
        Observable<unknown>
      >;
    }
  }

  return mixin(MixinInterceptor);
}
