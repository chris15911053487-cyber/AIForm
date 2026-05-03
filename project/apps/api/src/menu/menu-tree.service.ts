import { Injectable } from '@nestjs/common';
import { Menu } from './entities/menu.entity';

export interface MenuNode extends Menu {
  children?: MenuNode[];
}

@Injectable()
export class MenuTreeService {
  buildTree(menus: Menu[]): MenuNode[] {
    const map = new Map<string, MenuNode>();
    const roots: MenuNode[] = [];

    menus.forEach(m => map.set(m.id, { ...m, children: [] }));
    menus.forEach(m => {
      const node = map.get(m.id)!;
      if (m.parentId && map.has(m.parentId)) {
        map.get(m.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortNodes = (nodes: MenuNode[]) => {
      nodes.sort((a, b) => a.sort - b.sort);
      nodes.forEach(n => { if (n.children?.length) sortNodes(n.children); });
    };
    sortNodes(roots);
    return roots;
  }
}
