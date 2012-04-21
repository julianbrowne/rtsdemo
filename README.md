

Simple Real-Time Stats Demo Using MongoDB, node.js and D3
=========================================================

Content from MongoDB Thames Valley User Group demo
April 2012. Includes:

- slides (keynote and PDF)
- script sources for set-up and for writer
- node.js server to stream MongoDB data
- web site with D3 charting

Installation
------------

- install MongoDB
- start mongod
- start mongo shell

	use rtsdemo

	db.createCollection("statstore", {capped: true, size: 5000000});

- start node.js server

	node server.js

- http and ws are bound to port 8010
- open browser (latest chrome or FF)

	http://localhost:8010

- write data to mongoDB, either manually or by running writer script.

