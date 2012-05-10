
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

if [ -f "${MONGO_PROC}" ]
then
    echo "PID file exists at ${MONGO_PROC} - mongod probably running"
    echo "Run ss.stop.sh first"
    exit 1
fi

if [ -d "${MONGO_DEMO}" ]
then
    echo "Cleaning out server data directory at ${MONGO_DATA}"
    rm -r "${MONGO_DEMO}"
fi

echo "Making empty directory structre"
mkdir -p "${MONGO_DATA}"
