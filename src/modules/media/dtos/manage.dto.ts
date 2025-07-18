import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

import { tNumber } from '@/helpers';
import { PaginateDto } from '@/helpers/types';
import { DtoValidation } from '@/modules/core/decorators';

/**
 * 分页文章列表查询验证
 */
@Injectable()
@DtoValidation({ type: 'query' })
export class QueryMediaDto implements PaginateDto {
    page = 1;

    @Transform(({ value }) => tNumber(value))
    @Min(1, { message: '每页显示数据必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 10;
}
