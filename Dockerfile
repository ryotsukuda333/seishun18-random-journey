FROM node:20-alpine

WORKDIR /workspace

RUN apk add --no-cache git curl

# Wrangler CLIのインストール
RUN npm install -g wrangler

# 開発に必要なツールのインストール
RUN npm install -g typescript ts-node nodemon vite

# シェルの設定
RUN echo "alias ll='ls -la'" >> ~/.bashrc