# Build Stage 
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
ENV VUE_APP_SERVICE_API=https://backend-route-fathyafi-dev.apps.rm1.0a51.p1.openshiftapps.com
RUN yarn build

# Production Stage - Node.js Serve Static
FROM node:20-alpine AS production-stage
WORKDIR /app


# Install 'serve' (static file server)
RUN yarn global add serve

# Copy build result from build-stage
COPY --from=build-stage /app/dist /app/dist

EXPOSE 3000

# Jalankan 'serve' untuk hasil build di folder /app/dist
CMD ["serve", "-s", "dist", "-l", "3000"]
