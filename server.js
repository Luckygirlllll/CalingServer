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

http.createServer(function (req, res){

    if (req.method == 'POST') {
        console.log('POST');

        parseReq(req)
        sendResp(res)
    }

    if (req.method == 'GET') {

        console.log('GET');

        getCalingContacts(req,res);
    }

}).listen(8000, addresses[0]);

console.log('Server running at', addresses[0], ':8000');

function getCalingContacts(req,res) {

    var pathname = url.parse(req.url).pathname
    var pathArray =  pathname.split("/")

    userNumber = pathArray[1];
    userStatus = pathArray[2];

    console.log("pathname NUMBER:" + pathArray[1] + " \npathname STATUS: " + pathArray[2]);

    syncLists(userNumber);

    var jsonResponce = JSON.stringify({
        calingBook:usersCaling[userNumber]
    })

    res.writeHead(200, {"Content-Type": "application/json"})
    res.end(jsonResponce);

}

function syncLists(userNumber) {

    var list_of_keys = [];
    var numbers = users[userNumber]
    var list = []

    for (var key in numbers) {
        list_of_keys.push(numbers[key]);
    }


    for(var key in list_of_keys){

        var index = databaseCaling.indexOf(list_of_keys[key])

        //Put founding contact to ContactCalingBook for this user, and set random status
        if (index != null && index >= 0) {
            console.log("-->> совпадение с базой Caling : " + databaseCaling[index]);

            list.push(databaseCaling[index])
            usersCaling[userNumber] = list
        }
    }
    var contacts_list = usersCaling[userNumber];

    console.log("Список контактов usera: "+ userNumber+" в Caling");

    for(var key in contacts_list){
        console.log("index: " + key + " номер:" + contacts_list[key]);
    }
}

function parseReq(req) {

    var url_path = url.parse(req.url).pathname
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
            users[key] = tempJson;

            // add user number to database of Caling users
            databaseCaling.push(key);
            console.log("Push to databaseCaling: " + key);

            console.log("key" + key  + " value: " + users[key]);
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
function ContactCaling( id_phone , contacts){
    this.id_phone = id_phone
    this.contacts = contacts
}
