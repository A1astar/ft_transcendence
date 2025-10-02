# Use Node 20
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install --production \
    npm run build

EXPOSE 3001

CMD ["npm", "start"]
