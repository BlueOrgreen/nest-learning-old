# 3R教室第一节-Typescript+Eslint+Prettier搭建工程构建与深入装饰器详解
> 文档请自行查看飞书文档

[飞书文档](https://pincman-classroom.feishu.cn/wiki/wikcnHURsQsZ3yxtJutQn29Nayg)
[代码地址nestjs-2022](https://git.3rcd.com/classroom/nestjs-2022)

- basic-crud 基本crud框架
- decorator-crud Crud装饰器
- main 所有代码

## 进度表

2024/07/24 - 第六节

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