FROM node:dubnium-alpine

# Set working directory
WORKDIR /bacstack

# Install dependencies
COPY package.json .
RUN npm install && npm i --only=dev

# Add node-bacstack
COPY . .

# Run compliance tests
CMD DEBUG=bacnet* npm run coverage:all
