var oChatClient = null;

var ChatClient = function () {
    this.name = null;
    this.socket = null;

    this.$ = {
        login: {
            input: $('#login'),
            container: $('#container-login')
        },
        chat: {
            input: $('#msg'),
            list: $('#chat-list'),
            container: $('#container-chat')
        },
        users: {
            list: $('#listUsers')
        }
    };
};

ChatClient.prototype.init = function () {
    var self = this;
    self.name = new Date().getTime().toString() + ':';
    self.$.chat.container.hide();

    this.$.chat.input.on('keydown', function (e) {
        if (e.keyCode === 13) {
            var data = {
                header: 'message',
                message: $(this).val(),
                user: self.name
            };

            $(this).val('');

            self.writeMessage(data);

            self.socket.send(JSON.stringify(data));
        }
    });

    this.$.login.input.on('keydown', function (e) {
        if (e.keyCode === 13) {
            self.name += $(this).val();
            self.viewChat();
            self.socket.send(JSON.stringify({
                header: 'updateUsers',
                user: self.name
            }));
        }
    });
};

ChatClient.prototype.viewChat = function () {
    this.$.chat.container.show();
    this.$.login.container.hide();

    this.writeMessage('Hello ' + this.name.split(':')[1]);
    this.$.chat.input.focus();
};

ChatClient.prototype.writeMessage = function (data) {
    var line = '<blockquote><dl class="dl-horizontal">';

    if (typeof data == 'string') {
        line += '<dt></dt><dd>' + data + '</dd>';
    } else {
        line += '<dt>' + data.user.split(':')[1] + '</dt><dd>' + data.message + '</dd>';
    }

    line += '</dl></blockquote>';

    this.$.chat.container.append(line);
};

ChatClient.prototype.createConnection = function (reconnect) {
    var self = this;

    console.log('Try to connect');

    self.socket = new WebSocket('ws://' + window.location.hostname + ':4000/ws');

    self.socket.onopen = function () {
        console.log('connected');
    };

    self.socket.onclose = function () {
        console.log('closed');
        self.socket = null;
        setTimeout(function () {
            self.createConnection(true);
        }, 2000);
    };

    self.socket.onmessage = function (event) {
        var data = JSON.parse(event.data);

        switch (data.header) {
            case 'message':
                self.writeMessage(data);
                break;
            case 'updateUsers':
                var users = '';
                self.$.users.list.empty();
                data.users.forEach(function (user) {
                    users += '<li id="' + user + '">' + user.split(':')[1] + '</li>'
                });
                self.$.users.list.append(users);
                break;
        }
    };
};

initChat();

function initChat() {
    oChatClient = new ChatClient();
    oChatClient.init();
    oChatClient.createConnection(false);
}
