FROM node:20-alpine

WORKDIR /app

COPY *.json ./

# Install all dependencies (including dev) for build
RUN npm install

# Install TypeScript globally and @types/node locally (needed for build)
RUN npm install -g typescript && \
    npm install --save-dev @types/node typescript

COPY . .

# Build TypeScript using standalone build config
RUN tsc -p tsconfig.build.json

# Frontend will be mounted as a volume in docker-compose.yml

EXPOSE 3004

CMD ["npm", "start"]
