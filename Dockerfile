# ---- Dependencies ----
FROM node:16-slim as dependencies

COPY src/package*.json .
RUN npm install --only=production

# ---- Start ----
FROM node:16-slim

# librsvg2-dev must be required for node canvas font
RUN apt-get update -y \
    && apt-get install -y librsvg2-dev fonts-noto-cjk \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /ogp/src

COPY --from=dependencies ./node_modules ./node_modules
COPY src/ /ogp/src/
COPY resources/ /ogp/resources/

ENTRYPOINT node index.js
