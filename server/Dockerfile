FROM node:20-alpine

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code first
COPY . .

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client (after schema is available)
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Create data and uploads directories
RUN mkdir -p data uploads

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
