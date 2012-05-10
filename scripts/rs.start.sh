
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

if [ -d "${MONGO_RSN1}" ]
then
    echo "Cleaning out RS Node 1 tmp directory at ${MONGO_RSN1}"
    rm -r "${MONGO_RSN1}"
fi

if [ ! -d "${MONGO_DAT1}" ]
then
    echo "Making RS Node 1 data directory at ${MONGO_DAT1}"
    mkdir -p "${MONGO_DAT1}"
fi

echo "Starting Node 1 .."

${MONGODB_HOME}/bin/mongod \
    --dbpath ${MONGO_DAT1} \
    --port   ${MONGO_PRT1} \
    --pidfilepath ${MONGO_PRC1} \
    --rest \
    --noprealloc \
    --logpath ${MONGO_LOG1} \
    --replSet ${MONGO_REPSET} &

sleep 2

if [ -d "${MONGO_RSN2}" ]
then
    echo "Cleaning out RS Node 1 tmp directory at ${MONGO_RSN2}"
    rm -r "${MONGO_RSN2}"
fi

if [ ! -d "${MONGO_DAT2}" ]
then
    echo "Making RS Node 2 data directory at ${MONGO_DAT2}"
    mkdir -p "${MONGO_DAT2}"
fi

echo "Starting Node 2 .."

${MONGODB_HOME}/bin/mongod \
    --dbpath ${MONGO_DAT2} \
    --port   ${MONGO_PRT2} \
    --pidfilepath ${MONGO_PRC2} \
    --rest \
    --noprealloc \
    --logpath ${MONGO_LOG2} \
    --replSet ${MONGO_REPSET} &

sleep 2

echo "Connecting to and initiating Node 1 .."

${MONGODB_HOME}/bin/mongo --port ${MONGO_PRT1} << EOF

config = { _id: "${MONGO_REPSET}", members: [
                          {_id: 0, host: "localhost:${MONGO_PRT1}"},
                          {_id: 2, host: 'localhost:${MONGO_PRT2}'}
                        ]
           }

rs.initiate(config);

EOF

sleep 2

