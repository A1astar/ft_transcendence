FROM node:20-alpine

WORKDIR /app

COPY *.json ./

RUN npm ci --production

COPY . .

RUN npm run build

EXPOSE 3004

CMD ["npm", "start"]
