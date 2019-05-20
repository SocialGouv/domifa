import { Body, Controller, Get, HttpCode,  HttpStatus,  Post, Response } from '@nestjs/common';
import { User } from '../users/user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Controller("auth")
export class AuthController {
/*
    @Post('login')
    public async loginUser(@Response() res: any, @Body() body: User) {
      if (!(body && body.email && body.password)) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Email and password are required!' });
      }

      const user = await this.UsersService.getUserByEmail(body.email);

      if (user) {
        if (await this.UsersService.compareHash(body.password, user.password)) {
          return res.status(HttpStatus.OK).json(await this.authService.createToken(user.email));
        }
      }

      return res.status(HttpStatus.FORBIDDEN).json({ message: 'Email or password wrong!' });
    }

    @Post('register')
    public async registerUser(@Response() res: any, @Body() body: User) {
      if (!(body && body.email && body.password && body.last_name && body.first_name)) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Username and password are required!' });
      }

      const user = await this.UsersService.getUserByEmail(body.email);

      if (user) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Email exists' });
      } else {
        const userSave = await this.UsersService.create(body);
        if(userSave){
          body.password=undefined;
        }
        return res.status(HttpStatus.OK).json(userSave);
      }
      */
  }
