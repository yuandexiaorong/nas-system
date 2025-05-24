# NAS系统

一个功能强大的NAS系统，专为中国用户优化，提供完整的存储管理和应用部署解决方案。

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/yuandexiaorong/nas-system)
![GitHub repo size](https://img.shields.io/github/repo-size/yuandexiaorong/nas-system)
![GitHub language count](https://img.shields.io/github/languages/count/yuandexiaorong/nas-system)
![GitHub top language](https://img.shields.io/github/languages/top/yuandexiaorong/nas-system)

## 主要特性

- ZFS文件系统支持
  - 存储池管理
  - 数据集管理
  - 快照管理
  - 性能优化

- 应用市场
  - Jellyfin
  - 萤火虫
  - Nextcloud
  - 更多应用支持中...

- 中国本地化优化
  - 软件源镜像加速
  - Docker镜像加速
  - GitHub访问加速
  - NPM/PIP等包管理器加速

## 系统要求

- 操作系统：Linux (推荐Ubuntu 20.04+)
- 内存：至少4GB RAM
- 存储：系统盘20GB以上
- CPU：x86_64或ARM架构

## 快速开始

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/nas-system.git
cd nas-system
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 构建生产版本：
```bash
npm run build
```

## 配置说明

### 镜像源配置

系统提供了多个国内镜像源选择：

- Docker：阿里云、腾讯云、网易、中科大
- NPM：淘宝、华为云
- PIP：阿里云、清华、豆瓣
- APT：阿里云、清华、中科大
- GitHub：清华、中科大
- Composer：阿里云、腾讯云

可以通过系统设置页面一键配置这些镜像源。

## 开发指南

### 目录结构

```
.
├── backend/          # 后端代码
│   ├── src/
│   └── tests/
├── frontend/         # 前端代码
│   ├── src/
│   └── public/
└── docs/            # 文档
```

### 技术栈

- 后端：Node.js + TypeScript + Express
- 前端：React + TypeScript + Ant Design
- 数据库：PostgreSQL
- 缓存：Redis
- 容器化：Docker

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件 