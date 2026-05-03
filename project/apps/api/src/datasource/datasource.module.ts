import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from './entities/data-source.entity';
import { PostgresAdapter } from './adapters/postgres.adapter';
import { DatasourceService } from './datasource.service';
import { DatasourceController } from './datasource.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataSource]),
    AuthModule,
  ],
  controllers: [DatasourceController],
  providers: [DatasourceService, PostgresAdapter],
  exports: [DatasourceService],
})
export class DatasourceModule {}
