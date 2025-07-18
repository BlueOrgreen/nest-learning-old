import { Controller } from '@nestjs/common';

import { PermissionAction } from '@/modules/rbac/constants';
// import { simpleCurdOption } from '@/modules/rbac/helpers';

import { MediaEntity } from '../entities';
import { MediaService } from '../services';
import { RbacCrud } from '@/modules/rbac/decorators/rbac-crud.decorator';
import { PermissionChecker } from '@/modules/rbac/type';
import { BaseController } from '@/modules/core/crud';
import { QueryMediaDto } from '../dtos/manage.dto';
// import { Guest } from '@/modules/user/decorators';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, MediaEntity.name),
];

@RbacCrud({
    id: 'media',
    enabled: [
        // {
        //     name: 'list',
        //     option: simpleCurdOption(permissions, '文件查询,以分页模式展示'),
        // },
        { name: 'list', option: { allowGuest: false } },
        { name: 'detail', option: { rbac: permissions } },
        { name: 'delete', option: { rbac: permissions } },

        // { name: 'detail', option: simpleCurdOption(permissions, '文件详情') },
        // { name: 'delete', option: simpleCurdOption(permissions, '删除文件,支持批量删除') },
    ],
    dtos: {
        query: QueryMediaDto,
    },
})
@Controller('manage/medias')
export class MediaManageController extends BaseController<MediaService> {
    constructor(protected service: MediaService) {
        super(service);
    }

    /**
     * @description 显示评论树
     */
    // @Guest()
    // @Get()
    // @SerializeOptions({})
    // async list(
    //     @Query()
    //     query: any,
    // ) {
    //     console.log('media controller get list');

    //     return this.service.paginate(query);
    // }
}
