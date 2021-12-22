FROM mysql/mysql-server:latest

ENV MYSQL_ROOT_PASSWORD=R%9FovC$RRR3&Eb#RozM MYSQL_USER=gsma-sa MYSQL_PASSWORD=password MYSQL_DATABASE=tokens

COPY db.sql ./docker-entrypoint-initdb.d/

EXPOSE 3306
