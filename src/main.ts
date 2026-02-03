import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import { join } from 'path';
import * as bodyparser from 'body-parser';
import * as express from 'express';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { LoggerService } from './logger.services';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    rawBody: true,
  });
  app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
  mkdirSync(join('public', 'newsLetter'), { recursive: true });
  mkdirSync(join('public', 'service'), { recursive: true });
  mkdirSync(join('public', 'deity'), { recursive: true });
  mkdirSync(join('public', 'assets'), { recursive: true });
  mkdirSync(join('public', 'serviceType'), { recursive: true });
  mkdirSync(join('public', 'properties'), { recursive: true });
  app.use(bodyparser.json({ limit: '500kb' }));
  app.use(express.static('public'));
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        if (validationErrors.length) {
          return new BadRequestException({
            statusCode: 400,
            message: 'Invalid request',
            result: null,
            error: validationErrors.map((error) => ({
              field: error.property,
              response: error.children.length
                ? Object.values(error.children[0].constraints)
                : Object.values(error.constraints).join(', '),
            }))[0],
          });
        }
      },
    }),
  );

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Temple')
    .setDescription('Devotional Mode')
    .setVersion('1.0')
    .addTag('temple')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  const loggerService = app.get(LoggerService);
  const logger = new LoggerMiddleware(loggerService);
  app.use((req, res, next) => logger.use(req, res, next));
  await app.listen(3000);
}
bootstrap();
