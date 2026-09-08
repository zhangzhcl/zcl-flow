import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity, UserView, toUserView } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './auth.dto';
import { generatePassword, hashPassword } from './password.util';

/** Result of account provisioning: the plaintext password is shown only once. */
export interface ProvisionedUser {
  user: UserView;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserView[]> {
    const users = await this.repo.find({ order: { createdAt: 'ASC' } });
    return users.map(toUserView);
  }

  private async findEntity(id: string): Promise<UserEntity> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** Create an account; generates a strong password when none is supplied. */
  async create(dto: CreateUserDto): Promise<ProvisionedUser> {
    const username = dto.username.trim().toLowerCase();
    const existing = await this.repo.findOneBy({ username });
    if (existing) {
      throw new ConflictException(`Username "${username}" is already taken`);
    }

    const password = dto.password?.trim() || generatePassword(12);
    const user = await this.repo.save(
      this.repo.create({
        username,
        displayName: dto.displayName?.trim() || username,
        role: dto.role ?? 'user',
        passwordHash: hashPassword(password),
        enabled: true,
        mustChangePassword: !dto.password,
      }),
    );
    return { user: toUserView(user), password };
  }

  async update(id: string, dto: UpdateUserDto, actorId: string): Promise<UserView> {
    const user = await this.findEntity(id);

    if (dto.displayName !== undefined) user.displayName = dto.displayName.trim();

    // Guard rails: never let an admin lock the platform out of admin access.
    if (dto.role !== undefined && dto.role !== user.role) {
      if (user.id === actorId) {
        throw new BadRequestException('You cannot change your own role');
      }
      if (user.role === 'admin' && (await this.countOtherAdmins(user.id)) === 0) {
        throw new BadRequestException('At least one administrator must remain');
      }
      user.role = dto.role;
    }

    if (dto.enabled !== undefined && dto.enabled !== user.enabled) {
      if (user.id === actorId) {
        throw new BadRequestException('You cannot disable your own account');
      }
      if (!dto.enabled && user.role === 'admin' && (await this.countOtherAdmins(user.id)) === 0) {
        throw new BadRequestException('At least one administrator must remain');
      }
      user.enabled = dto.enabled;
    }

    return toUserView(await this.repo.save(user));
  }

  /** Issue a fresh random password for an account. */
  async resetPassword(id: string): Promise<ProvisionedUser> {
    const user = await this.findEntity(id);
    const password = generatePassword(12);
    user.passwordHash = hashPassword(password);
    user.mustChangePassword = true;
    return { user: toUserView(await this.repo.save(user)), password };
  }

  async remove(id: string, actorId: string): Promise<void> {
    const user = await this.findEntity(id);
    if (user.id === actorId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    if (user.role === 'admin' && (await this.countOtherAdmins(user.id)) === 0) {
      throw new BadRequestException('At least one administrator must remain');
    }
    await this.repo.remove(user);
  }

  private countOtherAdmins(excludeId: string): Promise<number> {
    return this.repo.count({ where: { role: 'admin', enabled: true, id: Not(excludeId) } });
  }
}
