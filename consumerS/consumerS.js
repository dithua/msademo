var amqp = require('amqplib/callback_api');
var fs = require('fs');
var jarray= [];
var myarray= [];

var jsonattr = process.env.VarForSort;
var envqueueC = process.env.VarForQueueC;
var envqueueP = process.env.VarForQueueP;

function modifyJ(msg){

  var jarray = JSON.parse(msg.content.toString());
  jarray.forEach(function (arr) {
    arr.items.sort((a, b) => (a[jsonattr] > b[jsonattr]) ? 1 : -1)
  });
  jarray = JSON.stringify(jarray);
  return jarray
}


amqp.connect('amqp://visitor:visitor@192.168.1.5/', function(error0, connection) {
  if (error0) {
    throw error0;
    }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertExchange('groupedex2','direct', {
      durable: false
    });

      channel.bindQueue(envqueueC,'groupedex2','first');
      channel.prefetch(1);
      channel.consume(envqueueC,function (ms){

      console.log("[x] sould have received array from grouped:\n",ms.content.toString( ));

      myarray =modifyJ(ms);
      console.log("[x] now you see the modified array",myarray);
    //  fs.writeFile('sortedArray.json',myarray,'utf-8');

      var msg = myarray;
      channel.assertExchange('sortedex','direct', {
        durable: false
      });
      channel.assertQueue(envqueueP, {
        exclusive: false
      }, function(error2, q) {
        if (error2) {
          throw error2;
        }

      channel.bindQueue(envqueueP,'sortedex','third');

      channel.publish('sortedex','third',Buffer.from(msg));
      console.log("\n\n[x] Sending my array")

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
