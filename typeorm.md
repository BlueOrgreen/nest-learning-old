# Typeorm

## 数据库操作


### 查询

**this.repository.findOne**

```tsx
class MessageService {
  async deleteSended(id: string, userId: string) {
        const message = await this.repository.findOne({
            relations: ['sender', 'recevies', 'recevies.recevier'],
            where: {
                id,
                sender: { id: userId },
            },
        });
        if (isNil(message)) {
            throw new EntityNotFoundError(MessageEntity, `message ${id} not exists!`);
        }
        await this.repository.remove(message);
        return message;
    }
}
```

### 删除

**this.recevieRepository.remove(recevier)**

```tsx
class MessageService {
 protected async updateRecevies(data: string[], action: RecevierActionType, userId: string) {
        const receviers = await this.recevieRepository.find({
            relations: { message: true, recevier: true },
            where: {
                message: { id: In(data) },
                recevier: { id: userId },
            },
        });
        for (const recevier of receviers) {
            if (action === RecevierActionType.READED && !recevier.readed) {
                recevier.readed = true;
                await recevier.save({ reload: true });
            }
            if (action === RecevierActionType.DELETE) {
                this.recevieRepository.remove(recevier);
            }
        }
        return receviers;
    }
}
```


### 保存

const message = new MessageEntity();
await message.save({ reload: true });

```tsx
class MessageWorker {
    protected async saveMessage(job: Job<SaveMessageQueueJob>) {
        const { title, body, type, sender, receviers } = job.data;
        try {
            const message = new MessageEntity();
            message.title = title;
            message.body = body;
            if (!isNil(type)) message.type = type;
            message.sender = await this.userRepository.findOneByOrFail({ id: sender });
            await message.save({ reload: true });
            await this.recevieRepository.save(
                await Promise.all(
                    receviers.map(async (r) => {
                        const recevie = new MessagerecevieEntity();
                        recevie.message = message;
                        recevie.recevier = await this.userRepository.findOneByOrFail({ id: r });
                        recevie.save({ reload: true });
                        return recevie;
                    }),
                ),
            );
        } catch (err) {
            console.log(chalk.red(err));
            throw new Error(err as string);
        }
    }
}
```


### 更新

操作`repository`来更新数据库
await this.repository.update(data.id, omit(data, ['id', 'permissions']));

```tsx
export class RoleService extends BaseService<RoleEntity, RoleRepository> {
 async update(data: UpdateRoleDto) {
        // 单独更新 关联对象
        const role = await this.detail(data.id);
        if (data.permissions) {
            await this.repository
                .createQueryBuilder('role')
                .relation(RoleEntity, 'permissions')
                .of(role)
                .addAndRemove(data.permissions, role.permissions ?? []);
        }
        // 更新 目标对象
        await this.repository.update(data.id, omit(data, ['id', 'permissions']));
        return this.detail(data.id);
    }
}
```


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