
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

echo "Initiating replica set ${RSETNAME}"

SERVID=0
SERVCONF=""

for NODE in ${RSETLIST[@]}
do

    # warning .. uses evil eval

    TEMPPATH="`eval echo \$\{${NODE}\}`"
    MONGOPRT="`eval echo \$\{${NODE}.PORT\}`"
    PROCFILE="${TEMPPATH}/mongod.pid"
    DATAFILE="${TEMPPATH}/datafiles"
    LOGFPATH="${TEMPPATH}/mongod.log"

    if [ -d "${TEMPPATH}" ]
    then
        echo "Cleaning out temp directory at ${TEMPPATH}"
        rm -r "${TEMPPATH}"
    fi

    if [ ! -d "${DATAFILE}" ]
    then
        echo "Making mongodb data directory at ${DATAFILE}"
        mkdir -p "${DATAFILE}"
        > "${LOGFPATH}"
    fi

    SERVCONF="${SERVCONF}{_id: ${SERVID}, host: 'localhost:${MONGOPRT}'},"
    SERVID=`expr ${SERVID} + 1`

    echo "Starting mongod on port ${MONGOPRT} .."
    echo "  data: ${DATAFILE}"
    echo "  logs: ${LOGFPATH}"

    ${MONGODB_HOME}/bin/mongod    \
        --dbpath ${DATAFILE}      \
        --port   ${MONGOPRT}      \
        --pidfilepath ${PROCFILE} \
        --rest \
        --noprealloc \
        --logpath ${LOGFPATH} \
        --replSet ${RSETNAME} &

    sleep 2

done

echo "Connecting to and node at port ${MONGOPRT} .."

SERVCONF=${SERVCONF%,}  # chomp the ','

${MONGODB_HOME}/bin/mongo --port ${MONGOPRT} << EOF

config = { _id: "${RSETNAME}", members: [ ${SERVCONF} ] }

rs.initiate(config);

EOF

sleep 2

