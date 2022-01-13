FROM mysql/mysql-server:8.0.27-1.2.6-server

ENV MYSQL_USER=gsma-sa MYSQL_PASSWORD=password MYSQL_DATABASE=registry

COPY tokens_dump.sql ./docker-entrypoint-initdb.d/

EXPOSE 3306
