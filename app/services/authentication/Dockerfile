FROM node:20-alpine

WORKDIR /app

COPY prod.package.json prod.tsconfig.json ./

COPY src ./src

RUN mkdir database

RUN mv prod.package.json package.json && mv prod.tsconfig.json tsconfig.json

# RUN npm ci --production
RUN apk add --no-cache git openssh-client \
    && npm install

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
