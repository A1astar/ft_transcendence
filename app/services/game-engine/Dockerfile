# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json tsconfig.json ./
# RUN npm install
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
#RUN npm run build

# Expose port
EXPOSE 3003

# Start server
CMD ["npm", "start"]
