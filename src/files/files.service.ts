import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rm } from 'fs/promises';
import { join } from 'path';
import { LocalFileDto } from './dto/file.dto';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
  ) { }

  // Save file to DB
  async saveFiles(files: any, essenceId?: number, essence?: string): Promise<string[]> {
    const newFiles = [];
    files.forEach((file: LocalFileDto) => {
      const fileReponse: object = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        essenceId: essenceId || null,
        essence: essence || null
      };
      newFiles.push(fileReponse);
    });
    await this.filesRepository.insert(newFiles);

    return newFiles;
  }

  // Set essenceId & essence for files
  async setEssenceForFiles(data: any): Promise<void> {
    for (const el of data.images.split(',')) {
      await this.filesRepository.update(
        el,
        {
          essence: data.essence,
          essenceId: data.id
        }
      );
    }
  }

  // Get file by id
  async getFileById(fileId: number): Promise<FileEntity> {
    const file = await this.filesRepository.findOneBy({ id: fileId });

    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  // Get files by essence
  async getFilesByEssence(essenceId: number): Promise<FileEntity> {

    const { tableName } = this.filesRepository.metadata;

    const files = await this.filesRepository.query(
      `SELECT * FROM ${tableName} WHERE essence_id=$1`, [essenceId]
    );
    if (Object.keys(files).length === 0) {
      throw new NotFoundException();
    }
    return files;
  }

  // Delete file by id
  async deleteFileById(fileId: number): Promise<{ statusCode: number, message: string }> {

    const removedFile = await this.filesRepository.findOneBy({ id: fileId });

    const deleteResponse = await this.filesRepository.delete(fileId);
    if (!deleteResponse.affected) {
      throw new HttpException(
        'File with this id was not found',
        HttpStatus.NOT_FOUND
      );
    }

    const path = join(process.cwd(), removedFile.path);
    await rm(path);

    return {
      statusCode: HttpStatus.OK,
      message: 'File has been removed'
    };
  }

  //Rremove all UNUSED files & oldest one hour
  async removeUnusedAndOldFiles(): Promise<string> {
    const { tableName } = this.filesRepository.metadata;
    const [pathForDeleteFile] = await this.filesRepository.manager.query(
      `DELETE FROM ${tableName} 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 hour' 
      OR essence_id IS NULL
      RETURNING path`
    );

    for (const file of pathForDeleteFile) {
      const path = join(process.cwd(), file.path);
      await rm(path)
    }

    return `Files has been deleted`;
  }

  // Set UNUSED files (essence_id = NULL, essence =NULL)
  async setFilesUnused(id: number): Promise<void> {

    const { tableName } = this.filesRepository.metadata;
    const filesEssence = await this.filesRepository.manager.query(
      `SELECT id, essence_id FROM ${tableName} 
      WHERE essence_id=$1`, [id]
    );

    for (const file of filesEssence) {
      await this.filesRepository.update(
        file.id,
        { essence: null, essenceId: null }
      );
    }
  }
}