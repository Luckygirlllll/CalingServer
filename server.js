url = require('url'),
    http = require('http'),
    os = require('os');

var interfaces = os.networkInterfaces()
var addresses = []
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2]
        if (address.family == 'IPv4' && !address.internal) {
            addresses.push(address.address)
        }
    }
}

var tempKey;
var tempJson;

var users = []
var usersCaling = [];
var jsonData = []
var databaseCaling = []
var calingContactList = []

http.createServer(function (req, res) {

    if (req.method == 'POST') {
        console.log('\nPOST');

        parseReq(req)
        sendResp(res)
    }

    if (req.method == 'GET') {

        console.log('\nGET');

        getCalingContacts(req, res);
    }

}).listen(8000, addresses[0]);

console.log('HTTP Server running at', addresses[0], ':8000');

function getCalingContacts(req, res) {

    var pathname = url.parse(req.url).pathname
    var pathArray = pathname.split("/")

    userNumber = pathArray[1];
    userStatus = pathArray[2];

    console.log("Запрос списка контактов Caling");
    console.log("Номер пользователя: " + pathArray[1]);

    synchronizationContacts(userNumber);

    var jsonResponce = JSON.stringify({
        calingBook: usersCaling[userNumber]
    })

    console.log("Отправка json ответа: " + jsonResponce);

    res.writeHead(200, {"Content-Type": "application/json"})
    res.end(jsonResponce);

}

function synchronizationContacts(userNumber) {

    var list_of_keys = [];
    var numbers = users[userNumber]; // list of local contacts for current user
    var list = []; // temp list for save founding contacts

    for (var key in numbers) {
        list_of_keys.push(numbers[key]);
    }

    console.log("_____________________________________")
    console.log("Поиск контактов в базе данных Caling...")

    for (var key in list_of_keys) {

        var index = databaseCaling.indexOf(list_of_keys[key])

        //Put founding contact to ContactCalingBook for this user, and set random status
        if (index != null && index >= 0) {
            console.log("-->> совпадение : " + databaseCaling[index]);

            list.push(databaseCaling[index]);
            usersCaling[userNumber] = list
        }
    }
    var contacts_list = usersCaling[userNumber];

    console.log("_____________________________________");
    console.log("Список контактов Caling usera: " + userNumber);

    for (var key in contacts_list) {
        console.log(key + "." + " номер: " + contacts_list[key]);
    }

    console.log("_____________________________________");

}

function parseReq(req) {

    var url_path = url.parse(req.url).pathname
    var body = '';

    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {

        jsonData = JSON.parse(body);

        // add user and him contacts to Caling user list
        for (var key in jsonData) {
            tempKey = key;
            tempJson = jsonData[key];

            //save user data
            users[key] = tempJson;

            // add user number to database of Caling users numbers
            databaseCaling.push(key);
            console.log("Регистрация пользователя ");

            console.log("Номер пользователя: " + key);
            console.log("Телефонная книга пользователя: " + users[key]);
        }
    });
}

function addNewUser(user) {
    for (key in user) {
        users[key] = user[key]
    }
}

function sendResp(res) {
    res.writeHead(200, {"Content-Type": "application/html"});
    res.end('User registered');
}


// Model ContactCaling
function ContactCaling(id_phone, contacts) {
    this.id_phone = id_phone
    this.contacts = contacts
}

//============================================WebSocket Server==========================================================


var Static = require('node-static');
var WebSocketServer = new require('ws');

// подключенные клиенты
var clients = {};
var port = 8080;
// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({port: port});

webSocketServer.on('connection', function(ws) {

    var id = Math.random();
    clients[id] = ws;
    console.log("новое соединение " + id);

    ws.on('message', function(message) {
        console.log('получено сообщение ' + message);

        for(var key in clients) {
            clients[key].send(message);
        }
    });

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        delete clients[id];
    });

});


// обычный сервер (статика) на порту 8080
//var fileServer = new Static.Server('.');
//http.createServer(function (req, res) {
//
//    fileServer.serve(req, res);
//
//}).listen(8080);

console.log("WebSocket Server running at port:"+ port);