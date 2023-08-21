# Use a base image that supports Node.js
FROM node:18

# Set the working directory in the container
WORKDIR /SPLETNO_PROGRAMIRANJE/frontend

# Copy package.json and package-lock.json
COPY frontend/package.json frontend/package-lock.json /SPLETNO_PROGRAMIRANJE/frontend/
# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend
COPY frontend /SPLETNO_PROGRAMIRANJE/frontend

# Expose the necessary port
EXPOSE 3000

# Command to start the frontend
CMD ["npm", "start"]


