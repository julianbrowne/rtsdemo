

#MongoDB Simple Real-Time Stats Demo

###Also starring node.js and D3

MongoDB Thames Valley User Group (April 2012)  
MongoDB London User Group (May 2012)  

##Contents

- Slides [PDF]
- Scripts for all demo steps
- Two node servers to stream MongoDB data
- A node web server for pages with D3 charting

##Prerequisites

- MongoDB (v2.0.2, v2.2.0, v2.4.0, v2.4.4 used ok)
- Node.JS (v0.6.10, v0.8.20 used ok; v0.11.2 didn't work)

##Installation

- Put these files demo somewhere (e.g. /usr/local/rtsdemo)
- Edit scripts/rtsdemo.conf and set location of MongoDB and the home directory for this demo

    	MONGODB_HOME        // root directory of MongoDB install  
    	RTSDEMO_HOME        // root directory for these files  

	> The demo includes a number of shortcut scripts for starting and stopping MongoDB etc. They
keep MongoDB demo data local to the demo directory ($RTSDEMO_HOME/temp) so as not to interfere
with any existing local installation. All commands below will assume a root of $RTSDEMO_HOME

##Part One

Run a single server mongod, make a capped collection, put docs into it and stream it to a couple of simple browser visualisations

- Start mongod as single server

  		scripts/ss.start.sh

	Other useful scripts
	
		scripts/ss.stop.sh    // shuts single server down   
  		scripts/ss.clean.sh   // removes temp data/log/pid files  

- Start mongo shell and create a capped collection

  		scripts/ss.shell.sh
  	
	then in mongo shell

		use rtsdemo
		db.createCollection("statstore", {capped: true, size: 5000000});

- Write data to mongoDB, either manually or by running writer script

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

	A loop like this is not a great idea for anything other than a demo
so next step is to move reader functionality to something like node.js
(ruby or python would be just as good)

- Start node.js server for demo web pages

  		node server

- Start node.js listener

  		node sswatcher

- Open browser (only tested in chrome 18.0, FF should work fine).  
The http server by default runs on http://localhost:8010 the websocket on ws://localhost:8011  

	Tabs in browser are:  
	**Simple Receiver** - watches collection "statstore" in database "rtsdemo" and displays the document ID of each doc that gets appended to the capped collection  
	**D3 Example** - short showcase of D3 using one JSON set, visualised in various ways  
	**Bar Chart** - watches same db/collection as Simple Receiver but displays event details in bar chart  
	**Op Log Watcher** - used in part 2 of demo  
	
- To activate Simple Receiver and Bar Chart either use a simple mongo shell writer script to fill the collection with random stuff …
    
	This, for example, creates 200k docs, to loop at least once around the capped collection

  		var events = [ 'login', 'logout', 'home-page', 'basket-add', 'basket-view', 'prod-page', 'feedback', 'ad-click' ]

  		function random(max) { return Math.floor(Math.random() * max) + 1; }

  		for(i=0; i<200000; i++) { db.statstore.save({event: events[random(events.length)-1], count: random(5) }) }

	Note - this can be run directly from script/ss.data.sh

##Part Two

The grandaddy of all capped collections is the [oplog](http://www.mongodb.org/display/DOCS/Replica+Sets+-+Oplog). The oplog is used to communicate between the primary node and member nodes in a Replica Set. Data written/updated on the primary is written, in idempotent form, to the oplog and then picked up by member nodes.

- Start a Replica Set

  		scripts/rs.start.sh

	Note: other useful scripts

  		scripts/rs.stop.sh    // stops rep set nodes

- Start alternative node.js server that tails the oplog and visualises mongodb creates, updates and deletes

  		node rswatcher

- Now final tab in demo html will work (node server process needs to still be running). Websocket is by default running on 8012

	Now we can write anything, in any database, or collection, on the master and it will show up in the visualisation

		scripts/rs.shell.sh
		  
	Shell prompt will initially be "SECONDARY" and then change to "PRIMARY" once the rep set sorts itself out.
	
	Write/update data to any db/collection and it should be appear in the oplog watcher.
	
	To really mess the screen up, lots of random data can be written to mongodb with the rs.data.sh script


