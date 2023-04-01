import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, FindManyOptions, Repository } from 'typeorm';
import { TextBlockDto } from './dto/text-block.dto';
import { TextBlockEntity } from './entities/text-block.entity';
import { FilesService } from '../files/files.service';

@Injectable()
export class TextBlockService {
  constructor(
    @InjectRepository(TextBlockEntity)
    private textBlockRepository: Repository<TextBlockEntity>,
    private filesService: FilesService,
  ) { }

  // Get All TextBlock with options & pagination
  async getTextBlock(
    offset?: number,
    limit?: number,
    startId?: number,
    filtering?: object,
  ): Promise<{ items: TextBlockEntity[], count: number }> {

    const where: FindManyOptions<TextBlockEntity>['where'] = { ...filtering };

    let separateCount = 0;

    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.textBlockRepository.count();
    }

    const [items, count] = await this.textBlockRepository.findAndCount({
      where,
      relations: {
        images: true,
      },
      select: {
        createdAt: false,
        images: {
          filename: true,
          path: true
        }
      },
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  // Get TextBlock by id
  async getTextBlockById(id: number): Promise<TextBlockEntity> {
    const textBlock = await this.textBlockRepository.findOne(
      {
        where: { id },
        select: {
          images: {
            filename: true,
            path: true
          }
        },
        relations: {
          images: true,
        }
      },
    );

    if (!textBlock) {
      throw new HttpException(
        'TextBlock with this id was not found',
        HttpStatus.NOT_FOUND
      );
    }
    return textBlock;
  }

  async create(
    TextBlock: TextBlockDto
  ): Promise<{ essence: string, id: number }> {

    const newTextBlock = this.textBlockRepository.create(TextBlock);
    const { tableName } = this.textBlockRepository.metadata;

    await this.textBlockRepository.insert(newTextBlock);

    return {
      essence: tableName,
      id: newTextBlock.id
    };
  }

  // Create TextBlock with images from form-data
  async createTextBlock(
    TextBlock: TextBlockDto
  ): Promise<{ essence: string, newTextBlock: TextBlockEntity }> {

    const newTextBlock = this.textBlockRepository.create(TextBlock);
    const { tableName } = this.textBlockRepository.metadata;

    await this.textBlockRepository.insert(newTextBlock);

    return {
      essence: tableName,
      newTextBlock: newTextBlock
    };
  }

  // Update TextBlock
  async updateTextBlock(
    id: number,
    updateText: TextBlockDto
  ): Promise<TextBlockEntity> {

    await this.textBlockRepository.update(id, updateText);

    const updateTextBlock = await this.textBlockRepository.findOne({
      where: { id },
      relations: {
        images: true,
      },
    });

    if (updateTextBlock) {
      return updateTextBlock;
    }

    throw new HttpException(
      'TextBlock with this id was not found',
      HttpStatus.NOT_FOUND
    );
  }

  // Delete TextBlock
  async deleteTextBlock(id: number) {
    const setUnusedFiles = await this.filesService.setFilesUnused(id);

    // if(!setUnusedFiles.affected){
    //   throw new HttpException('File(s) with this id was not found', HttpStatus.NOT_FOUND);
    // }

    // Delete Text Block
    const response = await this.textBlockRepository.delete(id);
    if (!response.affected) {
      throw new HttpException('TextBlock with this id was not found', HttpStatus.NOT_FOUND);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'TextBlock has removed'
    };
  }
}
