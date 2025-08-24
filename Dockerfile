FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose the port (Render will override this)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
