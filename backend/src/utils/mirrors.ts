import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import { logger } from './logger';

const execAsync = promisify(exec);

export interface MirrorConfig {
  name: string;
  url: string;
  description: string;
  type: 'docker' | 'npm' | 'pip' | 'apt' | 'github' | 'composer';
}

export class MirrorManager {
  private static instance: MirrorManager;

  // 预定义的镜像源
  private readonly mirrors: Record<string, MirrorConfig[]> = {
    docker: [
      {
        name: '阿里云',
        url: 'https://mirrors.aliyun.com/docker-ce',
        description: '阿里云Docker镜像加速器',
        type: 'docker'
      },
      {
        name: '腾讯云',
        url: 'https://mirror.ccs.tencentyun.com',
        description: '腾讯云Docker镜像加速器',
        type: 'docker'
      },
      {
        name: '网易',
        url: 'https://hub-mirror.c.163.com',
        description: '网易Docker镜像加速器',
        type: 'docker'
      },
      {
        name: '中科大',
        url: 'https://docker.mirrors.ustc.edu.cn',
        description: '中科大Docker镜像加速器',
        type: 'docker'
      }
    ],
    npm: [
      {
        name: '淘宝',
        url: 'https://registry.npmmirror.com',
        description: '淘宝NPM镜像',
        type: 'npm'
      },
      {
        name: '华为云',
        url: 'https://mirrors.huaweicloud.com/repository/npm/',
        description: '华为云NPM镜像',
        type: 'npm'
      }
    ],
    pip: [
      {
        name: '阿里云',
        url: 'https://mirrors.aliyun.com/pypi/simple',
        description: '阿里云PyPI镜像',
        type: 'pip'
      },
      {
        name: '清华',
        url: 'https://pypi.tuna.tsinghua.edu.cn/simple',
        description: '清华PyPI镜像',
        type: 'pip'
      },
      {
        name: '豆瓣',
        url: 'https://pypi.douban.com/simple',
        description: '豆瓣PyPI镜像',
        type: 'pip'
      }
    ],
    apt: [
      {
        name: '阿里云',
        url: 'https://mirrors.aliyun.com/ubuntu/',
        description: '阿里云Ubuntu镜像',
        type: 'apt'
      },
      {
        name: '清华',
        url: 'https://mirrors.tuna.tsinghua.edu.cn/ubuntu/',
        description: '清华Ubuntu镜像',
        type: 'apt'
      },
      {
        name: '中科大',
        url: 'https://mirrors.ustc.edu.cn/ubuntu/',
        description: '中科大Ubuntu镜像',
        type: 'apt'
      }
    ],
    github: [
      {
        name: '清华',
        url: 'https://mirrors.tuna.tsinghua.edu.cn/git/github.com/',
        description: '清华GitHub镜像',
        type: 'github'
      },
      {
        name: '中科大',
        url: 'https://mirrors.ustc.edu.cn/github-raw/',
        description: '中科大GitHub镜像',
        type: 'github'
      }
    ],
    composer: [
      {
        name: '阿里云',
        url: 'https://mirrors.aliyun.com/composer/',
        description: '阿里云Composer镜像',
        type: 'composer'
      },
      {
        name: '腾讯云',
        url: 'https://mirrors.cloud.tencent.com/composer/',
        description: '腾讯云Composer镜像',
        type: 'composer'
      }
    ]
  };

  private constructor() {}

  public static getInstance(): MirrorManager {
    if (!MirrorManager.instance) {
      MirrorManager.instance = new MirrorManager();
    }
    return MirrorManager.instance;
  }

  // 获取所有可用的镜像源
  public getMirrors(type?: string): MirrorConfig[] {
    if (type) {
      return this.mirrors[type] || [];
    }
    return Object.values(this.mirrors).flat();
  }

