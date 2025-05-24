#!/bin/bash

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
    echo "请以root权限运行此脚本"
    exit 1
fi

# 安装必要的软件包
echo "安装必要的软件包..."
apt-get update
apt-get install -y \
    curl \
    wget \
    git \
    mdadm \
    zfsutils-linux \
    btrfs-progs \
    smartmontools \
    htop \
    iotop \
    nfs-kernel-server \
    samba \
    ufw \
    openvpn \
    easy-rsa \
    prometheus \
    prometheus-node-exporter \
    grafana \
    nginx \
    certbot \
    python3-certbot-nginx

# 安装Docker和Docker Compose
echo "安装Docker..."
curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose

# 创建必要的目录
echo "创建目录结构..."
mkdir -p /data
mkdir -p /backup
mkdir -p /etc/nginx/ssl
mkdir -p /etc/nginx/conf.d
mkdir -p /opt/nas/apps
mkdir -p /etc/openvpn/client-configs
mkdir -p /etc/prometheus
mkdir -p /var/lib/prometheus

# 配置OpenVPN
echo "配置OpenVPN..."
cp -r /usr/share/easy-rsa /etc/openvpn/
cd /etc/openvpn/easy-rsa
./easyrsa init-pki
./easyrsa build-ca nopass
./easyrsa build-server-full server nopass
./easyrsa gen-dh
openvpn --genkey --secret ta.key

# 配置防火墙
echo "配置防火墙..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 1194/udp  # OpenVPN
ufw allow 137/tcp   # Samba
ufw allow 138/tcp
ufw allow 139/tcp
ufw allow 445/tcp
ufw allow 2049/tcp  # NFS
ufw --force enable

# 配置系统参数
echo "配置系统参数..."
cat >> /etc/sysctl.conf << EOF
# 网络优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15

# 文件系统优化
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288

# 虚拟内存优化
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2

# OpenVPN优化
net.ipv4.ip_forward = 1
EOF

sysctl -p

# 配置系统限制
cat >> /etc/security/limits.conf << EOF
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF

# 设置时区
timedatectl set-timezone Asia/Shanghai

# 配置NTP服务
apt-get install -y chrony
systemctl enable chronyd
systemctl start chronyd

# 创建系统服务
echo "创建系统服务..."
cat > /etc/systemd/system/nas.service << EOF
[Unit]
Description=NAS System
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/nas
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
EOF

# 创建OpenVPN服务
cat > /etc/systemd/system/openvpn-server@.service << EOF
[Unit]
Description=OpenVPN Server %I
After=network.target

[Service]
Type=notify
PrivateTmp=true
ExecStart=/usr/sbin/openvpn --config /etc/openvpn/server/%i.conf

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nas.service
systemctl enable openvpn-server@server.service

# 设置定时任务
echo "配置定时任务..."
cat > /etc/cron.d/nas-backup << EOF
# 每天凌晨3点执行配置备份
0 3 * * * root /opt/nas/scripts/backup-config.sh >> /var/log/nas-backup.log 2>&1

# 每天凌晨4点执行数据备份
0 4 * * * root /opt/nas/scripts/backup-data.sh >> /var/log/nas-backup.log 2>&1

# 每周日凌晨2点执行Btrfs数据校验
0 2 * * 0 root btrfs scrub start /data >> /var/log/btrfs-scrub.log 2>&1
EOF

# 设置日志轮转
cat > /etc/logrotate.d/nas << EOF
/var/log/nas-*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
EOF

# 设置脚本权限
chmod +x scripts/*.sh

echo "初始化完成！"
echo "请编辑 .env 文件设置必要的环境变量，然后运行 docker-compose up -d 启动服务。" 