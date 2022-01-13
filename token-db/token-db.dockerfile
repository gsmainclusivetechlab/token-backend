FROM mysql/mysql-server:8.0.27-1.2.6-server

ENV MYSQL_USER=root MYSQL_PASSWORD=1234 MYSQL_DATABASE=registry

COPY registry_dump.sql ./docker-entrypoint-initdb.d/

EXPOSE 3306
