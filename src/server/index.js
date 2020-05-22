// express
const express = require('express');

const app = express();

// built-in
const fs = require('fs');
const {MongoClient} = require('mongodb');
const path = require('path');

VIDEO_ARCHIVE_PATH = "collections/SB_VIDEO"

function getFileList(res) {
    const filelist = fs.readdirSync(VIDEO_ARCHIVE_PATH)
    var responseData = []

    filelist.forEach(element => {
        let fileName = element.split('.')[0]
        let ex = element.split('.')[1]
        if (ex === 'json') {
            responseData.push(fileName)
        }
    });

    res.send(responseData)
}

function getFile(req, res) {
    const file = JSON.parse(fs.readFileSync(path.join(VIDEO_ARCHIVE_PATH,req.query.name+'.json'), 'utf-8'))

    res.send(file)
}

app.get('/api/getFileList', (req, res) => getFileList(res));
app.get('/api/getFile', (req, res) => getFile(req, res));

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
