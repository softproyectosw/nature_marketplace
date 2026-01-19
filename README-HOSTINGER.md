# Nature Marketplace — Hostinger VPS Quick Commands

This is a short command reference for deploying this repo to an Ubuntu VPS using Docker Compose.

## 1) SSH from your Mac to the VPS

`~/.ssh/config`

```sshconfig
Host hostinger-vps
  HostName 82.180.160.167
  User root
  IdentityFile ~/.ssh/id_ed25519_hostinger
  IdentitiesOnly yes
```

Connect:

```bash
ssh hostinger-vps
```

## 2) VPS update + reboot (kernel upgrades)

```bash
sudo apt update && sudo apt -y upgrade
sudo reboot
```

After reboot:

```bash
ssh hostinger-vps
uname -r
```

## 3) GitHub access from the VPS (Deploy Key)

Generate key on the VPS:

```bash
ssh-keygen -t ed25519 -C "hostinger-nature-marketplace" -f ~/.ssh/id_ed25519_github_nature
```

Load it:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_github_nature
```

Copy public key (paste it in GitHub → Repo → Settings → Deploy keys):

```bash
cat ~/.ssh/id_ed25519_github_nature.pub
```

Test SSH to GitHub:

```bash
ssh -T git@github.com
```

## 4) Clone / update the repo on the VPS

```bash
sudo mkdir -p /opt/nature_marketplace
sudo chown -R $USER:$USER /opt/nature_marketplace
cd /opt/nature_marketplace

git clone git@github.com:YOUR_ORG_OR_USER/YOUR_REPO.git
cd YOUR_REPO
```

Update:

```bash
git pull
```

## 5) Environment variables (.env)

Create `.env` from template:

```bash
cp .env.production.example .env  # if it exists
# or
cp .env.example .env

nano .env
```

Generate a secret key (needs python3):

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

## 6) Deploy / Update Application (CORRECT PROCESS)

**IMPORTANT:** Always use `down` + `up` instead of just `up --build` to avoid 502 Bad Gateway errors caused by Docker network issues.

```bash
cd /opt/nature_marketplace/nature_marketplace

# 1. Pull latest changes
git pull

# 2. Stop all containers (this resets the Docker network)
docker compose -f docker-compose.prod.yml down

# 3. Start all containers (rebuilds images if needed)
docker compose -f docker-compose.prod.yml up -d --build

# 4. Wait for services to be ready (30 seconds)
sleep 30

# 5. Verify all containers are UP
docker compose -f docker-compose.prod.yml ps

# 6. Clear Django cache (prevents 429 throttling errors)
docker compose -f docker-compose.prod.yml exec db psql -U nature_user -d nature_db -c "TRUNCATE TABLE django_cache_table;"

# 7. Apply database migrations
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# 8. Reseed database with demo data (optional, only if needed)
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_all --clear
```

## 6.1) Create Django DB cache table (first time setup only)

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createcachetable
```

Status:

```bash
docker compose -f docker-compose.prod.yml ps
```

Logs:

```bash
docker compose -f docker-compose.prod.yml logs -f --tail=200
```

## 7) Manage IP Allowlist (Nginx)

### 7.1) Edit IP allowlist

```bash
cd /opt/nature_marketplace/nature_marketplace

# Open Nginx config with vi
vi nginx/conf.d/default.conf
```

**Inside each `server { ... }` block** (both port 80 and 443 if present), add or remove IPs:

```nginx
# Allow specific IPs
allow 186.87.10.59;      # Your office IP
allow 203.0.113.45;      # Another allowed IP
allow 192.168.1.0/24;    # Allow entire subnet

# Block all other IPs
deny all;
```

**Vi editor quick commands:**
- Press `i` to enter INSERT mode
- Edit the IPs as needed
- Press `ESC` to exit INSERT mode
- Type `:wq` and press ENTER to save and quit
- Type `:q!` and press ENTER to quit without saving

### 7.2) Apply changes (reload Nginx without downtime)

```bash
cd /opt/nature_marketplace/nature_marketplace

# Reload Nginx configuration (no downtime)
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

You should see:
```
2026/01/11 15:49:00 [notice] ... signal process started
```

### 7.3) Verify IP allowlist is working

```bash
# View current IP allowlist configuration
docker compose -f docker-compose.prod.yml exec nginx cat /etc/nginx/conf.d/default.conf | grep -A 10 "allow"

# Test from your allowed IP (should return 200 OK)
curl -I http://82.180.160.167

# Test from VPS localhost (will return 403 unless 127.0.0.1 is allowed)
curl -I http://localhost
```

**Note:** Changes take effect immediately after reload. No need to restart the container.

## 8) Delete the `deploy` user (optional)

Make sure you are NOT logged in as `deploy`.

```bash
id deploy
who
sudo pkill -u deploy
sudo deluser --remove-home deploy
```
