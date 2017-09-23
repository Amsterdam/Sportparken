FROM amsterdam/docker_python:latest
MAINTAINER datapunt@amsterdam.nl

ENV PYTHONUNBUFFERED 1
ENV CONSUL_HOST=${CONSUL_HOST:-notset}
ENV CONSUL_PORT=${CONSUL_PORT:-8500}
ENV DATAPUNT_API_URL=${DATAPUNT_API_URL:-https://api.data.amsterdam.nl/}

EXPOSE 8000

RUN adduser --system datapunt \
	&& mkdir -p /static \
	&& chown datapunt /static \
	&& pip install uwsgi

WORKDIR /app

COPY sportparken/static /static

COPY . /app/

# CI hook - see .jenkins/README.TXT
#COPY .jenkins/import /.jenkins-import/
#COPY .jenkins/docker-migrate.sh /app/

RUN pip install --no-cache-dir -r requirements.txt
USER datapunt

RUN export DJANGO_SETTINGS_MODULE=sportparken.settings


RUN python manage.py collectstatic --noinput

CMD uwsgi

