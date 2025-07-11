import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';

import { FastifyReply } from 'fastify';

import { Guest } from '@/modules/user/decorators';

import { MediaService } from '../services';
import { NotEmptyPipe } from '@/modules/core/pipes/not-empty.pipe';

@Controller('medias')
export class MediaController {
    constructor(protected service: MediaService) {}

    @Get('images/:id.:ext')
    @Guest()
    async image(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Param('ext', new NotEmptyPipe({ maxLength: 10 })) ext: string,
        @Res({ passthrough: true }) res: FastifyReply,
    ) {
        const result = await this.service.loadImage(id, res, `.${ext}`);
        return res.send(result);
    }
}
