#!/usr/bin/env bash
# Assumes the database container is named 'database'

DIRPATH=$(pwd)
echo $DIRPATH

DOCKER_DB_NAME="$(docker-compose ps -q database)"
DB_HOSTNAME=sportparken
DB_USER=sportparken
LOCAL_DUMP_PATH="${DIRPATH}/database/sportparken_2017-09-26.gz"

docker-compose up -d database
docker exec -i "${DOCKER_DB_NAME}" pg_restore -c --if-exists -d sportparken --no-owner -U "${DB_USER}" -d "${DB_HOSTNAME}" < "${LOCAL_DUMP_PATH}"
docker-compose stop database


