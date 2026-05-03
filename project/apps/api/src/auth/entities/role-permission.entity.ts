import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sys_role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'resource_id', type: 'uuid' })
  resourceId: string;

  @Column('varchar', { array: true })
  actions: string[];

  @Column({ type: 'jsonb', nullable: true })
  conditions: object;

  @Column({ name: 'field_permissions', type: 'jsonb', nullable: true })
  fieldPermissions: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
