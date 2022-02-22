# ---- Base Node ----
FROM node:16-slim AS base

# librsvg2-dev must be required for node canvas font
RUN apt-get update -y && apt-get install -y librsvg2-dev fonts-noto-cjk

# ---- Dependencies ----
FROM node:16-slim as dependencies

COPY src/package*.json .
RUN npm install --only=production

# ---- Start ----
FROM base AS start

WORKDIR /ogp/src

COPY --from=dependencies ./node_modules ./node_modules
COPY src/ /ogp/src/
COPY resources/ /ogp/resources/

ENTRYPOINT node index.js
