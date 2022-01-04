FROM node:lts-alpine3.12

RUN apk add curl

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm i --unsafe-perm=true

COPY    . ./

RUN     npm run build

ENTRYPOINT [ "node", "./dist/src/app.js" ]
