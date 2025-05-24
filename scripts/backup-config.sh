#!/bin/bash

# 设置备份目录
BACKUP_DIR="/backup/config"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/config_backup_$DATE.tar.gz"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份配置文件
echo "开始备份配置文件..."
tar -czf "$BACKUP_FILE" \
    /etc/nginx/conf.d \
    /etc/nginx/ssl \
    /etc/prometheus \
    .env \
    docker-compose.yml

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "配置文件备份成功: $BACKUP_FILE"
else
    echo "配置文件备份失败"
    exit 1
fi

# 删除旧备份
find "$BACKUP_DIR" -type f -name "config_backup_*.tar.gz" -mtime +30 -delete

# 列出当前备份
echo "当前备份列表:"
ls -lh "$BACKUP_DIR" 