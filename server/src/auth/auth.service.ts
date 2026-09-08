import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserView, toUserView } from './user.entity';
import { ChangePasswordDto, LoginDto } from './auth.dto';
import { generatePassword, hashPassword, verifyPassword } from './password.util';

export interface JwtPayload {
  sub: string;
  username: string;
  role: 'admin' | 'user';
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Bootstrap the first administrator so the platform is never locked out. */
  async onModuleInit(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) return;

    const username = this.config.get<string>('ADMIN_USERNAME', 'admin');
    const configured = this.config.get<string>('ADMIN_PASSWORD', '');
    const password = configured || generatePassword(12);

    await this.repo.save(
      this.repo.create({
        username,
        passwordHash: hashPassword(password),
        role: 'admin',
        displayName: 'Administrator',
        enabled: true,
        mustChangePassword: !configured,
      }),
    );

    this.logger.warn('==============================================');
    this.logger.warn(`Initial admin account created: ${username}`);
    this.logger.warn(
      configured
        ? 'Password: taken from ADMIN_PASSWORD in .env'
        : `Password: ${password}  (generated once, please change after login)`,
    );
    this.logger.warn('==============================================');
  }

  async login(dto: LoginDto) {
    const user = await this.repo.findOneBy({ username: dto.username });
    if (!user || !verifyPassword(dto.password, user.passwordHash)) {
      // Same message for unknown user and wrong password (no account enumeration).
      throw new UnauthorizedException('Invalid username or password');
    }
    if (!user.enabled) {
      throw new UnauthorizedException('Account is disabled');
    }

    user.lastLoginAt = new Date();
    await this.repo.save(user);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    return {
      token: await this.jwt.signAsync(payload),
      user: toUserView(user),
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async profile(userId: string): Promise<UserView> {
    const user = await this.findById(userId);
    if (!user) throw new UnauthorizedException('Account no longer exists');
    return toUserView(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new UnauthorizedException('Account no longer exists');
    if (!verifyPassword(dto.currentPassword, user.passwordHash)) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must differ from the current one');
    }
    user.passwordHash = hashPassword(dto.newPassword);
    user.mustChangePassword = false;
    await this.repo.save(user);
  }
}
