import { ApiOperation } from '@nestjs/swagger';

import { CrudMethodOption } from '../core/types';

import { ManualPermission } from './decorators/permission.decorator';
import { PermissionChecker } from './type';

/**
 * 快速生成常用CRUD装饰器选项
 * @param permissions
 * @param apiSummary
 */
export const simpleCurdOption = (
    permissions?: PermissionChecker[],
    apiSummary?: string,
): CrudMethodOption => ({
    hook: (target, method) => {
        if (permissions) ManualPermission(target, method, permissions);
        if (apiSummary) {
            ApiOperation({ summary: apiSummary })(
                target,
                method,
                Object.getOwnPropertyDescriptor(target.prototype, method),
            );
        }
    },
});
