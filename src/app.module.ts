import { Module } from '@nestjs/common';

import { database, queue, sms, smtp, redis } from './config';
import { ContentModule } from './modules/content/content.module';
import { CoreModule } from './modules/core/core.module';
import { MediaModule } from './modules/media/media.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        CoreModule.forRoot({ database, queue, sms, smtp, redis }),
        ContentModule,
        UserModule,
        RbacModule,
        MediaModule,
    ],
})
export class AppModule {}
