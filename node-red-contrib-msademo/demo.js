var {exec} = require('child_process');
module.exports = function(RED) {
    function demo(config) {
        RED.nodes.createNode(this,config);
        var node = this;
	this.groupby = config.groupby;
	this.sortby = config.sortby;
	this.consumer = config.consumer;
	this.queue = config.queue;

	node.on('input', function(msg) {
		console.log(this.groupby);
		console.log(this.sortby);
        if(this.groupby != ""){

	var commGroup = 'docker run -e VarForGroup=' + this.groupby;
        var commQueue = ' -e VarForQueue=' + this.queue;
        var commCons = ' ckary/' + this.consumer;
        var command = commGroup + commQueue  + commCons;


	}else if (this.sortby != ""){
	var commSort = 'docker run -e VarForSort=' + this.sortby;
	var commQueue = ' -e VarForQueue=' + this.queue;
	var commCons = ' ckary/' + this.consumer;
	var command = commSort + commQueue  + commCons;
	}

		console.log(command);
	exec(command, (error, stdout, stderr) => {
		    if (error) {
    	console.error(`exec error: ${error}`);
    	return;
    	}
    	console.log(`stdout: ${stdout}`);
 	   console.log(`stderr: ${stderr}`);
    	msg.payload = stdout;
	    //callback(msg);
		node.send(msg);
	});
        });
    }
    RED.nodes.registerType("public demo",demo);
}
