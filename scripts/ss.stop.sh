
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

if [ -f "${MONGO_PROC}" ]
then
    PID=`cat "${MONGO_PROC}"`
    if [ "${PID}" -eq "" ]
    then
        echo "Can't find process id in ${MONGO_PROC}"
    else
        echo "Attempting to kill -1 ${PID}"
        kill -1 ${PID}
        sleep 3 # wait otherwise mongod touches the file
        rm -f "${MONGO_PROC}"
    fi
else
    echo "No PID file. Doesn't look like mongod is running"
    echo "Try stopping manually"
    exit 1
fi
