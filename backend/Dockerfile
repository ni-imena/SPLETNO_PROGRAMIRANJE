# Use a base image that supports Node.js
FROM node:18

# Set the working directory in the container
WORKDIR /SPLETNO_PROGRAMIRANJE/backend

# Copy package.json and package-lock.json
COPY backend/package.json backend/package-lock.json /SPLETNO_PROGRAMIRANJE/backend/
# Install backend dependencies
RUN npm install

# Copy the rest of the backend
COPY backend /SPLETNO_PROGRAMIRANJE/backend

# Expose the necessary port
EXPOSE 3001

# Command to start the backend
CMD ["npm", "run", "dev"]


