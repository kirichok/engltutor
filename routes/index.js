var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Hello Layout' });
});

var clients = [];

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 4000});
wss.on('connection', function(socket){
    var connection = socket;
    //var connection = socket.accept('', socket.origin);
    clients.push(connection);
    console.log('Connected ' + connection.upgradeReq.headers.origin);

    connection.on('message', function (message) {

        console.info(message);

        var data = JSON.parse(message);

        switch (data.header) {
            case 'message':
                sendMessageAllClients(message, false);
                break;
            case 'updateUsers':
                clients[clients.indexOf(connection)].chatUserName = data.user;
                updateUsersList();
                break;

        }

        console.log('Received: header-' + data.header + ', user-' + data.user + ', message-' + data.message);
    });
    connection.on('close', function (reasonCode, description) {
        console.log('Disconnected ' + connection.upgradeReq.headers.host);

        var clientId = clients.indexOf(connection);
        if (clientId != -1) {
            clients.splice(clientId, 1);
        }

        updateUsersList();
    });

    function updateUsersList() {
        var chatUsers = [];

        clients.forEach(function (client) {
            chatUsers.push(client.chatUserName);
        });

        data = {
            header: 'updateUsers',
            users: chatUsers
        };

        sendMessageAllClients(JSON.stringify(data), true);
    }

    function sendMessageAllClients(data, ignoreCurrent) {
        clients.forEach(function (client) {
            if (ignoreCurrent || connection !== client) {
                client.send(data);
            }
        });
    }
});

module.exports = router;
