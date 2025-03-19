FROM node:20-alpine

WORKDIR /workspace

RUN apk add --no-cache git curl docker docker-cli-compose

# Wrangler CLIのインストール
RUN npm install -g wrangler

# Supabase CLIのインストール
RUN npm install -g supabase

# 開発に必要なツールのインストール
RUN npm install -g typescript ts-node nodemon vite

# シェルの設定
RUN echo "alias ll='ls -la'" >> ~/.bashrc