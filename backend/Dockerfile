# Stage 1: Build NestJS Application
FROM node:22-bullseye-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma Client and Build
RUN npx prisma generate
COPY . .
RUN npm run build

# Prune dev dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production Worker Image
FROM node:22-bullseye-slim

# Install OS Dependencies for PDF Processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ghostscript \
    libreoffice-core \
    libreoffice-writer \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-ind \
    imagemagick \
    curl \
    git \
    bash \
    fontconfig \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# Fix ImageMagick Security Policy for PDF
RUN sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \/>/<policy domain="coder" rights="read|write" pattern="PDF" \/>/g' /etc/ImageMagick-6/policy.xml || true

WORKDIR /app

# Create necessary folders and change ownership to node user
RUN mkdir -p temp/input temp/output logs uploads && \
    chown -R node:node /app

# Copy built artifacts from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/package.json ./

# Copy entrypoint script
COPY --chown=node:node docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
