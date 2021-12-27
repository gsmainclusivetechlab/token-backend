FROM mysql/mysql-server:8.0.27-1.2.6-server

COPY db.sql ./docker-entrypoint-initdb.d/

EXPOSE 3306
