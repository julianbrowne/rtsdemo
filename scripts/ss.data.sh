
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

MONGOPRT=${MONGO_DEMO.PORT}

${MONGODB_HOME}/bin/mongo --port ${MONGOPRT} << EOF

use rtsdemo

var events = [ 'login', 'logout', 'home-page', 'basket-add', 'basket-view', 'checkout', 'prod-page', 'feedback', 'ad-click' ]

function random(max) { return Math.floor(Math.random() * max) + 1; }

if(db.getCollectionNames().indexOf("statstore")===-1 || !db.statstore.isCapped()) { db.createCollection("statstore", {capped: true, size: 5000000}); }

for(i=0; i<200000; i++) { db.statstore.save({event: events[random(events.length)-1], count: random(5) }) }

EOF
