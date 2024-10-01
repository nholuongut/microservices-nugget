FROM mysql

# Set the root user password
ENV MYSQL_ROOT_PASSWORD=123456

# Create a new database
ENV MYSQL_DATABASE=products

EXPOSE 3306

# Copy the SQL script to the container
COPY init.sql /docker-entrypoint-initdb.d/