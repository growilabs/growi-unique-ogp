FROM node:16-slim

RUN apt-get update -y \
    && apt-get install -y python3 build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev fonts-noto-cjk

COPY src/ /ogp/src/
COPY resources/ /ogp/resources/

WORKDIR /ogp/src

RUN ["/bin/bash", "-c", "npm install"]

ENTRYPOINT ["npm", "start"]
