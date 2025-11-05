FROM node:20-alpine

WORKDIR /app

COPY *.json ./

RUN npm ci --production

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
