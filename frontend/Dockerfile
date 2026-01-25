FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 5173

# Run in development mode
CMD ["npm", "run", "dev", "--", "--host"]