# Server Running Guide

This guide explains how to update and restart the Node.js server on Cloudways.

---

## Step 1: Pull the latest code

Pull the latest version of your repository from GitHub:

```bash
git pull origin main
```

Or clone if it’s the first setup:

```bash
git clone https://github.com/your-username/your-repo.git
```

---

## Step 2: Stop the current PM2 process

Stop or delete the existing Node.js process:

```bash
# Stop process by ID or name
pm2 stop <process-id|process-name>

# Delete process if needed
pm2 delete <process-id|process-name>
```

Remove old dependencies and build directory:

```bash
rm -rf node_modules dist
```

---

```
> ⚠️ Check environment example files  to setup environment variables

---


---

## Step 3: Install dependencies and build

```bash
npm install
npm run build
```

---

## Step 4: Start the server

```bash
# Start a new PM2 process
pm2 start dist/index.js --name <process-name>

# Or restart an existing process
pm2 restart <process-id|process-name>

# Save the PM2 process list to auto-start on reboot
pm2 save


## Step 5: Verify the server

```bash
# Check logs for errors
pm2 logs <process-name>
```

Visit your website to confirm everything is working.

---

✅ **Server update complete**