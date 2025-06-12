# Nest

## 特性一：依赖注入

Nestjs 是一个依赖注入的框架，它使用依赖注入来管理服务、控制器等组件之间的依赖关系。
在构建应用时，不再需要手动实例化服务，而是通过 `@Injectable` 装饰器来声明依赖，然后通过模块的 `providers` 配置项来进行注册
框架会自动注入这些依赖

**简化模块的依赖关系，更容易维护、扩展**

- 依赖：在系统中 如果 UserModule 的 UserService 依赖 PostModule 的 PostService 
- 注入：不是通过 自身创建新的对象并操作新的对象的方式， 而是通过 **注入** 的方式，从外部传入，可以通过构造函数、属性、方法参数的方式

**Nestjs** 框架就是通过 构造函数的方式来注入

1. 构造函数注入

```tsx
class UserService {
  constructor(private readonly databaseService: DatabaseService) {}  // 构造函数注入
}
```

2. 属性注入

```tsx
class UserService {
  @Inject(DatabaseService)  // 属性注入
  private databaseService: DatabaseService;
}
```

3. 方法注入

```tsx
class UserService {
  setDatabaseService(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }
}
```

