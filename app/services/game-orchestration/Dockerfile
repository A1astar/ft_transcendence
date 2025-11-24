# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies (including dev for build)
COPY package*.json ./
RUN npm install

# Install TypeScript globally and @types/node locally (needed for build)
RUN npm install -g typescript && \
    npm install --save-dev @types/node typescript

# Copy source code and tsconfig files
COPY . .

# Build TypeScript using standalone build config
RUN tsc -p tsconfig.build.json

# Expose port
EXPOSE 3002

# Start server
CMD ["npm", "start"]
