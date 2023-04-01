import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../users/guard/role.guard';
import { Role } from '../users/role.enum';
import { TextBlockDto } from './dto/text-block.dto';
import { TextBlockService } from './text-block.service';
import { PaginationParams } from '../utils/pagination-params';
import { FilesService } from 'src/files/files.service';
import { LocalFilesInterceptor } from '../files/files.interceptor';
import { TextBlockEntity } from './entities/text-block.entity';

@Controller('textBlock')
export class TextBlockController {
  constructor(
    private readonly textBlockService: TextBlockService,
    private readonly localFileService: FilesService
  ) { }

  // Get all textBlock
  @Get()
  async findAllTextBlock(
    @Query() { offset, limit, startId, ...options }: PaginationParams,
  ): Promise<{ items: TextBlockEntity[], count: number }> {
    return this.textBlockService.getTextBlock(offset, limit, startId, options);
  }

  // Get textBlock by id
  @Get(':id')
  async getTextBlockById(
    @Param('id') id: number
  ): Promise<TextBlockEntity> {
    return this.textBlockService.getTextBlockById(id);
  }

  // ADMIN
  // Add TextBlock & update Files added id & table
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  @Post('add')
  async create(
    @Body() textBlock: TextBlockDto
  ): Promise<{ id: number }> {

    const result = await this.textBlockService.create(textBlock);
    const fileDto = {
      id: result.id,
      essence: result.essence,
      images: textBlock.image
    };
    await this.localFileService.setEssenceForFiles(fileDto);
    return { id: result.id };
  }
  // 0. Multer - load images
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'image',
      path: '/textBlock',
      maxFiles: 5,
      fileFilter: (request: any, file: any, callback: any) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )

  // Create textBlock with images from form-data
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  @Post()
  async createTextBlock
    (
      @Body() textBlock: TextBlockDto,
      @UploadedFiles() files: Express.Multer.File[]
    ): Promise<TextBlockEntity> {
    const data = await this.textBlockService.createTextBlock(textBlock);
    const { newTextBlock } = data;

    await this.localFileService.saveFiles(files, newTextBlock.id, data.essence);
    
    return newTextBlock;
  }

  // Update textBlock
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  @Patch(':id')
  async updateTextBlock(
    @Param('id') id: number,
    @Body() textBlock: TextBlockDto,
  ): Promise<TextBlockEntity> {
    return this.textBlockService.updateTextBlock(id, textBlock);
  }

  // Delete textBlock
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  @Delete(':id')
  async deleteTextBlock(
    @Param('id') id: number
  ): Promise<{ statusCode: number, message: string }> {
    return this.textBlockService.deleteTextBlock(id);
  }
}
