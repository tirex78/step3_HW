import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextBlockController } from './text-block.controller';
import { TextBlockService } from './text-block.service';
import { TextBlockEntity } from './entities/text-block.entity';
import { FilesModule } from 'src/files/files.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([TextBlockEntity]),
    ConfigModule,
    FilesModule,
  ],
  controllers: [TextBlockController],
  exports: [TextBlockService],
  providers: [TextBlockService]
})
export class TextBlockModule { }
