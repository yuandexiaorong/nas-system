import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string;
  created: string;
  state: 'running' | 'stopped' | 'exited' | 'created';
}

export interface ImageInfo {
  id: string;
  repository: string;
  tag: string;
  created: string;
  size: string;
}

export interface VolumeInfo {
  name: string;
  driver: string;
  mountpoint: string;
}

export class DockerManager {
  private static instance: DockerManager;

  private constructor() {}

  public static getInstance(): DockerManager {
    if (!DockerManager.instance) {
      DockerManager.instance = new DockerManager();
    }
    return DockerManager.instance;
  }

  // 获取容器列表
  public async listContainers(all = false): Promise<ContainerInfo[]> {
    try {
      const cmd = `docker ps ${all ? '-a' : ''} --format "{{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}\\t{{.CreatedAt}}"`;
      const { stdout } = await execAsync(cmd);
      
      return stdout.trim().split('\n').map(line => {
        const [id, name, image, status, ports, created] = line.split('\t');
        return {
          id,
          name,
          image,
          status,
          ports,
          created,
          state: this.parseContainerState(status)
        };
      });
    } catch (error) {
      throw new Error(`获取容器列表失败: ${error.message}`);
    }
  }

  // 获取镜像列表
  public async listImages(): Promise<ImageInfo[]> {
    try {
      const { stdout } = await execAsync('docker images --format "{{.ID}}\\t{{.Repository}}\\t{{.Tag}}\\t{{.CreatedAt}}\\t{{.Size}}"');
      
      return stdout.trim().split('\n').map(line => {
        const [id, repository, tag, created, size] = line.split('\t');
        return { id, repository, tag, created, size };
      });
    } catch (error) {
      throw new Error(`获取镜像列表失败: ${error.message}`);
    }
  }

  // 启动容器
  public async startContainer(containerId: string): Promise<void> {
    try {
      await execAsync(`docker start ${containerId}`);
    } catch (error) {
      throw new Error(`启动容器失败: ${error.message}`);
    }
  }

  // 停止容器
  public async stopContainer(containerId: string): Promise<void> {
    try {
      await execAsync(`docker stop ${containerId}`);
    } catch (error) {
      throw new Error(`停止容器失败: ${error.message}`);
    }
  }

  // 删除容器
  public async removeContainer(containerId: string, force = false): Promise<void> {
    try {
      await execAsync(`docker rm ${force ? '-f' : ''} ${containerId}`);
    } catch (error) {
      throw new Error(`删除容器失败: ${error.message}`);
    }
  }

  // 拉取镜像
  public async pullImage(image: string): Promise<void> {
    try {
      await execAsync(`docker pull ${image}`);
    } catch (error) {
      throw new Error(`拉取镜像失败: ${error.message}`);
    }
  }

  // 删除镜像
  public async removeImage(imageId: string, force = false): Promise<void> {
    try {
      await execAsync(`docker rmi ${force ? '-f' : ''} ${imageId}`);
    } catch (error) {
      throw new Error(`删除镜像失败: ${error.message}`);
    }
  }

  // 创建容器
  public async createContainer(options: {
    image: string;
    name?: string;
    ports?: { [key: string]: string };
    volumes?: { [key: string]: string };
    env?: { [key: string]: string };
  }): Promise<string> {
    try {
      let cmd = 'docker create';

      // 添加容器名称
      if (options.name) {
        cmd += ` --name ${options.name}`;
      }

      // 添加端口映射
      if (options.ports) {
        Object.entries(options.ports).forEach(([host, container]) => {
          cmd += ` -p ${host}:${container}`;
        });
      }

      // 添加卷挂载
      if (options.volumes) {
        Object.entries(options.volumes).forEach(([host, container]) => {
          cmd += ` -v ${host}:${container}`;
        });
      }

      // 添加环境变量
      if (options.env) {
        Object.entries(options.env).forEach(([key, value]) => {
          cmd += ` -e ${key}=${value}`;
        });
      }

      cmd += ` ${options.image}`;

      const { stdout } = await execAsync(cmd);
      return stdout.trim(); // 返回容器ID
    } catch (error) {
      throw new Error(`创建容器失败: ${error.message}`);
    }
  }

  // 获取容器日志
  public async getContainerLogs(containerId: string, tail = 100): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker logs --tail ${tail} ${containerId}`);
      return stdout;
    } catch (error) {
      throw new Error(`获取容器日志失败: ${error.message}`);
    }
  }

  // 获取容器统计信息
  public async getContainerStats(containerId: string): Promise<any> {
    try {
      const { stdout } = await execAsync(`docker stats ${containerId} --no-stream --format "{{json .}}"`);
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`获取容器统计信息失败: ${error.message}`);
    }
  }

  // 获取Docker系统信息
  public async getSystemInfo(): Promise<any> {
    try {
      const { stdout } = await execAsync('docker info --format "{{json .}}"');
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`获取Docker系统信息失败: ${error.message}`);
    }
  }

  private parseContainerState(status: string): ContainerInfo['state'] {
    if (status.toLowerCase().includes('running')) return 'running';
    if (status.toLowerCase().includes('created')) return 'created';
    if (status.toLowerCase().includes('exited')) return 'exited';
    return 'stopped';
  }
} 