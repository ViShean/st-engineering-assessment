FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Backend standard port
EXPOSE 3001

# Start command
CMD ["npm", "run", "dev"]