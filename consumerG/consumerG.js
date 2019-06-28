var amqp = require('amqplib/callback_api');
//var fs = require('fs');
var jarray= [];

var jsonattr = process.env.VarForGroup;
var envqueueC = process.env.VarForQueueC;
var envqueueP = process.env.VarForQueueP;

function modifyJ(msg){


	var jarray = JSON.parse(msg.content.toString());
        jarray = groupBy(jsonattr,jarray);
        jarray = JSON.stringify(jarray);
	return jarray
}

function groupBy(key, array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    var added = false;
    for (var j = 0; j < result.length; j++) {
      if (result[j][key] == array[i][key]) {
        result[j].items.push(array[i]);
        added = true;
        break;
      }
    }
    if (!added) {
      var entry = {items: [] };
      entry[key] = array[i][key];
      entry.items.push(array[i]);
      result.push(entry);
    }
  }
  return result;
}

var myarray = [];

amqp.connect('amqp://visitor:visitor@192.168.1.5/', function(error0, connection) {
  if (error0) {
    throw error0;
    }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertExchange('originalex2','direct', {
      durable: false
    });

      channel.bindQueue(envqueueC,'originalex2','first');
      channel.prefetch(1);
      channel.consume(envqueueC,function (msg){

      console.log("[x] sould have received array from original:\n",msg.content.toString( ));

      myarray = modifyJ(msg);
      console.log("[x] now you see the modified array",myarray);
    //  fs.writeFileSync('groupedArray.json',myarray,'utf-8');

			var msg = myarray;
	    channel.assertExchange('groupedex','direct', {
	      durable: false
	    });
	    channel.assertQueue(envqueueP, {
	      exclusive: false
	    }, function(error2, q) {
	      if (error2) {
	        throw error2;
	      }

	    channel.bindQueue(envqueueP,'groupedex','second');
	    channel.publish('groupedex','second',Buffer.from(msg));
	    console.log("\n\n[x] Sending my array");

      },{
        noAck:true
      });

			setTimeout(function() {

	            connection.close();
	            process.exit(0)
	          }, 500);
	        });
  });//createChannel
});
