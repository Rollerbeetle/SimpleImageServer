var express = require('express');
var http = require('http');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var shortid = require('shortid');
var path = require('path');


var app = express();

var port = process.env.PORT || 3000;
const ENCODING = 'utf8';



app.get('/', (req, res) => {
    res.send(
        '<form action="/upload" enctype="multipart/form-data" method="post">' +
        '<input type="text" name="id" placeholder="id"><br>' +
        '<input type="text" name="desc" placeholder="desc"><br>' +
        '<input type="text" name="location" placeholder="location"><br>' +
        '<input type="text" name="userid" placeholder="userid"><br>' +
        '<input type="text" name="timestamp" placeholder="timestamp"><br>' +
        '<input type="text" name="tags" placeholder="tags"><br>' +
        '<input type="file" name="upload" ><br>' +
        '<input type="submit" value="Upload">' +
        '</form>'
    );
});

app.use('/data', express.static(__dirname + '/data'));

app.get('/data/:id/', (req, res) => {
    var id = req.params.id;
    var folder = './data/' + id + '/';
    var files = fs.readdirSync(folder)
    res.set('Content-Type', 'application/json')

    for (var i in files) {
        if (path.extname(files[i]) === ".json") {

            res.status(200).write(fs.readFileSync(folder + files[i]));
        }
    }
    res.end();
});


app.post('/upload', (req, res) => {
    var form = new formidable.IncomingForm();
    var content = new Object();
    var tmpDirPath = './data/tmp/';
    if (!(fs.existsSync(tmpDirPath))) {
        fs.mkdirSync(tmpDirPath);
    }
    var dirname = shortid.generate();
    var dirpath = './data/' + dirname + '/';
    fs.mkdirSync(dirpath);

    form.uploadDir = tmpDirPath;
    form.keepExtensions = true;



    form.parse(req, (err, fields, files) => {

        res.writeHead(200, {
            'content-type': 'application/json'
        });
        var folderid = {
          id : dirname
        }
        res.write(JSON.stringify(folderid));
        res.end();
    });

    form.on('error', function(err) {
        console.error(err);
    });

    form.on('field', function(name, value) {
        content[name] = value;
        console.log(name + ': ' + value);
    });

    form.on('file', function(name, file) {
        fs.renameSync(file.path, dirpath + file.name);
        content.image = file.name;
        file.path = dirpath;
    });

    form.on('end', function() {
        fs.writeFileSync(dirpath + 'index.json', JSON.stringify(content));
    })
});

var server = http.createServer(app).listen(port);
var address = server.address();
console.log('listening on host: ' + address.address + ' port: ' + address.port + ' using: ' + address.family);
