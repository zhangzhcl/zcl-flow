import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBaseEntity } from './knowledge-base.entity';
import { KnowledgeChunkEntity } from './knowledge-chunk.entity';
import { KnowledgeAssetEntity } from './knowledge-asset.entity';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { ModelConfigEntity } from '../models/model-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KnowledgeBaseEntity,
      KnowledgeChunkEntity,
      KnowledgeAssetEntity,
      ModelConfigEntity,
    ]),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
