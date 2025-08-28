# Use official Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

COPY backend/ ./

# Expose port (change to your app's port if needed)
EXPOSE 3000

# Run the app
CMD ["node", "app.js"]
