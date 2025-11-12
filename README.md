# ADPrinting 全栈项目说明

一体化的广告喷绘行业管理与商城系统：含商家后台、顾客商城、计价下单、会员订阅、多租户、材料库存、考勤、拼版与矢量化等模块。

## 功能概览

- 多租户与会员订阅
  - 商家 Merchant 独立数据域，员工成员管理
  - 会员订阅：年费 60,000；支持试用；到期限制写操作与顾客端下单
- 商家后台（ADPrinting）
  - 品类管理：分类/属性/选项与加价
  - 商品管理：商品、配置与选项
  - 材料库存：分类、规格、库存、预警
  - 员工考勤：签到/签退、近 15 日记录
  - 拼版与矢量化：多图上传、尺寸提取、拼版预览与导出
- 顾客商城（独立入口）
  - 商家隔离：`/s/:merchant` 专属域
  - 商品列表、详情、上传文件、动态选项、尺寸计价、购物车与下单
  - 订单列表与详情

## 技术栈与目录结构

- 前端：Vue3 + Vite + Pinia + vue-router
- 后端：Django + DRF
- 目录
  - `frontend-vue/` 前端工程
  - `backend/` Django 工程与各应用

## 快速启动

1. 启动后端
   - `cd backend`
   - `python manage.py migrate`
   - `python manage.py runserver 0.0.0.0:8000`

2. 启动前端
   - `cd frontend-vue`
   - `npm i`
   - `npm run dev`

前端默认地址 `http://localhost:5173/`，后端 API 基址 `http://localhost:8000/api`。

## 关键入口

- 商家后台：`http://localhost:5173/`
- 顾客商城：`http://localhost:5173/s/:merchant`
- 会员订阅：`http://localhost:5173/membership`
- 商品管理：`http://localhost:5173/products`
- 品类管理：`http://localhost:5173/catalog`
- 材料库存：`http://localhost:5173/materials`
- 拼版与矢量化：`http://localhost:5173/nesting`

## 多租户与订阅

- 后端模型：Merchant、MerchantMembership、MerchantSubscriptionPlan、MerchantSubscription
- 关联规则
  - 商家员工仅访问本商家数据
  - 顾客首次下单自动绑定商家，跨商家访问将被拒绝
- 订阅校验：过期时禁用顾客端下单/报价与后台写操作
- 接口
  - `GET /api/auth/merchant/me`
  - `POST /api/auth/merchant/bootstrap` 一键创建商户
  - `POST /api/auth/merchant/subscribe` period=yearly|trial

## 商家后台能力

- 品类管理
  - `GET/POST /api/catalog/categories/`
  - `GET/POST /api/catalog/attributes/`
  - `GET/POST /api/catalog/options/`
- 商品管理
  - `GET/POST /api/merchant/products`
  - `GET/POST /api/merchant/product-configs`
  - `GET/POST /api/merchant/config-options`
- 材料库存
  - `GET /api/materials`
- 员工考勤
  - `GET /api/auth/attendance/`
  - `POST /api/auth/attendance/checkin`
  - `POST /api/auth/attendance/checkout`
- 拼版与矢量化
  - `POST /api/nesting/vectorize` 多图上传，返回每图尺寸、dataUrl、独立 SVG
  - `POST /api/nesting/pack` 传入 `sheet{width,height}`、`gap`、`margin`、`items[{id,w,h,qty}]` 返回落位与利用率

## 顾客商城能力

- 路由：`/s/:merchant` 商城首页，`/s/:merchant/p/:id` 详情，`/s/:merchant/cart` 购物车
- 计价：`POST /api/pricing/quote` 基于商品基础价与选项加价按面积计价
- 下单：`POST /api/orders/` 服务端重算价格并校验订阅
- 上传：`POST /api/uploads` 限 25MB，白名单后缀

## 安全与校验

- 服务端重算价格，忽略前端传入金额
- 商家隔离与订阅校验覆盖：产品/报价/下单/目录写操作
- 上传大小与类型校验，分商户目录存储
- 订单权限：顾客仅见自己的订单；商家成员仅见本商家订单

## 常见问题

- 无数据或空白预览
  - 确认已在后台创建商户并开通订阅（会员订阅页）
  - 商品/品类需先在后台配置
  - 矢量化空白的图片请调低阈值或使用更高对比度图
- 登录错误或 8000 端口不可用
  - 检查后端是否在 `0.0.0.0:8000` 运行，首轮需 `migrate`

## 开发者提示

- 前端服务层在 `frontend-vue/src/services/api.ts`
- 重要页面
  - 商城：`src/views/shop/ShopHome.vue` `ShopProduct.vue` `ShopCart.vue`
  - 后台：`src/views/Products.vue` `Catalog.vue` `Materials.vue` `Employees.vue`
  - 拼版：`src/views/Nesting.vue`
- 关键后端文件
  - 订阅与商户：`backend/apps/users/models.py` `views_merchants.py`
  - 商品与品类：`backend/apps/products/models.py` `models_catalog.py`
  - 订单：`backend/apps/orders/serializers.py` `views.py`
  - 矢量化与拼版：`backend/apps/production/views_nesting.py`

## 路线图

- 矢量化：接入 potrace/OpenCV，支持内外轮廓、多路径与 DXF 导出
- 拼版：MaxRects/Guillotine、卷材模式、自动分页、标尺与尺寸标注
- 顾客端：地址簿、余额支付、发票与运费

