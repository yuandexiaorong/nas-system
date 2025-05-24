import { MirrorManager } from '../utils/mirrors';

describe('MirrorManager', () => {
  let mirrorManager: MirrorManager;

  beforeEach(() => {
    // 由于是单例模式，我们直接获取实例
    mirrorManager = MirrorManager.getInstance();
  });

  describe('getInstance', () => {
    it('应该返回相同的实例', () => {
      const instance1 = MirrorManager.getInstance();
      const instance2 = MirrorManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getMirrors', () => {
    it('不带类型参数时应该返回所有镜像', () => {
      const mirrors = mirrorManager.getMirrors();
      expect(mirrors.length).toBeGreaterThan(0);
      expect(mirrors.some(m => m.type === 'npm')).toBeTruthy();
      expect(mirrors.some(m => m.type === 'docker')).toBeTruthy();
    });

    it('带类型参数时应该只返回指定类型的镜像', () => {
      const npmMirrors = mirrorManager.getMirrors('npm');
      expect(npmMirrors.length).toBeGreaterThan(0);
      expect(npmMirrors.every(m => m.type === 'npm')).toBeTruthy();
    });

    it('查询不存在的类型应该返回空数组', () => {
      const nonExistentMirrors = mirrorManager.getMirrors('nonexistent');
      expect(nonExistentMirrors).toHaveLength(0);
    });
  });

  describe('镜像配置方法', () => {
    it('应该能够配置NPM镜像', async () => {
      const newUrl = 'https://registry.npmjs.org';
      await mirrorManager.configureNpmMirror(newUrl);
      const npmMirrors = mirrorManager.getMirrors('npm');
      const configuredMirror = npmMirrors.find(m => m.url === newUrl);
      expect(configuredMirror).toBeTruthy();
    });

    it('应该能够配置Docker镜像', async () => {
      const newUrl = 'https://registry.docker.io';
      await mirrorManager.configureDockerMirror(newUrl);
      const dockerMirrors = mirrorManager.getMirrors('docker');
      const configuredMirror = dockerMirrors.find(m => m.url === newUrl);
      expect(configuredMirror).toBeTruthy();
    });
  });

  describe('getFastestMirror', () => {
    it('应该返回指定类型的镜像', async () => {
      const fastestMirror = await mirrorManager.getFastestMirror('npm');
      expect(fastestMirror).toBeTruthy();
      expect(fastestMirror?.type).toBe('npm');
    });

    it('查询不存在的类型应该返回null', async () => {
      const fastestMirror = await mirrorManager.getFastestMirror('nonexistent');
      expect(fastestMirror).toBeNull();
    });
  });
}); 