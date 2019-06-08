import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ DatabaseModule, AuthModule ],
      providers: [ AuthService, JwtService ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
  });
});
