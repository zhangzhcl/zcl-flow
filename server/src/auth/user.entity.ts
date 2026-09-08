import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'admin' | 'user';

/**
 * Platform account. Passwords are stored as scrypt hashes and never returned.
 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 60 })
  username: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', default: 'user' })
  role: UserRole;

  @Column({ type: 'varchar', default: '' })
  displayName: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  /** Forces a password change on next login flow (informational). */
  @Column({ type: 'boolean', default: true })
  mustChangePassword: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/** API-safe projection: never exposes the password hash. */
export interface UserView {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
  enabled: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export function toUserView(entity: UserEntity): UserView {
  return {
    id: entity.id,
    username: entity.username,
    role: entity.role,
    displayName: entity.displayName,
    enabled: entity.enabled,
    mustChangePassword: entity.mustChangePassword,
    lastLoginAt: entity.lastLoginAt,
    createdAt: entity.createdAt,
  };
}
