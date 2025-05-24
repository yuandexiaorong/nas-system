import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { asyncHandler } from '../middleware/asyncHandler';
import { logger } from '../utils/logger';
import { checkQuota } from '../middleware/quota';

const router = Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join('/data/uploads', req.params.path || '');
    fs.mkdir(uploadPath, { recursive: true })
      .then(() => cb(null, uploadPath))
      .catch(err => cb(err, ''));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// 获取目录内容
router.get('/list/*', asyncHandler(async (req, res) => {
  const dirPath = path.join('/data/uploads', req.params[0] || '');
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const contents = await Promise.all(items.map(async item => {
      const fullPath = path.join(dirPath, item.name);
      const stats = await fs.stat(fullPath);
      return {
        name: item.name,
        path: path.relative('/data/uploads', fullPath),
        isDirectory: item.isDirectory(),
        size: stats.size,
        modifiedAt: stats.mtime,
        createdAt: stats.birthtime
      };
    }));
    res.json(contents);
  } catch (error) {
    logger.error('Error listing directory:', error);
    res.status(500).json({ error: 'Failed to list directory contents' });
  }
}));

// 上传文件
router.post('/upload/*', checkQuota, upload.array('files'), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  res.json({ 
    message: 'Files uploaded successfully',
    files: req.files
  });
}));

// 创建目录
router.post('/mkdir/*', asyncHandler(async (req, res) => {
  const dirPath = path.join('/data/uploads', req.params[0] || '');
  try {
    await fs.mkdir(dirPath, { recursive: true });
    res.json({ message: 'Directory created successfully' });
  } catch (error) {
    logger.error('Error creating directory:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
}));

// 删除文件或目录
router.delete('/*', asyncHandler(async (req, res) => {
  const targetPath = path.join('/data/uploads', req.params[0] || '');
  try {
    const stats = await fs.stat(targetPath);
    if (stats.isDirectory()) {
      await fs.rm(targetPath, { recursive: true });
    } else {
      await fs.unlink(targetPath);
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    logger.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
}));

// 移动/重命名文件或目录
router.post('/move', asyncHandler(async (req, res) => {
  const { source, destination } = req.body;
  if (!source || !destination) {
    return res.status(400).json({ error: 'Source and destination paths are required' });
  }

  const sourcePath = path.join('/data/uploads', source);
  const destPath = path.join('/data/uploads', destination);

  try {
    await fs.rename(sourcePath, destPath);
    res.json({ message: 'Item moved successfully' });
  } catch (error) {
    logger.error('Error moving item:', error);
    res.status(500).json({ error: 'Failed to move item' });
  }
}));

// 搜索文件
router.get('/search', asyncHandler(async (req, res) => {
  const { query, type } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const searchResults = [];
    const searchDir = async (dir) => {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          await searchDir(fullPath);
        } else if (!type || path.extname(item.name).toLowerCase() === `.${type}`) {
          if (item.name.toLowerCase().includes(query.toString().toLowerCase())) {
            const stats = await fs.stat(fullPath);
            searchResults.push({
              name: item.name,
              path: path.relative('/data/uploads', fullPath),
              size: stats.size,
              modifiedAt: stats.mtime
            });
          }
        }
      }
    };

    await searchDir('/data/uploads');
    res.json(searchResults);
  } catch (error) {
    logger.error('Error searching files:', error);
    res.status(500).json({ error: 'Failed to search files' });
  }
}));

export const fileRouter = router; 