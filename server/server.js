const { WebcastPushConnection } = require('tiktok-live-connector');
const { WebSocketServer } = require('ws');
const fs = require('fs'); 
const http = require('http');
const path = require('path');

const ws = new WebSocketServer({ port: 8081 });
var client = null;
var negeri = {};

const username = 'mrhery.official';

const live = new WebcastPushConnection(username);

live.connect().then(state => {
	console.info(`Connected to ${state.roomId}'s live`);
}).catch(err => {
	console.error('Fail connecting to LiveStream');
});

live.on('chat', data => {
	negeri[data.userId] = data.comment;
	
	sendData(data.comment);
	
	console.log(`${data.nickname}: ${data.comment}`);
});

live.on('like', data => {
	if(negeri[data.userId] != undefined){
		sendData(negeri[data.userId]);
	}
});

live.on('gift', data => {
	if(negeri[data.userId] != undefined){
		for(let i = 0; i < 10; i++){
			sendData(negeri[data.userId]);
		}
	}
    /*
	if (data.giftType === 1 && !data.repeatEnd) {
        // Streak in progress => show only temporary
        console.log(`${data.uniqueId} is sending gift ${data.giftName} x${data.repeatCount}`);
    } else {
        // Streak ended or non-streakable gift => process the gift with final repeat_count
        console.log(`${data.uniqueId} has sent gift ${data.giftName} x${data.repeatCount}`);
    }
	*/
})

http.createServer(function (req, res) {	
	let url = req.url.replace(/^\/+/, '');
	
	if(url.length < 1){
		url = "index.html";
	}
	
	const extname = String(path.extname(url)).toLowerCase();
	const mimeTypes = {
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.css': 'text/css',
		'.png': 'image/png',
		'.jpg': 'image/jpg',
		'.mp3': 'audio/mpeg'
	};
	
	const contentType = mimeTypes[extname] || 'application/octet-stream';
	
	fs.readFile(url, function(err, data) {
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.end('<h1>404 Not Found</h1>');
			return;
		}
		
		res.writeHead(200, {'Content-Type': contentType});
		res.end(data, 'utf-8');
	});
}).listen(8080); 

ws.on("connection", function(ws){
	console.log("client connected");
	client = ws;
});

async function sendData(data){
	if(client != null){
		console.log("sending data");
		client.send(data);
	}
}