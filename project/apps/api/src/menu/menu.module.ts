import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MenuTreeService } from './menu-tree.service';
import { RouteService } from './route.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  controllers: [MenuController],
  providers: [MenuService, MenuTreeService, RouteService],
  exports: [MenuService],
})
export class MenuModule {}
