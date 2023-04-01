import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  StreamableFile,
  Res,
  ParseIntPipe,
  BadRequestException,
  UploadedFiles,
  Delete,
  Body
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { FilesService } from './files.service';
import { LocalFilesInterceptor } from './files.interceptor';
import { FileEntity } from './entities/file.entity';

@Controller('files')
@UseInterceptors(ClassSerializerInterceptor)
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  //Get files by Id
  @Get(':id')
  async getFileById(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.filesService.getFileById(id);

    const stream = createReadStream(join(process.cwd(), file.path));

    response.set({
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Type': file.mimetype,
    });
    return new StreamableFile(stream);
  }

  // Get all files by Essence
  @Get('/essence/:id')
  async getFilesByEssence(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FileEntity> {
    const files = await this.filesService.getFilesByEssence(id);

    return files;
  }

  // Delete file by Id
  @Delete('remove/:id')
  async removeFilebyId(@Param('id') fileId: number): Promise<{statusCode:number, message:string}> {
    const files = await this.filesService.deleteFileById(fileId);

    return files;
  }

  // Remove all unused files
  @Delete('remove')
  async removeUnusedFiles(): Promise<string> {
    const files = await this.filesService.removeUnusedAndOldFiles();

    return files;
  }

  // Set file unused
  @Post('unused/:id')
  async setUnusedFiles(
    @Param('id') id: number
  ): Promise<void> {
    await this.filesService.setFilesUnused(id);
  }

  // 0. Multer - load images
  @Post('upload')
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'image',
      path: '/file',
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
  // 1. Load multiple image
  async addFiles(
    @Body() essenceFromBody: { essenceId: number, essence: string },
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string[]> {
    const { essenceId = null, essence = null } = essenceFromBody;
    const images = await this.filesService.saveFiles(files, essenceId, essence);

    return images;
  }
}