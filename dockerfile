# Stage 1: Build Frontend
FROM node:18 AS frontend_build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
# Build-time argument
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN npm run build


# Stage 2: Build Admin
FROM node:18 AS admin_build

WORKDIR /app/admin

COPY admin/package*.json ./
RUN npm install

COPY admin/ ./
RUN npm run build

# Stage 3: Build Backend Dependencies
FROM node:18 AS backend_build

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./

# Stage 4: Final Image
FROM node:18

WORKDIR /app/backend

# Copy backend code from backend_build stage
COPY --from=backend_build /app/backend/ ./

# Copy built frontend and admin into backend's public directories
COPY --from=frontend_build /app/frontend/dist/ ./public/frontend/
COPY --from=admin_build /app/admin/dist/ ./public/admin/

# Expose port
EXPOSE 4000



# Start the backend server
CMD ["node", "server.js"]
