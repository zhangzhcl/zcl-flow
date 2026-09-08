import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';
import { UsersService } from './users.service';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
} from './auth.dto';
import { AdminOnly, CurrentUser, Public } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.profile(user.sub);
  }

  @Post('change-password')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.auth.changePassword(user.sub, dto);
  }
}

/** Account provisioning, administrators only. */
@AdminOnly()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: JwtPayload,
  ) {
    return this.users.update(id, dto, actor.sub);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string) {
    return this.users.resetPassword(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() actor: JwtPayload) {
    await this.users.remove(id, actor.sub);
  }
}
