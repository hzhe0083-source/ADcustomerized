## 背景与目标
- 将现有“数码广告打印工厂管理系统”从静态页面/模型雏形推到可运行的最小闭环：注册/登录 → 浏览产品 → 下单 → 查看订单。
- 打通前后端接口，保证页面动作真实命中后端数据库，并可在本机或 Docker 环境一键启动。

## 现状速查
- 后端（Django/DRF）
  - 仅有 `settings.py` 与若干 `models.py`，缺少 `manage.py`、`urls.py`、`asgi.py`、`wsgi.py`、`views/serializers/routers`，无法运行 API。
  - DRF 默认配置已开启鉴权与分页，但未落地登录/注册接口，匿名请求会被 `IsAuthenticated` 拦截，需为鉴权端点单独放行（`backend/ad_printing/settings.py:112`）。
  - docker-compose 指定了后端 Dockerfile，但仓库缺失该文件。
- 前端（React+TS+Vite）
  - API 基址默认指向前端端口：`frontend/src/services/api.ts:3` 为 `http://localhost:3000/api`，应指向后端 8000 端口或使用 `.env` 注入。
  - 登录流程期望形如 `{ user, access }` 的响应，并写入本地与全局态：`LoginPage.tsx:18-22`；但 zustand 的 `login` 需要三个参数（含权限数组）：`frontend/src/store/authStore.ts:21,63`，当前只传了两个参数，存在类型与运行期不一致问题。
  - 同时存在 Redux 与 Zustand 两套状态管理，页面以 Zustand 为主，需统一策略避免重复与冲突。
- Docker
  - `docker-compose.yml` 引用 `backend/Dockerfile` 与 `frontend/Dockerfile`，仓库未包含，需补充。

## 实施里程碑
### 里程碑 1：搭建可运行的 Django 项目骨架
- 新增 `backend/manage.py`、`backend/ad_printing/{__init__.py, urls.py, asgi.py, wsgi.py}`。
- 在 `urls.py` 下挂载 `/api/` 路由前缀与 drf-spectacular 文档端点。
- 按 app 建立最小结构：`apps.{users,products,orders}` 的 `apps.py / admin.py / serializers.py / views.py / urls.py`。

### 里程碑 2：落地鉴权（推荐 JWT）
- 依赖：`djangorestframework-simplejwt`（如不引入，可退而用 DRF TokenAuth，但前端已按 JWT 形态约定）。
- 接口：
  - `POST /api/auth/register`：创建用户并返回 `{ user, access, refresh }`。
  - `POST /api/auth/login`：凭证换取 `{ user, access, refresh }`。
  - `GET /api/auth/me`：返回当前用户信息。
- 权限：为上述接口设置 `AllowAny`，其余默认 `IsAuthenticated`。

### 里程碑 3：产品模块 API
- `GET /api/products`：分页、分类筛选、搜索。
- `GET /api/products/{id}`：详情含配置项。
- 序列化：`Product / ProductConfig / ConfigOption`。

### 里程碑 4：订单模块 API
- `POST /api/orders`：创建订单，依据前端 `createOrder` 结构组装 `Order` 与 `OrderItem`。
- `GET /api/orders`：按用户与状态分页查询。
- `GET /api/orders/{id}`：订单详情含明细与状态流转。
- `PATCH /api/orders/{id}/status`：状态更新并写入 `OrderStatusHistory`。

### 里程碑 5：前端联调与修复
- API 基址修正：将 `frontend/src/services/api.ts:3` 改为 `VITE_API_BASE_URL || http://localhost:8000/api`，并提供 `.env.development` 示例。
- 登录响应对齐：`LoginPage.tsx` 使用 `{ user, access }`，调用 `useAuthStore().login(user, access, permissions || [])`；或下调 store 的签名以允许省略权限。
- 统一状态管理：保留 Zustand（当前实际使用），冻结 Redux 切片的引用（`frontend/src/store/slices/*` 未在页面使用则先不移除，仅停止注入）。
- 增加基础路由守卫与 401 处理：沿用现有拦截器（`frontend/src/services/api.ts:13-40`），补充受保护路由组件。

### 里程碑 6：Docker 化与一键启动
- 新增 `backend/Dockerfile`（基于 python3.11-slim，安装 reqs，运行 `gunicorn` 或 `runserver`）。
- 新增 `frontend/Dockerfile`（基于 node:18-alpine，`npm ci`，`vite` 开发或 `nginx` 托管构建产物）。
- 调整 `docker-compose.yml` 的后端启动命令以确保先 `migrate` 再起服务。

### 里程碑 7：验证与验收
- 本机与 Docker 双路径验证：
  - 注册/登录成功并在本地存储持久化 token。
  - 产品列表可展示、筛选与详情页打开正常。
  - 购物车下单成功，订单详情可查，状态可更新。
  - API 文档页面可用。

## 主要改动清单（文件级）
- 后端新增：
  - `backend/manage.py`
  - `backend/ad_printing/urls.py`
  - `backend/ad_printing/asgi.py`
  - `backend/ad_printing/wsgi.py`
  - `backend/apps/{users,products,orders}/{apps.py,admin.py,serializers.py,views.py,urls.py}`
  - 视需要：`apps/users/auth.py` 封装注册/登录逻辑
- 前端修改：
  - `frontend/src/services/api.ts` 基址与 401 行为微调
  - `frontend/src/pages/LoginPage.tsx` 与 `frontend/src/store/authStore.ts` 签名/调用一致化
  - 新增受保护路由组件与 `.env.*` 示例
- Docker 新增：
  - `backend/Dockerfile`
  - `frontend/Dockerfile`

## 接口约定（与前端现有调用对齐）
- 基址：`/api`
- 鉴权：
  - `POST /auth/login { username, password } -> { user, access, refresh }`（`frontend/src/services/api.ts:44`）
  - `POST /auth/register { name, username, email, phone, password } -> { user, access, refresh }`（`frontend/src/services/api.ts:47-55`）
- 产品：`GET /products`、`GET /products/{id}`（`frontend/src/services/api.ts:58-68`）
- 订单：`POST /orders`、`GET /orders`、`GET /orders/{id}`、`PATCH /orders/{id}/status`（`frontend/src/services/api.ts:71-113`）

## 风险与应对
- JWT 依赖新增：若不希望引入 `simplejwt`，可改为 DRF TokenAuth，同时调整前端登录响应与拦截器。
- 状态管理双轨：短期内保留 Redux 但停用，后续统一迁移/移除以简化体积与心智负担。
- DB/Redis 环境：本地快速验证可先切到 SQLite，Docker 路径使用 Compose 的 Postgres/Redis。

## 验收标准
- 所有列出的端点均可在 Swagger/Redoc 中可见并通过示例请求验证。
- 前端关键路径（登录/产品/下单/订单详情）在浏览器中可正常操作，无 401/404/500 异常。

请确认以上计划；确认后我将开始逐步实现，并在每个里程碑结束时提交可运行验证与变更摘要。