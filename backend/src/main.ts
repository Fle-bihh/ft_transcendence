import {Logger, ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);



  app.enableCors({
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true
	});

  // app.use(cookieParser()); // setup cookies

  app.useGlobalPipes(new ValidationPipe());
  const port = 5001;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
bootstrap();
