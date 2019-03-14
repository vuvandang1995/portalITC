# 1.Config celery

### 1.1.Create celery environment file
`nano home/dungnv/portal/celery_env_file`

```
# Name of nodes to start
# here we have a single node
#CELERYD_NODES="w1"
# or we could have three nodes:
CELERYD_NODES="w1 w2 w3"

# Absolute or relative path to the 'celery' command:
CELERY_BIN="/home/dungnv/portal/env/bin/celery"
#CELERY_BIN="/virtualenvs/def/bin/celery"

# App instance to use
# comment out this line if you don't use an app
CELERY_APP="portal"
# or fully qualified:
#CELERY_APP="proj.tasks:app"

# How to call manage.py
CELERYD_MULTI="multi"

# Extra command-line arguments to the worker
CELERYD_OPTS="--time-limit=600 --concurrency=8"

# - %n will be replaced with the first part of the nodename.
# - %I will be replaced with the current child process index
#   and is important when using the prefork pool to avoid race conditions.
CELERYD_PID_FILE="/var/run/celery/%n.pid"
CELERYD_LOG_FILE="/var/log/celery/%n%I.log"
CELERYD_LOG_LEVEL="INFO"
```

#### create folder 
```
mkdir /var/run/celery /var/log/celery
```

### 1.2.Create celery.service file
`sudo nano /etc/systemd/system/celery.service`
```
[Unit]
Description=Celery Service
After=network.target

[Service]
Type=forking
User=root
#Group=celery
EnvironmentFile=/home/dungnv/portal/celery_env_file
WorkingDirectory=/home/dungnv/portal
ExecStart=/bin/sh -c '${CELERY_BIN} multi start ${CELERYD_NODES} -A ${CELERY_APP} --pidfile=${CELERYD_PID_FILE} --logfile=${CELERYD_LOG_FILE} --loglevel=${CELERYD_LOG_LEVEL} ${CELERYD_OPTS}'
ExecStop=/bin/sh -c '${CELERY_BIN} multi stopwait ${CELERYD_NODES} --pidfile=${CELERYD_PID_FILE}'
ExecReload=/bin/sh -c '${CELERY_BIN} multi restart ${CELERYD_NODES} -A ${CELERY_APP} --pidfile=${CELERYD_PID_FILE} --logfile=${CELERYD_LOG_FILE} --loglevel=${CELERYD_LOG_LEVEL} ${CELERYD_OPTS}'

[Install]
WantedBy=multi-user.target

```
# 2.Config celery beat

### 2.1.Create celery environment file
`nano home/dungnv/portal/celerybeat_env_file`

```
# Name of nodes to start
# here we have a single node
CELERYD_NODES="wb1"
# or we could have three nodes:
#CELERYD_NODES="wb1 wb2 wb3"

# Absolute or relative path to the 'celery' command:
CELERY_BIN="/home/dungnv/portal/env/bin/celery"
#CELERY_BIN="/virtualenvs/def/bin/celery"

# App instance to use
# comment out this line if you don't use an app
CELERY_APP="portal"
# or fully qualified:
#CELERY_APP="proj.tasks:app"

# How to call manage.py
CELERYD_MULTI="multi"

# Extra command-line arguments to the worker
CELERYD_OPTS="--time-limit=300 --concurrency=8"

# - %n will be replaced with the first part of the nodename.
# - %I will be replaced with the current child process index
#   and is important when using the prefork pool to avoid race conditions.
CELERYD_PID_FILE="/var/run/celery/%n.pid"
CELERYD_LOG_FILE="/var/log/celery/%n%I.log"
CELERYD_LOG_LEVEL="INFO"

# you may wish to add these options for Celery Beat
CELERYBEAT_PID_FILE="/var/run/celery/beat.pid"
CELERYBEAT_LOG_FILE="/var/log/celery/beat.log"
```

### 2.2.Create celerybeat.service file
`sudo nano /etc/systemd/system/celerybeat.service`
```
[Unit]
Description=Celery Beat Service
After=network.target

[Service]
Type=simple
User=celery
Group=celery
EnvironmentFile=/home/dungnv/portal/celerybeat_env_file
WorkingDirectory=/home/dungnv/portal
ExecStart=/bin/sh -c '${CELERY_BIN} beat -A ${CELERY_APP} --pidfile=${CELERYBEAT_PID_FILE} --logfile=${CELERYBEAT_LOG_FILE} --loglevel=${CELERYD_LOG_LEVEL}'

[Install]
WantedBy=multi-user.target

```
