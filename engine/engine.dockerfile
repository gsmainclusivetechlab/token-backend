FROM node:lts-alpine3.12

RUN apk add curl

WORKDIR /app
COPY    package.json package-lock.json ./
RUN     npm install

COPY    . ./

RUN     npm run build

ENTRYPOINT [ "node", "./dist/src/app.js" ]