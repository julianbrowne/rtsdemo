
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

for PROCFILE in ${MONGO_PRC1} ${MONGO_PRC2}
do
    if [ -f "${PROCFILE}" ]
    then
        PID=`cat "${PROCFILE}"`
        if [ "${PID}" -eq "" ]
        then
            echo "Can't find node process id in ${PROCFILE}"
        else
            echo "Attempting to kill -1 ${PID}"
            kill -1 ${PID}
            sleep 3 # wait otherwise mongod touches the file
            rm -f "${PROCFILE}"
        fi
    else
        echo "No PID file. Doesn't look like mongod is running"
        echo "Try stopping manually"
        exit 1
    fi
done
