FROM node:20.12.2-alpine
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files and folders
COPY . .

# Specify the entry point command
CMD [ "node", "app.js" ]
