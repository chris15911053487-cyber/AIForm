import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sys_menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ length: 500 })
  path: string;

  @Column({ length: 500, nullable: true })
  component: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ default: true })
  visible: boolean;

  @Column({ default: false })
  cache: boolean;

  @Column({ default: 'active', length: 20 })
  status: string;

  // === 菜单类型 ===
  @Column({ name: 'menu_kind', length: 32, default: 'builtin' })
  menuKind: string;

  // === 报表配置 ===
  @Column({ name: 'query_template', type: 'text', nullable: true })
  queryTemplate: string;

  @Column({ name: 'filter_schema_json', type: 'jsonb', nullable: true })
  filterSchema: object[];

  @Column({ name: 'column_labels_json', type: 'jsonb', nullable: true })
  columnLabels: Record<string, string>;

  @Column({ name: 'column_name_mapping_json', type: 'jsonb', nullable: true })
  columnNameMapping: Record<string, string>;

  // === 行详情 ===
  @Column({ name: 'detail_query_template', type: 'text', nullable: true })
  detailQueryTemplate: string;

  @Column({ name: 'detail_key_column', length: 256, nullable: true })
  detailKeyColumn: string;

  @Column({ name: 'detail_key_param', length: 128, nullable: true, default: 'detailKey' })
  detailKeyParam: string;

  @Column({ name: 'detail_key_type', length: 32, nullable: true, default: 'string' })
  detailKeyType: string;

  // === AI ===
  @Column({ name: 'ai_prompt', type: 'text', nullable: true })
  aiPrompt: string;

  // === 打开方式 ===
  @Column({ name: 'open_mode', type: 'varchar', length: 32, default: 'embed' })
  openMode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
