import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';

import { useContainer } from 'class-validator';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
        logger: ['error', 'warn'],
    });
    app.setGlobalPrefix('api');
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.enableCors();
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.listen(3100, '0.0.0.0');
}
bootstrap();
