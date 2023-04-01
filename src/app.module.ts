import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { TextBlockModule } from './text-block/text-block.module';
import { FilesModule } from './files/files.module';

@Module({

  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
      })
    }),
    DatabaseModule,
    AuthenticationModule,
    ProfileModule,
    TextBlockModule,
    FilesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
  ]
})
export class AppModule { }
