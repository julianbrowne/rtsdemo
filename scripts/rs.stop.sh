
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

for NODE in ${RSETLIST[@]}
do
    # warning uses evil eval
    
    TEMPPATH="`eval echo \$\{${NODE}\}`"
    PROCFILE="${TEMPPATH}/mongod.pid"

    if [ -f "${PROCFILE}" ]
    then
        PID=`cat "${PROCFILE}"`
        if [ "${PID}" -eq "" ]
        then
            echo "Can't find node process id in ${PROCFILE}"
    		echo "Trying ps, fgrep, awk, etc"

            PID=`ps -ef | fgrep ${PROCFILE} | grep -v grep | awk '{print $2}'`

            if [ "${PID}" -eq "" ]
            then
                echo "Failed to find a process"
                exit 1
            fi
        fi

        echo "Attempting to stop ${PID}"
        kill -1 ${PID}
        sleep 3 # wait otherwise mongod touches the file
        rm -f "${PROCFILE}"

    else
        echo "No PID file. Doesn't look like mongod is running"
        echo "Try stopping manually"
        exit 1
    fi
done
