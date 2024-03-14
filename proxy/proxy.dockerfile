FROM node:lts-alpine3.19

RUN apk add curl

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN npm install -g pm2 
RUN pnpm i --unsafe-perm=true

COPY    . ./

RUN     npm run build

ENTRYPOINT [ "pm2-runtime", "pm2.json" ]
