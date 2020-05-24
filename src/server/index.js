// express
const express = require('express');

const app = express();

// built-in
const fs = require('fs');
const path = require('path');

// third-party
const {MongoClient} = require('mongodb');
const natural = require('natural')
const wdTokenizer = new natural.WordTokenizer();
const stcTokenizer = new natural.SentenceTokenizer();

app.use(express.json())

const DATABASE_NAME = "sensebe_dictionary"
const VIDEO_ARCHIVE_PATH = "collections/SB_VIDEO"
const VIDEO_COLLECTION = "SB_VIDEO"

const PASSWORD = fs.readFileSync("./pw.txt", "utf8")

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

function parseStc(req, res) {
    let token = stcTokenizer.tokenize(req.query.stc)
    res.json(token)
}

function tokenizeStc(req, res) {
    let token = wdTokenizer.tokenize(req.query.stc)
    res.json(token)
}

async function insert(req, res) {
    console.log('[insert!]')
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

    req.accepts('application/json');
    const query = req.body
    console.log(query)

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = undefined
        let link = query["link"]
        
        // SB_VIDEO ISNERT
        if (query['_id']) 
            result = await client.db(DATABASE_NAME).collection(VIDEO_COLLECTION).findOne({ _id: query['_id'] });
            
        if (result) {
            await replaceListing(client, query, VIDEO_COLLECTION)
            _id = query["_id"]
            delete query["_id"]
            console.log('[VIDEO_REPLACE_LISTING] _id : ',_id)
            fs.writeFileSync(path.join(VIDEO_ARCHIVE_PATH, _id+'.json'), JSON.stringify(query, null, "\t"), "utf-8")
        } else {
            fs.writeFileSync(path.join(VIDEO_ARCHIVE_PATH, link+'.json'), JSON.stringify(query, null, "\t"), "utf-8")
            if (query['_id'] === undefined)
                query['_id'] = link

            console.log('[VIDEO_CREATE_LISTING] _id : ', query['_id'])
            await createListing(client, query, VIDEO_COLLECTION)
        }

        // SB_WORD INSERT
        // let wordList = JSON.parse(fs.readFileSync(path.join(COL_INFO_PATH, WORD_LIST), "utf8"))
        // for (let i = 0; i < query['c'].length; ++i) {
        //     let stc = query['c'][i]['t']['stc']

        //     if (stc) {
        //         for (let j = 0; j < stc.length; ++j) {
        //             let wd = stc[j]['wd']

        //             if (wd) {
        //                 for (let k = 0; k < wd.length; ++k) {
        //                     let data = wd[k], ct = data['ct'], lt = data['lt'],
        //                         sp = 0
                                
        //                     let rt = undefined

        //                     if (data['rt']) {
        //                         rt = data['rt'].toLowerCase()
        //                     } else {
        //                         rt = data['ct'].toLowerCase()
        //                     }
                            
        //                     let hashId = rt.hashCode(),
        //                         listing = { 
        //                             _id: hashId, 
        //                             rt: rt,
        //                             links: [
        //                                 {
        //                                     ct: ct,
        //                                     lt: data['lt'], 
        //                                     link: link, 
        //                                     pos: {
        //                                         stc:j,
        //                                         wd:k
        //                                     }
        //                                 }
        //                             ]
        //                         }

        //                     result = await client.db(DATABASE_NAME).collection(WORD_COLLECTION).findOne(listing)

        //                     if (!result) {
        //                         await createListing(client, listing, WORD_COLLECTION)
        //                     } else {
        //                         await replaceListing(client, listing, WORD_COLLECTION)
        //                     }

        //                     if (!wordList[ct]) {
        //                         wordList[ct] = []
        //                         wordList[ct].push(lt)
        //                     } else {
        //                         let bool = true

        //                         for (let i in wordList[ct]) {
        //                             if (wordList[ct][i] === lt) {
        //                                 bool = false
        //                             }
        //                         }
                                
        //                         if (bool) {
        //                             wordList[ct].push(lt)
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        // fs.writeFileSync(path.join(__dirname, COL_INFO_PATH, WORD_LIST), JSON.stringify(wordList, null, "\t"), "utf-8")
        res.json({res:'complete'})
    } catch (e) {
        console.error(e)
        res.json({res:e})
    } finally {
        await client.close()
    }
}

app.post('/api/insert', (req, res) => insert(req, res));
app.get('/api/tokenizeStc', (req, res) => tokenizeStc(req, res));
app.get('/api/parseStc', (req, res) => parseStc(req, res));
app.get('/api/getFileList', (req, res) => getFileList(res));
app.get('/api/getFile', (req, res) => getFile(req, res));

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));

async function createListing(client, newListing, collection){
    const result = await client.db(DATABASE_NAME).collection(collection).insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}(${newListing['link']})`);
}

async function replaceListing(client, listing, collection) {
    result = await client.db(DATABASE_NAME).collection(collection).replaceOne({
        _id : listing['_id']
    }, 
    {
        $set: listing
    });
    
    // console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`_id : ${listing['_id']}, for "${listing["link"]}" replaced : matchedCount(${result.matchedCount}), modiefiedCount(${result.modifiedCount})`);
}