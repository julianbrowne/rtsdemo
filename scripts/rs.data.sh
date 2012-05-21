
HERE=$(dirname $0); . ${HERE}/rtsdemo.conf

MONGOPRT=${MONGO_RSN1.PORT}

${MONGODB_HOME}/bin/mongo --port ${MONGOPRT} << EOF

var rtsdbs   = [ 'mydb', 'stuff', 'things', 'other' ];
var rtscolls = [ 'c1', 'c2', 'c3' ];
var rtskeys  = [ 'login', 'logout', 'home-page', 'basket-add', 'basket-view', 'checkout', 'prod-page', 'feedback', 'ad-click' ];

function random(max) { return Math.floor(Math.random() * max) + 1; }

for(var i=0; i<100; i++){

    var randDb   = rtsdbs[random(rtsdbs.length)-1];
    var randColl = rtscolls[random(rtscolls.length)-1];
    var randKey  = rtskeys[random(rtskeys.length)-1];

    var randDoc = {};
    randDoc['_id'] = i;
    randDoc[randKey] = random(5);

    db = connect("localhost:" + ${MONGOPRT} + "/" + randDb);

    db[randColl].save(randDoc);

}

EOF
