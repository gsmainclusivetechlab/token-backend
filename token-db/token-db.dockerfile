FROM mysql:5.7.15

COPY db.sql ./docker-entrypoint-initdb.d/

EXPOSE 3306
