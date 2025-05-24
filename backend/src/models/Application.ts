export interface Application {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  version: string;
  architecture: string[];  // 支持的架构
  requirements: {
    cpu: number;     // 最小CPU核心数
    memory: number;  // 最小内存要求(MB)
    storage: number; // 最小存储空间要求(MB)
  };
  ports: {
    container: number;
    host: number;
    protocol: 'tcp' | 'udp';
    description: string;
  }[];
  volumes: {
    container: string;
    description: string;
  }[];
  env: {
    name: string;
    default?: string;
    description: string;
    required: boolean;
  }[];
  tags: string[];
  dockerCompose: string;  // docker-compose配置
  installCount: number;   // 安装次数
  rating: number;        // 评分
  website: string;       // 官网
  repository: string;    // 代码仓库
}

// 预定义的应用列表
export const defaultApplications: Application[] = [
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    description: '开源的媒体服务器，支持电影、电视节目、音乐等多媒体内容的管理和串流',
    category: '媒体服务器',
    icon: '/icons/jellyfin.png',
    version: 'latest',
    architecture: ['amd64', 'arm64'],
    requirements: {
      cpu: 2,
      memory: 2048,
      storage: 20480
    },
    ports: [
      {
        container: 8096,
        host: 8096,
        protocol: 'tcp',
        description: 'Web界面'
      }
    ],
    volumes: [
      {
        container: '/config',
        description: '配置文件'
      },
      {
        container: '/media',
        description: '媒体文件'
      }
    ],
    env: [
      {
        name: 'PUID',
        default: '1000',
        description: '用户ID',
        required: true
      },
      {
        name: 'PGID',
        default: '1000',
        description: '组ID',
        required: true
      }
    ],
    tags: ['媒体', '视频', '音乐', '串流'],
    dockerCompose: `
version: '3'
services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    network_mode: host
    volumes:
      - ./config:/config
      - ./media:/media
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
    `,
    installCount: 10000,
    rating: 4.8,
    website: 'https://jellyfin.org',
    repository: 'https://github.com/jellyfin/jellyfin'
  },
  {
    id: 'firefly',
    name: '萤火虫',
    description: '开源的个人财务管理系统',
    category: '财务管理',
    icon: '/icons/firefly.png',
    version: 'latest',
    architecture: ['amd64', 'arm64'],
    requirements: {
      cpu: 1,
      memory: 1024,
      storage: 1024
    },
    ports: [
      {
        container: 8080,
        host: 8080,
        protocol: 'tcp',
        description: 'Web界面'
      }
    ],
    volumes: [
      {
        container: '/var/www/html/storage/upload',
        description: '上传文件'
      }
    ],
    env: [
      {
        name: 'DB_HOST',
        description: '数据库主机',
        required: true
      },
      {
        name: 'DB_PORT',
        default: '3306',
        description: '数据库端口',
        required: true
      }
    ],
    tags: ['财务', '记账', '预算'],
    dockerCompose: `
version: '3'
services:
  firefly:
    image: fireflyiii/core:latest
    container_name: firefly
    ports:
      - "8080:8080"
    volumes:
      - ./upload:/var/www/html/storage/upload
    environment:
      - DB_HOST=db
      - DB_PORT=3306
    restart: unless-stopped
    depends_on:
      - db
  db:
    image: mariadb:10
    container_name: firefly_db
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=firefly
    volumes:
      - ./database:/var/lib/mysql
    restart: unless-stopped
    `,
    installCount: 5000,
    rating: 4.6,
    website: 'https://www.firefly-iii.org',
    repository: 'https://github.com/firefly-iii/firefly-iii'
  },
  {
    id: 'nextcloud',
    name: 'Nextcloud',
    description: '开源的私有云存储平台，支持文件同步、日历、联系人等功能',
    category: '云存储',
    icon: '/icons/nextcloud.png',
    version: 'latest',
    architecture: ['amd64', 'arm64'],
    requirements: {
      cpu: 2,
      memory: 2048,
      storage: 5120
    },
    ports: [
      {
        container: 443,
        host: 443,
        protocol: 'tcp',
        description: 'HTTPS'
      }
    ],
    volumes: [
      {
        container: '/var/www/html',
        description: '应用数据'
      }
    ],
    env: [
      {
        name: 'MYSQL_HOST',
        description: '数据库主机',
        required: true
      },
      {
        name: 'REDIS_HOST',
        description: 'Redis主机',
        required: true
      }
    ],
    tags: ['云存储', '同步', '协作'],
    dockerCompose: `
version: '3'
services:
  nextcloud:
    image: nextcloud:latest
    container_name: nextcloud
    ports:
      - "443:443"
    volumes:
      - ./data:/var/www/html
    environment:
      - MYSQL_HOST=db
      - REDIS_HOST=redis
    restart: unless-stopped
    depends_on:
      - db
      - redis
  db:
    image: mariadb:10
    container_name: nextcloud_db
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=nextcloud
    volumes:
      - ./database:/var/lib/mysql
    restart: unless-stopped
  redis:
    image: redis:alpine
    container_name: nextcloud_redis
    restart: unless-stopped
    `,
    installCount: 8000,
    rating: 4.7,
    website: 'https://nextcloud.com',
    repository: 'https://github.com/nextcloud/server'
  }
]; 