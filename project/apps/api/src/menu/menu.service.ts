import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenuTreeService, MenuNode } from './menu-tree.service';
import { RouteService, MenuRoute } from './route.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu) private menuRepo: Repository<Menu>,
    private treeService: MenuTreeService,
    private routeService: RouteService,
    private dataSource: DataSource,
  ) {}

  async getTree(tenantId: string): Promise<MenuNode[]> {
    const menus = await this.menuRepo.find({ where: { tenantId }, order: { sort: 'ASC' } });
    return this.treeService.buildTree(menus);
  }

  async getTreeForUser(tenantId: string, _userId: string, roleIds: string[]): Promise<MenuNode[]> {
    if (roleIds.includes('admin')) return this.getTree(tenantId);
    return this.getTree(tenantId);
  }

  async getRoutes(tenantId: string): Promise<MenuRoute[]> {
    const menus = await this.menuRepo.find({ where: { tenantId }, order: { sort: 'ASC' } });
    return this.routeService.generateRoutes(menus);
  }

  async findAll(tenantId: string): Promise<Menu[]> {
    return this.menuRepo.find({ where: { tenantId }, order: { sort: 'ASC' } });
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('菜单不存在');
    return menu;
  }

  async create(dto: CreateMenuDto & { tenantId?: string }): Promise<Menu> {
    const data = {
      ...dto,
      menuKind: dto.menuKind || 'builtin',
      sort: dto.sort ?? 0,
      visible: dto.visible ?? true,
      status: dto.status || 'active',
      filterSchema: dto.menuKind === 'report' ? (dto.filterSchema || []) : [],
      columnLabels: dto.menuKind === 'report' ? (dto.columnLabels || {}) : {},
      columnNameMapping: dto.menuKind === 'report' ? (dto.columnNameMapping || {}) : {},
      openMode: dto.openMode || 'embed',
    };
    return this.menuRepo.save(data as unknown as Menu);
  }

  async update(id: string, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    const data: any = { ...dto };
    // For builtin menus, clear report-specific fields
    const menuKind = data.menuKind ?? menu.menuKind ?? 'builtin';
    if (menuKind === 'builtin') {
      data.queryTemplate = null;
      data.filterSchema = [];
      data.columnLabels = {};
      data.columnNameMapping = {};
      data.detailQueryTemplate = null;
      data.detailKeyColumn = null;
      data.aiPrompt = null;
    }
    Object.assign(menu, data);
    return this.menuRepo.save(menu);
  }

  async delete(id: string): Promise<void> {
    const result = await this.menuRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('菜单不存在');
  }

  async executeQuery(menuId: string, queryParams: Record<string, string>): Promise<{ columns: string[]; rows: any[]; total: number }> {
    const menu = await this.findOne(menuId);
    if (!menu.queryTemplate) {
      throw new BadRequestException('该菜单未配置 SQL 模板');
    }

    let sql = menu.queryTemplate;
    const params: any[] = [];
    const paramOrder: string[] = [];

    // Replace @paramName with $1, $2, etc.
    sql = sql.replace(/@(\w+)/g, (_match, paramName: string) => {
      if (!paramOrder.includes(paramName)) {
        paramOrder.push(paramName);
      }
      const idx = paramOrder.indexOf(paramName) + 1;
      return `$${idx}`;
    });

    for (const name of paramOrder) {
      params.push(queryParams[name] ?? '');
    }

    const rows = await this.dataSource.query(sql, params);
    const total = rows.length;
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { columns, rows, total };
  }
}
