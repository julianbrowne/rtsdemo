
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

PROCFILE=${MONGO_DEMO}/mongod.pid
DATAFILE=${MONGO_DEMO}/datafiles

if [ -f "${PROCFILE}" ]
then
    echo "PID file exists at ${PROCFILE} - mongod probably running"
    echo "Run ss.stop.sh first"
    exit 1
fi

if [ -d "${MONGO_DEMO}" ]
then
    echo "Cleaning out server data directory at ${DATAFILE}"
    rm -r "${MONGO_DEMO}"
fi

echo "Making empty directory structure"
mkdir -p "${DATAFILE}"
