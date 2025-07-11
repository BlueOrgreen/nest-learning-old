# 3R教室第一节-Typescript+Eslint+Prettier搭建工程构建与深入装饰器详解
> 文档请自行查看飞书文档

[飞书文档](https://pincman-classroom.feishu.cn/wiki/wikcnHURsQsZ3yxtJutQn29Nayg)
[代码地址nestjs-2022](https://git.3rcd.com/classroom/nestjs-2022)

- basic-crud 基本crud框架
- decorator-crud Crud装饰器
- user 集成 OAuth2 用户鉴权、路由守卫功能的分支、消息队列 - 基本可参考这个分支进行扩展
- main 所有代码

## 进度表

2024/07/24 - 第六节

2024/10/20 - 第七节

2024/11/11 - 第八节

## 查询操作


- Where 使用
```TS
// Where - 使用 Resposity
const conditional: Record<string, any> = { code, value, action };
const codeItem = await this.captchaRepository.findOne({
    where: conditional,
});
```

```ts
// where
this.userRepository.findOneOrFail({ where: { id: user.id } });
```

```ts
// where - 使用 构造查询器
const query = this.userRepository.buildBaseQuery();
const wheres = Object.fromEntries(
    Object.entries(condition).map(([key, value]) => [`user.${key}`, value]),
);
const user = query.where(wheres).getOne();
```

```ts
// where 
const condition: { [key: string]: any } = {};
let query = this.userRepository.buildBaseQuery();
if (actived !== undefined && typeof actived === 'boolean') {
    condition['user.actived'] = actived;
}
if (orderBy) {
    query = query.orderBy(`user.${orderBy}`, 'ASC');
}
if (Object.keys(condition).length > 0) {
    query = query.where(condition);
}
return query;
```

```ts
async checkAccessToken(value: string) {
        return AccessTokenEntity.findOne({
            where: { value },
            relations: ['user', 'refreshToken'],
        });
    }
```

创建

```ts
 /**
  * 创建用户
  * @param data
  */
async create(data: CreateUserDto) {
    const user = await this.userRepository.save(data);
    return this.detail(user.id);
}
```

更新
```ts
/**
  * 更新用户
  * @param data
  */
async update({ id, ...data }: UpdateUserDto) {
    await this.userRepository.update(id, data);
    return this.detail(id);
}
```

## NestJS 的核心概念

### 依赖注入（DI，Dependency Injection）

`依赖注入` 简单的解释就是把一个对象依赖的服务交给它,而不是自己本身来创建

```ts
// 没有DI
class UserService {
  private db = new Database();  // 这里耦合死了
}

// 有DI
class UserService {
  constructor(private db: Database) {} // 由外部传入
}
```

### 在 NestJS 里的依赖注入

`NestJS` 用 `装饰器` 和 `模块`来管理 `DI`

```ts
// Nest 会自动找到并创建 UserRepository，并注入进来, 不需要 new UserRepository()
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
}
```

### NestJS 的容器（IoC Container）

> `容器（Container`）就是用来 `存储` 和 `管理` 所有可注入依赖的地方

当在类上用 `@Injectable()`: Nest 会注册到它的容器里

当在构造函数里声明参数: Nest 会从容器里找出相应的依赖，自动帮你 `注入`

### 容器分层：应用容器、模块容器

Nest 设计是`模块化`的:

- 一个 Nest 应用由很多模块组成
- 每个模块可以有自己的“私有”提供者
- 也可以暴露“公共”提供者给别的模块用

为此，NestJS 的 DI 容器分了两层：

1. 应用容器（Global Container）: 存放全局可用的依赖、所有模块都可以访问
2. 模块容器（Module Container）: 每个模块有自己私有的容器, 存储这个模块自己的 providers, 只在这个模块和导入它的模块可用




## Nestjs 应用  

### 如何操作数据库

#### Service 操作 Repository ， 然后通过 Repository 进行数据库交互

Content 模块中诸如 Post 文章模块， controller命中后 通过 对service进行操作 而 service 层则是通过由基础 BaseRepository 构造的查询器与数据库进行交互

#### 直接在 Service 中 操作Entity 来进行数据库交互

```ts
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(CaptchaEntity)
        private captchaRepository: Repository<CaptchaEntity>,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) {}

    /**
     * 通过验证码注册
     * @param data
     */
    async registerByCaptcha(data: CaptchaValidate<{ password?: string; type: CaptchaType }>) {
        const { value, password, type } = data;
        const expired = await this.checkCodeExpired(data, CaptchaActionType.REGISTER);
        if (expired) {
            throw new BadRequestException('captcha has been expired,cannot used to register');
        }
        const user = new UserEntity();
        if (password) user.password = password;
        user.actived = true;
        if (type === CaptchaType.EMAIL) {
            user.email = value;
        } else if (type === CaptchaType.SMS) {
            user.phone = value;
        }
        // 储存用户
        await user.save();
        return this.userService.findOneByCondition({ id: user.id });
    }
}
```

### Service 使用

#### 在一个Service使用另一个Service

```ts
// module  需要在module将提供者注入
@Module({
    providers: [
        UserService,
        AuthService
    ]
})
class UserModule{}

// 通过 Injectable 成为提供者
@Injectable()
class UserService {}

// 在 AuthService中使用 UserService
@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService
    ){}
}
```

### @Global() 作用及解析

> `@Global()` 装饰器把 这个模块里的所有提供者 变成 全局可用，让其他模块不用再手动 `imports` 就能使用

NestJS 普通模块导入流程: 通常情况下，NestJS 的模块是封闭的, 模块提供的服务只能在自己或手动导入它的模块中使用。

```ts
@Module({
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}

// 在 AppModule imports MediaModule 才能使用里面的服务
@Module({
  imports: [MediaModule],
})
export class AppModule {}
```


`@Global()` 的作用: 所有其他模块里 不需要 在 imports 中写 MediaModule，就能直接用 MediaService

```ts
@Global()
@Module({
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
```

#### 典型使用场景

- 配置模块（ConfigModule）
- 数据库连接模块（DatabaseModule）
- 日志模块（LoggerModule）
- 缓存模块（CacheModule）
- MediaModule，存储服务、文件上传全局可用


#### 原理解析

Nest 的依赖注入容器分层：1.应用容器  2.模块容器

当加了 `@Global()`: 1.这个模块里的提供者，会被注册到全局容器  2.所有模块的依赖查找都会先看模块容器找不到会去应用容器(全局容器)查找  3.所以不用手动在其他模块里写 imports 也能找到它的提供者


#### 关键限制

全局模块仍然需要在 `根模块` 里注册一次


## NestJS应用生命周期

其生命周期由一系列内置钩子函数和模块管理机制组成，用于管理应用的启动、运行和销毁过程，以下是其主要的生命周期阶段

**1.模块初始化**
- 根模块 `AppModule` 作为入口点初始化
- 所有模块通过 `@Module` 装饰器配置依赖关系并加载

**2.依赖注入**
- 通过构造函数注入或 `@Injectable` 提供服务和依赖

**3.生命周期钩子**
- `OnModuleInit`: 模块初始化触发
- `OnApplicationBootstrap`: 应用完成启动时触发
- `OnModuleDestroy` / `OnApplicationShutdown`: 模块或应用关闭时触发清理逻辑

**4.请求处理**
- 控制器和服务协作处理请求，使用拦截器、管道、过滤器等实现逻辑

**5.应用销毁**
- 调用 `app.close()` 时触发清理资源和连接


## 事务 来填充数据

本仓库 使用事务来进行角色权限数据录入 的代码

```tsx
@Injectable()
export class RbacResolver<A extends AbilityTuple = AbilityTuple, C extends MongoQuery = MongoQuery>
    implements OnApplicationBootstrap
{

  async onApplicationBootstrap() {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.syncRoles(queryRunner.manager);
            await this.syncPermissions(queryRunner.manager);
            await queryRunner.commitTransaction();
        } catch (err) {
            console.log(err);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
```


### ✅ 什么时候需要手动事务（QueryRunner）


| 场景                               | 是否需要事务    |
| -------------------------------- | --------- |
| 插入/更新多个表的数据，要求 **要么全部成功，要么全部失败** | ✅ 是，需要事务  |
| 对数据库的多个操作之间有强依赖性                 | ✅ 是，需要事务  |
| 实现某些业务逻辑时要确保中间状态不被外界读取（如转账）      | ✅ 是，需要事务  |
| 单表插入/更新，无依赖                      | ❌ 否，不需要事务 |
| 启动时同步权限/角色，且希望“同步完整失败就全退回”       | ✅ 是，推荐事务  |


### ✅ 什么时候不需要手动事务

如果你只是：

简单执行 `repository.save()`

或 `manager.save()` / `update()` / `remove()` 等单个操作

并且不需要多个数据库操作保持一致性

👉 那么 `TypeORM` 会自动提交这些操作，不需要你手动开启事务

```tsx
await this.roleRepository.save({ name: 'admin', ... });
```


### 🚀 实战建议

- 平时后台管理系统的数据录入、更新接口，一般不需要事务。

- 初始化数据（像你现在的权限系统角色）、批量导入、复杂的业务处理等场景，建议用事务，避免中间状态污染数据。

