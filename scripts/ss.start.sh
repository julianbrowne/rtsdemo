
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

PROCFILE=${MONGO_DEMO}/mongod.pid
DATAFILE=${MONGO_DEMO}/datafiles
LOGFPATH=${MONGO_DEMO}/mongod.log
MONGOPRT=${MONGO_DEMO.PORT}

if [ -f "${PROCFILE}" ]
then
    echo "PID file exists at ${PROCFILE} - mongod already running"
    exit 1
fi

if [ ! -d "${DATAFILE}" ]
then
    echo "Making single server data directory at ${DATAFILE}"
    mkdir -p "${DATAFILE}"
fi

echo "Starting mongod on port ${MONGOPRT}.."

> "${LOGFPATH}"

${MONGODB_HOME}/bin/mongod    \
    --dbpath ${DATAFILE}      \
    --port   ${MONGOPRT}    \
    --pidfilepath ${PROCFILE} \
    --rest \
    --noprealloc \
    --logpath ${LOGFPATH} &

sleep 2
