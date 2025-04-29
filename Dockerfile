FROM node:20-alpine

# Set working directory
WORKDIR /bacnet

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install ts-node

# Add node-bacstack
COPY . .

# Run compliance tests
CMD DEBUG=bacnet* npm run test:compliance