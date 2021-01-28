FROM node:14-alpine3.10

RUN mkdir /home/node/web && chown -R node:node /home/node/web
WORKDIR /home/node/web
COPY --chown=node:node web/package*.json ./
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node web ./

RUN mkdir /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node api/package*.json ./
COPY --chown=node:node api/.env* ./

ENV NODE_ENV=test
USER node
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node api ./

RUN npm run build
EXPOSE 3000

WORKDIR /home/node/web
RUN npm run build:docker

WORKDIR /home/node/app

CMD ["node", "./dist/index.js"]