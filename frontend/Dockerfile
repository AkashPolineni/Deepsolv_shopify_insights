FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Add --legacy-peer-deps flag to resolve React 19 conflicts
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
