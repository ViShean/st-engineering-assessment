FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Development/Production stage
FROM base AS dev
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Test stage
FROM base AS test
CMD ["npm", "test"]