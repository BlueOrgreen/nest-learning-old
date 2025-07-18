import { Body, Controller, Post } from '@nestjs/common';

import { BaseController } from '@/modules/core/crud';

// import { Crud } from '@/modules/core/decorators';

import { ClassToPlain } from '@/modules/core/types';
import { ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { PostEntity } from '../entities/post.entity';
import { PostService } from '../services';
import { PermissionChecker, RbacCurdOption } from '@/modules/rbac/type';
import { PermissionAction } from '@/modules/rbac/constants';
import { checkOwner } from '@/modules/rbac/helpers';
import { PostRepository } from '../repositories';
import { In } from 'typeorm';
import { RbacCrud } from '@/modules/rbac/decorators/rbac-crud.decorator';

const createChecker: PermissionChecker = async (ab) => {
    console.log('createChecker====>', ab, PostEntity.name);

    return ab.can(PermissionAction.CREATE, PostEntity.name);
};

const ownerChecker: PermissionChecker = async (ab, ref, request) =>
    checkOwner(
        ab,
        async (items) =>
            ref.get(PostRepository, { strict: false }).find({
                relations: ['author'],
                where: { id: In(items) },
            }),
        request,
    );

const option: RbacCurdOption = {
    rbac: [ownerChecker],
};

/**
 * 文章控制器
 *
 * @export
 * @class PostController
 */
@RbacCrud({
    id: 'post',
    enabled: [
        { name: 'list', option: { allowGuest: true } },
        { name: 'detail' },
        { name: 'store', option: { rbac: [createChecker] } },
        { name: 'update', option },
        { name: 'delete', option },
        'restore',
        { name: 'deleteMulti', option },
        'restoreMulti',
    ],
    dtos: {
        query: QueryPostDto,
        create: CreatePostDto,
        update: UpdatePostDto,
    },
})
@Controller('posts')
export class PostController extends BaseController<PostService> {
    constructor(protected postService: PostService) {
        super(postService);
    }

    @Post()
    async store(
        @Body() data: CreatePostDto,
        @ReqUser() author: ClassToPlain<UserEntity>,
    ): Promise<PostEntity> {
        return this.service.create({ data, author });
    }
}
