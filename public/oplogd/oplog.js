/**
 *
 *  This code copied, and generally degraded, from Mike Bostock's
 *  D3 example of an Indented Tree - http://bl.ocks.org/1093025
 *
 *  More excellence can be found at: https://github.com/mbostock
 *
**/

var w = 800;
var h = 1000;
var i = 0;
var barHeight = 40;
var barWidth = 760;
var duration = 400;
var data = {name: "MongoDB", children: []};

var tree = d3.layout.tree()
    .size([h, 100]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#output").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
        .attr("transform", "translate(20,30)");

data.x0 = 0;
data.y0 = 0;

update(data);

function update(source)
{

  var nodes = tree.nodes(data);
  
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });
  
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });
  
  var nodeEnter = node
    	.enter()
    	.append("svg:g")
    		.attr("class", "node")
    		.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
    		.style("opacity", 1e-6);

  nodeEnter.append("svg:rect")
      .attr("y", -barHeight / 2)
      .attr("height", barHeight)
      .attr("width", function(d){ return barWidth - d.y })
      .style("fill", color)
      .on("click", click);
  
  nodeEnter.append("svg:text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(getNodeLabel);
  
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);
  
  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
      .style("fill", color);
  
  node.exit()
      .transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6)
        .remove();
  
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });
  
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);
  
  link.transition()
      .duration(duration)
      .attr("d", diagonal);
  
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();
  
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click

function click(node)
{
  if (node.children)
    hideChildren(node);
  else
    showChildren(node);

  update(node);
}

function hideChildren(node)
{
  if(node.children)
  {
    node._children = node.children;
    node.children = null;
  }
}

function showChildren(node)
{
  if(node._children)
  {
    node.children = node._children;
    node._children = null;
  }
}

/**
 *  Computes a colour for nodes based on the
 *  value of the 'type' attribute.
 *  Basic MongoDB types catered for.
**/

function color(d)
{
  if(d.type)
  {
    switch(d.type)
    {
      case "db":
        return "#2A4A92";
      case "coll":
        return "#92732A";
      case "doc":
        return "#B7EBC1";
      case "key":
        return "#FFFFFF";
    }
  }

  return "#242A0C";
}

/**
 * Insert a mongo document into the data array
 * creates/updates db/coll as necessary
**/

function insertDocument(doc, namespace, data)
{
  var dbName   = parseNamespace(namespace).db;
  var collName = parseNamespace(namespace).coll;
  
  var db   = findDatabase(dbName, data);
  var coll = findCollection(collName, db);

  var docName = doc.name ? doc.name : doc._id;

  var newDoc = {name: docName, _id: doc._id, type: "doc", children: []};

  for(var field in doc)
    newDoc.children.push({name: field, type: "key", value: doc[field].toString()});

  //hideChildren(newDoc);

  childStore(coll).push(newDoc);

  console.log("insertDocument: adding document with id " + newDoc._id + "");

  update(data);
}

/**
 * Find and then update key/values for a
 * doc that's already in the data array
**/

function updateDocument(doc, namespace, data)
{
  var dbName   = parseNamespace(namespace).db;
  var collName = parseNamespace(namespace).coll;

  var db       = findDatabase(dbName, data);
  var coll     = findCollection(collName, db);
  var docEntry = findDocument(doc, coll);

  docEntry.updated = true;

  if(docEntry.children)
    docEntry.children  = [];
  else
    docEntry._children = [];

  for(var field in doc)
  {
      if(docEntry.children)
            docEntry.children.push({name: field, type: "key", value: doc[field].toString()});
      else
            docEntry._children.push({name: field, type: "key", value: doc[field].toString()});
  }

  console.log("updateDocument: modifying document with id " + docEntry._id + "");

  update(data);
}

/**
 * Remove a doc from the data array
**/

function deleteDocument(doc, namespace, data)
{
  var dbName   = parseNamespace(namespace).db;
  var collName = parseNamespace(namespace).coll;

  var db       = findDatabase(dbName, data);
  var coll     = findCollection(collName, db);
  var docEntry = findDocument(doc, coll);

  if(!docEntry)
    return;

  console.log("Deleting doc with id " + docEntry._id);

  var children = childStore(coll);
  var pos = children.indexOf(docEntry);

  children.splice(pos,1);

  update(data);
}

/**
 * Seek out the database parent key in the JSON
**/

function findDatabase(db, data)
{
  var dbEntry  = null;
  var children = childStore(data);

  for(var record in children)
  {
    if(children[record].name === db)
    {
      dbEntry = children[record];
      break;
    }
  }

  if(!dbEntry)
  {
    console.log("findDatabase: Inserting database " + db + " into data");
    var last = children.push({name: db, type: "db", children: []});
    dbEntry = children[last - 1];
    //hideChildren(dbEntry);
  }

  return dbEntry;
}

/**
 * Seek out the collection parent key in the JSON
**/

function findCollection(coll, db)
{
  var collEntry = null;

  for(var record in childStore(db))
  {
    if(childStore(db)[record].name === coll)
    {
      collEntry = childStore(db)[record];
      break;
    }
  }

  if(!collEntry)
  {
    console.log("findCollection: Inserting collection " + coll + " into data");
    var kids = childStore(db).push({name: coll, type: "coll", children: []});
    collEntry = childStore(db)[kids - 1];
    //hideChildren(collEntry);
  }

  return collEntry;
}

/**
 * Seek out a specific document in the collection JSON
**/

function findDocument(doc, coll)
{
  var docEntry = null;
  var children = childStore(coll);

  for(var record in children)
  {
    if(children[record]._id === doc._id)
    {
      docEntry = children[record];
      break;
    }
  }

  if(!docEntry)
    console.error("findDocument: couldn't find doc with id of " + doc._id);

  return docEntry;
}

function parseNamespace(namespace)
{
  var db   = namespace.substring(0,namespace.indexOf('.'));
  var coll = namespace.substring(namespace.indexOf('.') + 1);

  return {db: db, coll: coll};
}

/**
 * Find whether child entries are 'hidden' or not
**/

function childStore(obj)
{
  if(obj.children)
    return obj.children;
  else
    return obj._children;
}

/**
 * Label nodes in the vis with their json key/value
**/

function getNodeLabel(d)
{
  var label="";

  if(d.name)
    label += d.name + ": ";

  if(d.value)
    label += d.value;

  return label;
}
