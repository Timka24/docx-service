FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --only=production

COPY index.js template.docx ./
COPY lib ./lib
COPY routes ./routes
COPY public ./public

EXPOSE 3000
CMD ["node", "index.js"]
