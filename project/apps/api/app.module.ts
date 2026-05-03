import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './src/common/common.module';
import { SnakeNamingStrategy } from './src/common/snake-naming.strategy';
import { AuthModule } from './src/auth/auth.module';
import { MenuModule } from './src/menu/menu.module';
import { DatasourceModule } from './src/datasource/datasource.module';
import { FormModule } from './src/form/form.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    CommonModule,
    AuthModule,
    MenuModule,
    DatasourceModule,
    FormModule,
  ],
})
export class AppModule {}
