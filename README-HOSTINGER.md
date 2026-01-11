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

## 7) Restrict the site to an IP allowlist (Nginx)

Edit:

```bash
nano nginx/conf.d/default.conf
```

Inside each `server { ... }` block (80 and 443 if present):

```nginx
allow 186.87.10.59;
deny all;
```

Reload Nginx (container):

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

Test from your laptop (allowed IP):

```bash
curl -I http://82.180.160.167
```

Note: `curl http://localhost` from inside the VPS will return 403 unless you also allow `127.0.0.1`.

## 8) Delete the `deploy` user (optional)

Make sure you are NOT logged in as `deploy`.

```bash
id deploy
who
sudo pkill -u deploy
sudo deluser --remove-home deploy
```
