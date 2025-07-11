import { BaseRepository } from '@/modules/core/crud';
import { CustomRepository } from '@/modules/core/decorators';
import { MediaEntity } from '../entities';

@CustomRepository(MediaEntity)
export class MediaRepository extends BaseRepository<MediaEntity> {
    protected qbName = 'media';

    buildBaseQuery() {
        return this.createQueryBuilder(this.qbName).orderBy(`${this.qbName}.createdAt`, 'DESC');
    }
}
