# Pinned to an outdated image with known CVEs
FROM node:14.17.0

WORKDIR /app

# Secret baked into image layer - visible in docker history
ENV DATABASE_PASSWORD=P@ssw0rd123!
ENV JWT_SECRET=hardcoded-jwt-secret-do-not-commit
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --production

COPY . .

# Running as root - any RCE gives full container control
EXPOSE 3000
CMD ["node", "server.js"]