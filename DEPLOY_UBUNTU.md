# Deploy My Digital Grimoire on an Ubuntu Server VM

This guide is for testing the site on an Ubuntu Server virtual machine from a
Windows computer. The goal is to make the site feel like a real website by using
a local domain name such as `mydigitalgrimoire.test`.

## 1. Push the project from Windows to GitHub

From the project folder on Windows:

```powershell
git status
git add .
git commit -m "Add scalable server skeleton"
git push
```

If this is the first push, create an empty GitHub repo and connect it:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

Do not commit `.env`. The real `.env` file holds secrets.

## 2. Create the Ubuntu Server VM

Create an Ubuntu Server VM in VirtualBox or VMware.

Recommended VM settings for a class project:

- 2 CPU cores
- 2 GB RAM or more
- 20 GB disk or more
- Bridged networking, if possible

Bridged networking makes the VM appear like another computer on your network.
That makes it easier to open the site from Windows.

After Ubuntu starts, find the VM IP address:

```bash
ip addr
```

Look for an address like `192.168.x.x`.

## 3. Install server software

On Ubuntu:

```bash
sudo apt update
sudo apt install -y git nginx mariadb-server
```

Install Node.js LTS. One common option is NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Check versions:

```bash
node -v
npm -v
mysql --version
nginx -v
```

## 4. Clone the project onto Ubuntu

Choose a folder for the site:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git digital-grimoire
cd digital-grimoire
```

Install Node dependencies:

```bash
npm install
```

## 5. Create the MariaDB database

Open MariaDB:

```bash
sudo mysql
```

Create the database and user:

```sql
CREATE DATABASE digital_grimoire;
CREATE USER 'grimoire_user'@'localhost' IDENTIFIED BY 'change_this_password';
GRANT ALL PRIVILEGES ON digital_grimoire.* TO 'grimoire_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Use a stronger password on a real server.

## 6. Create the Ubuntu `.env` file

Copy the example file:

```bash
cp .env.example .env
nano .env
```

Example values:

```env
DATABASE_URL="mysql://grimoire_user:change_this_password@localhost:3306/digital_grimoire"
GEMINI_API_KEY="your_real_gemini_api_key"
PORT=3000
NODE_ENV="production"
```

The API key stays on the server. It should not be placed in frontend JavaScript.

## 7. Set up Prisma

Generate the Prisma client:

```bash
npm run prisma:generate
```

Create the database tables:

```bash
npm run prisma:migrate -- --name init
```

Add starter content:

```bash
npm run prisma:seed
```

## 8. Test Express directly on Ubuntu

Start the app:

```bash
npm start
```

On the Ubuntu VM, test:

```bash
curl http://localhost:3000
curl http://localhost:3000/api/products
```

Press `Ctrl+C` to stop the app after testing.

## 9. Run the Node app with systemd

Create a systemd service:

```bash
sudo nano /etc/systemd/system/digital-grimoire.service
```

Paste this, changing `YOUR-UBUNTU-USER` if needed:

```ini
[Unit]
Description=My Digital Grimoire Node App
After=network.target mariadb.service

[Service]
Type=simple
User=YOUR-UBUNTU-USER
WorkingDirectory=/var/www/digital-grimoire
ExecStart=/usr/bin/node app.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable digital-grimoire
sudo systemctl start digital-grimoire
sudo systemctl status digital-grimoire
```

View logs:

```bash
journalctl -u digital-grimoire -f
```

## 10. Configure Nginx for a local test domain

Create an Nginx site file:

```bash
sudo nano /etc/nginx/sites-available/digital-grimoire
```

Paste:

```nginx
server {
    listen 80;
    server_name mydigitalgrimoire.test;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/digital-grimoire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 11. Point Windows to the Ubuntu VM domain

On Windows, open Notepad as Administrator.

Open this file:

```text
C:\Windows\System32\drivers\etc\hosts
```

Add a line using your Ubuntu VM IP:

```text
192.168.x.x mydigitalgrimoire.test
```

Save the file.

Now open this in the Windows browser:

```text
http://mydigitalgrimoire.test
```

This is still local VM testing, but it lets you visit the site with a domain
name instead of typing an IP address or `:3000`.

## 12. Real public domain later

For a real public website later:

1. Buy or use a real domain.
2. Point the domain DNS `A` record to the public server IP.
3. If hosting from home, forward router ports `80` and `443` to the Ubuntu VM.
4. Change the Nginx `server_name` to the real domain.
5. Add HTTPS with Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Useful commands

Restart the app:

```bash
sudo systemctl restart digital-grimoire
```

Pull new code from GitHub:

```bash
cd /var/www/digital-grimoire
git pull
npm install
npm run prisma:generate
npm run prisma:migrate
sudo systemctl restart digital-grimoire
```

Check Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
```

Check the app:

```bash
sudo systemctl status digital-grimoire
```
