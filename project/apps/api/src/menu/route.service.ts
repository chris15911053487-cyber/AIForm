import { Injectable } from '@nestjs/common';
import { Menu } from './entities/menu.entity';
import { MenuTreeService } from './menu-tree.service';

export interface MenuRoute {
  name: string;
  path: string;
  component?: string;
  meta: { title: string; icon?: string; requiresAuth: boolean; menuId?: string; menuKind?: string };
  children?: MenuRoute[];
}

@Injectable()
export class RouteService {
  constructor(private treeService: MenuTreeService) {}

  generateRoutes(menus: Menu[]): MenuRoute[] {
    const tree = this.treeService.buildTree(menus);
    return this.convertToRoutes(tree);
  }

  private convertToRoutes(nodes: any[]): MenuRoute[] {
    return nodes
      .filter(n => n.visible && n.status === 'active')
      .map(n => ({
        name: n.name,
        path: n.path,
        component: n.component || undefined,
        meta: { title: n.name, icon: n.icon, requiresAuth: true, menuId: n.id, menuKind: n.menuKind, openMode: n.openMode },
        children: n.children?.length ? this.convertToRoutes(n.children) : undefined,
      }));
  }
}
