//
//
//=================================================HTTP Server==========================================================


//url = require('url'),
//    http = require('http');
//    os = require('os');
//
//var interfaces = os.networkInterfaces();
//var addresses = []
//for (var k in interfaces) {
//    for (var k2 in interfaces[k]) {
//        var address = interfaces[k][k2];
//        if (address.family == 'IPv4' && !address.internal) {
//            addresses.push(address.address)
//        }
//    }
//}
//
//var tempKey;
//var tempJson;
//
//var users = [];
//var usersCaling = [];
//var jsonData = [];
//var databaseCaling = [];
//var calingContactList = [];
//
//http.createServer(function (req, res) {
//
//    if (req.method == 'POST') {
//        console.log('\nPOST');
//
//        parseReq(req)
//        sendResp(res)
//    }
//
//    if (req.method == 'GET') {
//
//        console.log('\nGET');
//
//        getCalingContacts(req, res);
//    }
//
//}).listen(8000, addresses[0]);
//
//console.log('HTTP Server running at', addresses[0], ':8000');
//
//function getCalingContacts(req, res) {
//
//    var pathname = url.parse(req.url).pathname
//    var pathArray = pathname.split("/")
//
//    userNumber = pathArray[1];
//    userStatus = pathArray[2];
//
//    console.log("Запрос списка контактов Caling");
//    console.log("Номер пользователя: " + pathArray[1]);
//
//    synchronizationContacts(userNumber);
//
//    var jsonResponce = JSON.stringify({
//        calingBook: usersCaling[userNumber]
//    })
//
//    console.log("Отправка json ответа: " + jsonResponce);
//
//    res.writeHead(200, {"Content-Type": "application/json"})
//    res.end(jsonResponce);
//
//}
//
//function synchronizationContacts(userNumber) {
//
//    var list_of_keys = [];
//    var numbers = users[userNumber]; // list of local contacts for current user
//    var list = []; // temp list for save founding contacts
//
//    for (var key in numbers) {
//        list_of_keys.push(numbers[key]);
//    }
//
//    console.log("_____________________________________")
//    console.log("Поиск контактов в базе данных Caling...")
//
//    for (var key in list_of_keys) {
//
//        var index = databaseCaling.indexOf(list_of_keys[key])
//
//        //Put founding contact to ContactCalingBook for this user, and set random status
//        if (index != null && index >= 0) {
//            console.log("-->> совпадение : " + databaseCaling[index]);
//
//            list.push(databaseCaling[index]);
//            usersCaling[userNumber] = list
//        }
//    }
//    var contacts_list = usersCaling[userNumber];
//
//    console.log("_____________________________________");
//    console.log("Список контактов Caling usera: " + userNumber);
//
//    for (var key in contacts_list) {
//        console.log(key + "." + " номер: " + contacts_list[key]);
//    }
//
//    console.log("_____________________________________");
//
//}
//
//function parseReq(req) {
//
//    var url_path = url.parse(req.url).pathname
//    var body = '';
//
//    req.on('data', function (data) {
//        body += data;
//    });
//    req.on('end', function () {
//
//        jsonData = JSON.parse(body);
//
//        // add user and him contacts to Caling user list
//        for (var key in jsonData) {
//            tempKey = key;
//            tempJson = jsonData[key];
//
//            //save user data
//            users[key] = tempJson;
//
//            // add user number to database of Caling users numbers
//            databaseCaling.push(key);
//            console.log("Регистрация пользователя ");
//
//            console.log("Номер пользователя: " + key);
//            console.log("Телефонная книга пользователя: " + users[key]);
//        }
//    });
//}
//
//function addNewUser(user) {
//    for (key in user) {
//        users[key] = user[key]
//    }
//}
//
//function sendResp(res) {
//    res.writeHead(200, {"Content-Type": "application/html"});
//    res.end('User registered');
//}


//============================================WebSocket Server==========================================================

//var Static = require('node-static');
//var WebSocketServer = new require('ws');
//
//// подключенные клиенты
//var clients = {};
//var port = 8080;
//
//// WebSocket-сервер на порту 8081
//var webSocketServer = new WebSocketServer.Server({port: port});
//
//webSocketServer.on('connection', function (ws) {
//
//    console.log("WebSocketServer.on")
//
//    var id = Math.random();
//    clients[id] = ws;
//    console.log("новое соединение " + id);
//
//    ws.on('message', function (message) {
//        console.log('получено сообщение ' + message);
//
//        //var jsonString = JSON.parse(message);
//
//        for (var key in clients) {
//            clients[key].send(message);
//        }
//    });
//
//    ws.on('close', function () {
//        console.log('соединение закрыто ' + id);
//        delete clients[id];
//    });
//
//});
//
//console.log("WebSocket Server running at port:" + port);


url = require('url');
    http = require('http');
    os = require('os');

WebSocketServer = new require('ws');


var interfaces = os.networkInterfaces()
var addresses = []
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family == 'IPv4' && !address.internal) {
            addresses.push(address.address)
        }
    }
}

var tempKey;
var tempJson;

var users = [];
var usersCaling = [];
var jsonData = [];
var databaseCaling = [];
var calingContactList = [];
var socketClients = [];

var webSocketServer = new WebSocketServer.Server({port: 8080});

