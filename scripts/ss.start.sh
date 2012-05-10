
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

if [ -f "${MONGO_PROC}" ]
then
    echo "PID file exists at ${MONGO_PROC} - mongod already running"
    exit 1
fi

if [ ! -d "${MONGO_DATA}" ]
then
    echo "Making single server data directory at ${MONGO_DATA}"
    mkdir -p "${MONGO_DATA}"
fi

echo "Starting mongod .."

> "${MONGO_LOGF}"

${MONGODB_HOME}/bin/mongod \
    --dbpath ${MONGO_DATA} \
    --port   ${MONGO_PORT} \
    --pidfilepath ${MONGO_PROC} \
    --rest \
    --noprealloc \
    --logpath ${MONGO_LOGF} &

sleep 2
