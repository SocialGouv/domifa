import { DynamicModule } from '@nestjs/common';
import { ApmService } from './apm.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApmInterceptor } from './apm.interceptor';

export class ApmModule {
  static register(): DynamicModule {
    return {
      module: ApmModule,
      imports: [],
      providers: [
        ApmService,
        {
          provide: APP_INTERCEPTOR,
          useClass: ApmInterceptor
        }
      ],
      exports: [ApmService]
    };
  }
}
