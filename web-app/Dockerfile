FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Expose Vite on all interfaces so it can be accessed from outside the container
CMD ["npm", "run", "dev"]