  // 配置Docker镜像加速
  public async configureDockerMirror(mirrorUrl: string): Promise<void> {
    try {
      const config = {
        "registry-mirrors": [mirrorUrl]
      };
      
      // 写入Docker配置文件
      await writeFile('/etc/docker/daemon.json', JSON.stringify(config, null, 2));
      
      // 重启Docker服务
      await execAsync('systemctl restart docker');
      
      logger.info(`Docker镜像加速器配置成功: ${mirrorUrl}`);
    } catch (error) {
      logger.error('配置Docker镜像加速器失败:', error);
      throw error;
    }
  }

  // 配置NPM镜像源
  public async configureNpmMirror(mirrorUrl: string): Promise<void> {
    try {
      await execAsync(`npm config set registry ${mirrorUrl}`);
      logger.info(`NPM镜像源配置成功: ${mirrorUrl}`);
    } catch (error) {
      logger.error('配置NPM镜像源失败:', error);
      throw error;
    }
  }

  // 配置PIP镜像源
  public async configurePipMirror(mirrorUrl: string): Promise<void> {
    try {
      const config = `[global]\nindex-url = ${mirrorUrl}\n`;
      await writeFile('~/.pip/pip.conf', config);
      logger.info(`PIP镜像源配置成功: ${mirrorUrl}`);
    } catch (error) {
      logger.error('配置PIP镜像源失败:', error);
      throw error;
    }
  }

  // 配置APT源
  public async configureAptMirror(mirrorUrl: string): Promise<void> {
    try {
      // 备份原始源文件
      await execAsync('cp /etc/apt/sources.list /etc/apt/sources.list.backup');
      
      // 生成新的源文件
      const sourcesList = `
deb ${mirrorUrl} $(lsb_release -cs) main restricted universe multiverse
deb ${mirrorUrl} $(lsb_release -cs)-updates main restricted universe multiverse
deb ${mirrorUrl} $(lsb_release -cs)-backports main restricted universe multiverse
deb ${mirrorUrl} $(lsb_release -cs)-security main restricted universe multiverse
      `.trim();

      await writeFile('/etc/apt/sources.list', sourcesList);
      await execAsync('apt update');
      
      logger.info(`APT源配置成功: ${mirrorUrl}`);
    } catch (error) {
      logger.error('配置APT源失败:', error);
      throw error;
    }
  }

  // 配置Composer镜像源
  public async configureComposerMirror(mirrorUrl: string): Promise<void> {
    try {
      await execAsync(`composer config -g repos.packagist composer ${mirrorUrl}`);
      logger.info(`Composer镜像源配置成功: ${mirrorUrl}`);
    } catch (error) {
      logger.error('配置Composer镜像源失败:', error);
      throw error;
    }
  }

  // 配置Git全局代理
  public async configureGitProxy(proxyUrl: string): Promise<void> {
    try {
      await execAsync(`git config --global http.proxy ${proxyUrl}`);
      await execAsync(`git config --global https.proxy ${proxyUrl}`);
      logger.info(`Git代理配置成功: ${proxyUrl}`);
    } catch (error) {
      logger.error('配置Git代理失败:', error);
      throw error;
    }
  }

  // 测试镜像源速度
  public async testMirrorSpeed(mirrorUrl: string): Promise<number> {
    try {
      const startTime = Date.now();
      await execAsync(`curl -s ${mirrorUrl}`);
      const endTime = Date.now();
      return endTime - startTime;
    } catch (error) {
      logger.error('测试镜像源速度失败:', error);
      throw error;
    }
  }

  // 获取最快的镜像源
  public async getFastestMirror(type: string): Promise<MirrorConfig> {
    const mirrors = this.getMirrors(type);
    const speeds = await Promise.all(
      mirrors.map(async mirror => ({
        mirror,
        speed: await this.testMirrorSpeed(mirror.url)
      }))
    );
    
    return speeds.sort((a, b) => a.speed - b.speed)[0].mirror;
  }
} 