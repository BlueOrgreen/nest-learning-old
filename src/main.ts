import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';

import { useContainer } from 'class-validator';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
        logger: ['error', 'warn'],
    });
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useWebSocketAdapter(new WsAdapter(app));
    app.setGlobalPrefix('api');
    // app.enableCors();
    app.register(require('@fastify/multipart'), {
        attachFieldsToBody: true,
    });
    await app.listen(3100, '0.0.0.0');
}
bootstrap();
