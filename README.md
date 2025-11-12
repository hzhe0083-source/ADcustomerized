# ADPrinting - 数码广告打印工厂管理系统

这是一个现代化的数码广告打印工厂管理系统，采用前后端分离架构，提供从客户下单到生产交付的全流程数字化解决方案。

## 🎯 项目概述

系统包含以下核心模块：
- **在线下单系统**：产品展示、价格计算、购物车、订单提交
- **ERP管理系统**：订单管理、客户管理、物料库存、BOM管理  
- **MES生产系统**：工单管理、生产排程、工序流转、实时看板
- **设备管理**：设备监控、数据采集、故障报警、维护管理
- **专业模块**：色彩管理、拼版集成、后道工艺处理

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React@18 + TypeScript
- **UI库**: Ant Design@5 + 自定义主题
- **样式**: TailwindCSS@3 + CSS Modules
- **状态管理**: Redux Toolkit + RTK Query
- **构建工具**: Vite@5

### 后端技术栈
- **框架**: Django@4.2 + Django REST Framework
- **数据库**: PostgreSQL@15
- **缓存**: Redis@7
- **消息队列**: Redis + Django Channels
- **任务队列**: Celery + Redis

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- Python >= 3.9
- PostgreSQL >= 15
- Redis >= 7

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ADcustomerized
```

2. **启动后端服务**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. **启动前端服务**
```bash
cd frontend
npm install
npm run dev
```

4. **使用Docker启动（推荐）**
```bash
docker-compose up -d
```

### 访问地址
- 前端应用: http://localhost:3000
- 后端API: http://localhost:8000/api
- API文档: http://localhost:8000/api/docs

## 📁 项目结构

```
ADcustomerized/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── store/           # Redux状态管理
│   │   ├── services/        # API服务
│   │   └── utils/           # 工具函数
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Django后端应用
│   ├── apps/                # Django应用
│   │   ├── users/           # 用户管理
│   │   ├── products/        # 产品管理
│   │   ├── orders/          # 订单管理
│   │   ├── inventory/       # 库存管理
│   │   ├── production/      # 生产管理
│   │   └── equipment/       # 设备管理
│   ├── requirements.txt
│   └── manage.py
├── nginx/                   # Nginx配置
├── docker-compose.yml       # Docker配置
└── README.md
```

## 👥 用户角色

| 角色 | 权限说明 |
|------|----------|
| 外部客户 | 浏览产品、在线下单、查看订单状态 |
| 内部员工 | 订单管理、客户管理、库存管理、生产调度 |
| 工厂操作员 | 工单操作、工序流转、设备状态更新 |
| 系统管理员 | 系统配置、用户管理、权限分配、数据备份 |

## 🔧 核心功能

### 客户端功能
- 🛍️ 产品浏览和搜索
- 🛒 购物车管理
- 📋 订单提交和跟踪
- 👤 个人中心管理

### 管理后台功能
- 📊 数据仪表板
- 📦 订单全生命周期管理
- 👥 客户关系管理
- 📈 库存和物料管理
- 🏭 生产计划和调度
- ⚙️ 设备监控和维护

## 🎨 设计规范

- **设计风格**: 简约现代，参考Apple设计理念
- **主色调**: 纯白背景 + 深灰色文字 + 蓝色强调色
- **字体**: 苹方字体为主，层次分明
- **布局**: 卡片式布局，大量留白
- **响应式**: 桌面端优先，支持平板和手机

## 🔒 安全特性

- JWT身份认证
- 角色权限控制
- 数据加密传输
- SQL注入防护
- XSS攻击防护

## 📈 性能优化

- 前端代码分割和懒加载
- 后端数据库查询优化
- Redis缓存策略
- 静态资源CDN加速
- 图片压缩和优化

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

此项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 📧 邮箱: contact@adprinting.com
- 📱 电话: 400-123-4567
- 📍 地址: 上海市浦东新区张江高科技园区

---

⭐ 如果这个项目对您有帮助，请给个Star支持一下！