webSocketServer.on('connection', function(ws) {

    var key = 0;

    ws.on('message', function(message) {

        console.log("\nWEB_SOCKET MESSAGE");

        var data = JSON.parse(message);

        for (var message_tag in data){
            switch (message_tag){

                case "user_calling":
                    callRegistration(message);
                    break;

                case "update_status":
                    sendUpdateMOCK(message, ws);
                    break;
            }
        }

    });

    ws.on('close', function() {
        //console.log('соедниение закрыто', key)
        //sendUpdate(key,'0')
        delete socketClients[key]
    })
});

/**Method for registration users calling
 * as parameter accept JSON string
 * {"user_calling" : [ {"from":"numberFrom"} , {"to":"numberTo" }]}
 *
 * @param message
 */
function callRegistration(message){

    var fromUserNumber;
    var toUserNumber;

    var data = JSON.parse(message);

    for (var message_tag in data){

        for (var object in data[message_tag]){

            for (var key in data[message_tag][object]){

                switch (key){
                    case "from":
                        fromUserNumber = data[message_tag][object][key];
                        break;
                    case "to":
                        toUserNumber = data[message_tag][object][key];
                        break;
                }
            }
        }
    }

    console.log("\nOutcoming call \nfrom user: " + fromUserNumber + " to user: " + toUserNumber);
}


/**Method for update users status
 * as parameter accept JSON string {"update_status" : { "user_number" : "user_status" }}
 * and websocket client.
 *
 * Response json  {"phone":"+380932...","status":1}
 *
 * @param jsonString
 * @param websocket
 */
function sendUpdateMOCK(jsonString, websocket){

    var user_number;
    var user_status;
    var list = [];

    var data = JSON.parse(jsonString);

    for (var tag in data){
        for (var key in data[tag]){
            user_number = key;
            user_status = data[tag][key];
        }
    }

    socketClients[user_number] = websocket;

    for (var num in socketClients) {
        list.push(num)
    }


    for (var user in usersCaling) {

        var userBook = usersCaling[user];

        if (userBook.indexOf(user) > -1 && list.indexOf(user) > -1) {
            var json = JSON.stringify(new ContactCaling(user_number, user_status));
            socketClients[user].send(json);
            console.log(json)
            console.log('-->>' , user_number , " статус: " ,user_status);
        }
    }

    console.log("\nUpdate user status \nnumber: " + user_number + " status: " + user_status);
}

function sendUpdate(number,status){
    console.log("Обновление статусов контактов пользователя");
    var str = number + ";" + status;
    var list = [];
    for (var num in socketClients) {
        list.push(num)
    }
    console.log(list);
    console.log('Статусы обновлены:');
    for (var user in usersCaling) {
        var userBook = usersCaling[user];

        if (userBook.indexOf(number) > -1 && list.indexOf(user) > -1) {
            socketClients[user].send(str);
            console.log('-->>' , number , " статус: " ,status);
        }
    }
    console.log('________________________________');
}



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

console.log('Server running at', addresses[0], ':8000');

function getCalingContacts(req, res) {

    var pathname = url.parse(req.url).pathname;
    var pathArray = pathname.split("/");

    userNumber = pathArray[1];
    userStatus = pathArray[2];

    console.log("Запрос списка контактов Caling");
    console.log("Номер пользователя: " + pathArray[1]);

    synchronizeContactBooks(userNumber); // synchronize user contacts with Caling users

    var jsonResponce = JSON.stringify({
        calingBook : usersCaling[userNumber]
    });

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(jsonResponce);

}

function synchronizeContactBooks(userNumber) {

    var list_of_keys = [];
    var numbers = users[userNumber];
    var list = [];

    for (var key in numbers) {
        list_of_keys.push(numbers[key]);
    }
//
//    console.log("_____________________________________")
//    console.log("Поиск контактов в базе данных Caling...")

    for (var key in list_of_keys) {

        var index = databaseCaling.indexOf(list_of_keys[key]);

        //Put founding contact to ContactCalingBook for this user, and set random status
        if (index != null && index >= 0) {
//            console.log("-->> совпадение : " + databaseCaling[index]);

            list.push(databaseCaling[index]);
            usersCaling[userNumber] = list;
        }
    }
    var contacts_list = usersCaling[userNumber];

//    console.log("_____________________________________")
//    console.log("Список контактов Caling usera: " + userNumber );

    for (var key in contacts_list) {
//        console.log(key + "." + " номер: " + contacts_list[key]);
    }
}

function parseReq(req) {

    var url_path = url.parse(req.url).pathname;
    var body = '';

    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {

        jsonData = JSON.parse(body);

        // add user and him contacts  to Caling user list
        for (var key in jsonData) {
            tempKey = key;
            tempJson = jsonData[key];

            //save user data
            users[key] = tempJson;

            // add user number to database of Caling users
            databaseCaling.push(key);
            console.log("Регистрация пользователя: ");

            console.log("Номер пользователя: " + key);
//           console.log("Телефонная книга пользователя: " + users[key]);
        }
    });
}

function addNewUser(user) {
    for (key in user) {
        users[key] = user[key];
    }
}

function sendResp(res) {
    res.writeHead(200, {"Content-Type": "application/html"});
    res.end('User registered');
}


// Model ContactCaling
function ContactCaling(phone, status) {
    this.phone = phone;
    this.status = status;
}


