

Simple Real-Time Stats Demo Using MongoDB, node.js and D3
=========================================================

MongoDB Thames Valley User Group Demo
(April 2012)

Includes:

- slides (keynote and PDF)
- script sources for set-up and for writer
- node.js server to stream MongoDB data
- web site with D3 charting

Set-up
------

- Install MongoDB
- Put these files demo somewhere (e.g. /usr/local/rtsdemo)
- Edit scripts/rtsdemo.conf.sh and set location of MongoDB and the home directory for this demo

    MONGODB_HOME        // root directory of MongoDB install  
    RTSDEMO_HOME        // root directory for these files  

The demo includes a number of shortcut scripts for starting and stopping MongoDB etc. They
keep MongoDB demo data local to the demo directory ($RTSDEMO_HOME/temp) so as not to interfere
with any existing local installation. All commands below will assume a root of $RTSDEMO_HOME

Demo Part 1
-----------

- start mongod as single server

  scripts/ss.start.sh

- (note: other useful scripts)

  scripts/ss.stop.sh    // shuts single server down
  scripts/ss.clean.sh   // removes temp data/log/pid files  

- start mongo shell and create a capped collection

  mongo

	use rtsdemo

	db.createCollection("statstore", {capped: true, size: 5000000});

- write data to mongoDB, either manually or by running writer script

  db.statstore.save({ event: 'login', count: 5});

- Query with a tailable cursor

  c = db.collection.find({}).addOption(2).addOption(32);

- This queries, waits about 4 secs, and times out

- Next step is to put cursor query into a loop ..

  for(i=0;i<8;i++) {
        while(c.hasNext()) {
             var doc = c.next();
             printjson( doc );
        }
  }

- A loop like this is not a great ideas for anything other than a demo
so next step is to move reader functionality to something like node.js,
though ruby or python would be just as simple

- start node.js server

  node server.js

- Open browser (only tested in chrome 18.0, FF should work fine). The
http and websocket are bound to port 8010

  http://localhost:8010

- Finally use a simple mongo shell writer script to fill the collection
with random stuff. This creates 200k docs, to loop at least once around
the capped collection

  var events = [ 'login', 'logout', 'home-page', 'basket-add', 'basket-view', 'prod-page', 'feedback', 'ad-click' ]

  function random(max) { return Math.floor(Math.random() * max) + 1; }

  for(i=0; i<200000; i++) { db.statstore.save({event: events[random(events.length)-1], count: random(5) }) }

- This shows the basic set up and operation. The grandaddy of all
capped collections is the oplog used to communicate between nodes
in a Replica Set. Everything that happens on the primary is written
in an idempotent form to the oplog and then picked up by member
nodes.

- Start a Replica Set

  scripts/rs.start.sh

- (note: other useful scripts)

  scripts/rs.stop.sh    // stops RS servers

- Start alternative node.js server that tails the oplog and visualises
mongodb creates, updates and deletes

  node oplogd.js

- Open browser. http and websocket are bound to port 8011

  http://localhost:8011

- Now you can write anything in any database or collection on the master
and it will show up on the visualisation

  mongo --port 8002

- (note: usually port its 8002, though the mongo shell will indicate which node
has become primary as its prompt. If it's not 8002 it's 8003)
