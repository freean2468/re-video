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

var ffmpeg = require('fluent-ffmpeg');

app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({limit: '50mb'}));

const VIDEO_ARCHIVE_PATH = "collections/SB_VIDEO";

// custom
const Enum = require('./enum');
const ENUM = new Enum();
ENUM.initialize();


function getSnapshot(req, res) {
    const name = req.query.name.trim(), source = req.query.source.trim(), t = req.query.t.trim(), 
            size = req.query.size.trim();

    const mov = '.mov';
    let videoPath = '/Users/hoon-ilsong/Movies/ForYoutube/', imagePath = '';
    let videoFile = '', imageFile = '';

    if (t === '') {
        console.log('no t!');
        return res.send('no t');
    }

    switch(source) {
        case '0': // witcher3
            videoPath += 'Witcher3/';
            break;
        default:
            console.log("Source Error!!! : ",source);
            break;
    }

    imagePath = videoPath + 'ffmpeg';

    videoFile = videoPath + name + mov;
    imageFile = name + `_${t}.jpeg`;

    ffmpeg(videoFile)
        .on('end', function () {
            fs.readFile(imagePath+'/'+imageFile, function(err, data) {
                if (err) {
                    console.log(err.stack);
                    throw err // Fail if the file can't be read.
                }
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(data, 'binary') // Send the file data to the browser.

                fs.unlink(imagePath+'/'+imageFile, (err) => {
                    if (err) {
                      console.error(err)
                      return
                    }
                    //file removed
                })
            });

        })
        .on('error', function (err) {
            console.log('an error happened: ' + err.message);
            res.writeHead(404);
            res.end(err.message);
        })
        .screenshots({
            // count: 1,
            timestamps: [parseFloat(t)],
            filename: imageFile,
            folder: imagePath,
            size: size
        });
}

function getAudio(req, res) {
    const name = req.query.name, source = req.query.source;
    const mp3 = '.mp3';
    let path = '/Users/hoon-ilsong/Movies/ForYoutube/';
    let file = '';

    switch(source) {
        case '0': // witcher3
            path += 'Witcher3/'
            break;
    }

    file = path + name + mp3;

    // create read stream
    const readStream = fs.createReadStream(file);
    
    // This will wait until we know the readable stream is actually valid before piping
    readStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        readStream.pipe(res);
    });

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
        res.end(err);
    });
}

function getSourceList(res) {
    res.json(ENUM.SOURCE);
}

function getNav(res) {
    const folderList = fs.readdirSync(VIDEO_ARCHIVE_PATH);
    let responseData = {};

    folderList.forEach(folder => {
        if (folder === '.DS_Store') {
            return;
        }
        responseData[folder]=[];
        const fileList = fs.readdirSync(VIDEO_ARCHIVE_PATH+'/'+folder);
        fileList.forEach(elm => {
            const fileName = elm.substring(0, elm.lastIndexOf('.'));
            const ex = elm.substring(elm.lastIndexOf('.')+1, elm.length);
            if (ex === 'json') {
                responseData[folder].push(fileName);
            }
        })
    });

    Object.keys(responseData).map((folder) => 
        responseData[folder].sort(function (a, b) {
            // console.log(a.file);
            return a.localeCompare(b);
        })
    )

    console.log(responseData);

    res.send(responseData)
}

function getFile(req, res) {
    const query = req.query, folder = query.folder.trim(), fileName = query.fileName.trim();
    const file = JSON.parse(fs.readFileSync(path.join(VIDEO_ARCHIVE_PATH,folder,fileName+'.json'), 'utf-8'))

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

async function getCanvasType(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, source = query.source;

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.CANVAS).findOne({ _id: source });

        if (result) {
            delete result._id
            res.json(Object.keys(result));
        } else {
            throw new Error('not found according to the source('+source+')');
        }
    } catch (e) {
        console.error(e.stack);
        res.json([]);
    } finally {
        await client.close()
    }
}

async function getCanvasInfo(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, source = query.source, type = query.type;

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.CANVAS).findOne({ _id: source });

        if (result) {
            let item = result[type];

            if (!item) throw new Error('not found according to the type('+type+')');

            item['type'] = type;

            return res.json(item);
        } else {
            throw new Error('not found according to the source('+source+')');
        }
    } catch (e) {
        console.error(e.stack);
        res.json({});
    } finally {
        await client.close()
    }
}

async function getWdInfo(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, ct = query.ct;
    
    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.ENG_BASE).findOne({ _id: ct.hashCode() });

        if (result) {
            let list = [];

            for (let i = 0; i < result.wd_m.length; ++i) {
                const lt = result.wd_m[i].lt;

                list.push(lt)
            }

            res.json({res:list});
        } else {
            res.json({res:0})
        } 
    } catch (e) {
        console.error(e)
        res.json({res:e})
    } finally {
        await client.close()
    }
}

async function getStrtInfo(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, rt = query.rt;
    
    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.ENG_BASE).findOne({ _id: rt.hashCode() });
        let list = [];

        if (result) {
            for (let i = 0; i < result.strt_m.length; ++i) {
                const t = result.strt_m[i].t;

                list.push(t)
            }
        } 
        
        res.json({res:list});
    } catch (e) {
        console.error(e)
        res.json({res:[e]})
    } finally {
        await client.close()
    }
}

// async function deleteVideo(req, res) {
//     const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true });
//     const query = req.query, id = query.id.trim(), folder = query.folder;

//     try {
//         // Connect to the MongoDB cluster
//         await client.connect();

//         let result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.VIDEO).findOne({ _id: id });

//         if (result) {
//             result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.VIDEO).deleteOne({ _id: id });
//             if (result.result.n != 1) {
//                 throw new Error(result.result.n);
//             }
//             console.log(`[DeleteVideo] deleted video id(${id})`);
//             const now = Date().now();
//             fs.rename(path.join(VIDEO_ARCHIVE_PATH, folder, id+'.json'), 
//                     path.join(VIDEO_DELETED_PATH, folder, id+'_'+now+'.json'),
//                     function(err) {
//                         if (err) throw err
//                         console.log(path.join(VIDEO_ARCHIVE_PATH, folder, id+'.json')+' moved to '
//                         + path.join(VIDEO_DELETED_PATH, folder, id+'_'+now+'.json'))
//                     });
//         } else {
//             throw new Error('Something wrong');
//         }

//         res.json({res:`[DeleteVideo] Deleted(${result.result.n})`})
//     } catch (e) {
//         console.error(e.stack);
//         res.json({res:e});
//     } finally {
//         await client.close()
//     }
// }

async function deleteWdBase(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const query = req.query, 
        ct = query.ct.trim(), lt = query.lt.trim(), link = query.link.trim(),
        c = query.c.trim(), stc = query.stc.trim(), wd = query.wd.trim();

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        const result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.ENG_BASE).findOne({ 
            _id: ct.hashCode(),
            rt:ct,
            'wd_m.lt': lt
        });

        // console.log('lt : ', lt);
        // console.log('link : ', link);
        // console.log('pos : c('+c+') stc('+stc+') wd('+wd+')');

        if (result) {
            // console.log(result);
            for (let i = 0; i < result.wd_m.length; ++i) {
                if (result.wd_m[i].lt === lt) {
                    if (result.wd_m[i].lk.length <= 1) {
                        const test = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.ENG_BASE).updateOne({ 
                            _id: ct.hashCode(),
                            rt:ct,
                            'wd_m.lt': lt,
                            'wd_m.lk.vid':link,
                            'wd_m.lk.c':parseInt(c),
                            'wd_m.lk.stc':parseInt(stc),
                            'wd_m.lk.wd':parseInt(wd)
                        },
                        {
                            $pull:{
                                'wd_m' : {
                                    lt:lt
                                }
                            }
                        });

                        if (test.result.nModified !== 1)
                            throw new Error(test.result.nModified + ' has been modified');
                    } else {
                        for (let j = 0; j < result.wd_m[i].lk.length; ++j) {
                            if (result.wd_m[i].lk[j].link.trim() == link.trim() && result.wd_m[i].lk[j].pos.c == c
                                    && result.wd_m[i].lk[j].pos.stc == stc && result.wd_m[i].lk[j].pos.wd == wd) {
                                const test = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.ENG_BASE).updateOne({ 
                                    _id: ct.hashCode(),
                                    rt:ct,
                                    'wd_m.lt': lt,
                                    'wd_m.lk.vid':link,
                                    'wd_m.lk.c':parseInt(c),
                                    'wd_m.lk.stc':parseInt(stc),
                                    'wd_m.lk.wd':parseInt(wd)
                                },
                                {
                                    $pull:{
                                        'wd_m.$[].lk' : {
                                            vid: link , 
                                            c: parseInt(c),
                                            stc: parseInt(stc), 
                                            wd:parseInt(wd)
                                        }
                                    }
                                });

                                if (test.result.nModified !== 1)
                                    throw new Error(test.result.nModified + ' has been modified');
                                break;
                            }
                        }
                    }
                    res.json({res:'complete'});
                    break;   
                }
            }
        } else {
            console.log('None found from query');
        }
    } catch (e) {
        console.error(e.stack);
        res.json({res:e});
    } finally {
        await client.close()
    }
}

async function deleteStrtFromBase(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const query = req.query, rt = query.rt.trim(), t = query.t.trim(), link = query.link.trim(),
        c = query.c.trim(), stc = query.stc.trim();

        
    // what will happen if rt's array?
    console.log('[DeleteStrt] ', rt);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        const result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.ENG_BASE).findOne({ 
            _id: rt.hashCode(),
            rt:rt,
            'strt_m.t': t
        });

        if (result) {
            for (let i = 0; i < result.strt_m.length; ++i) {
                if (result.strt_m[i].t === t) {
                    if (result.strt_m[i].lk.length <= 1) {
                        const test = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.ENG_BASE).updateOne({ 
                            _id: rt.hashCode(),
                            rt:rt,
                            'strt_m.t': t,
                            'strt_m.lk.vid':link,
                            'strt_m.lk.c':parseInt(c),
                            'strt_m.lk.stc':parseInt(stc)
                        },
                        {
                            $pull:{
                                'strt_m' : {
                                    t:t
                                }
                            }
                        });

                        if (test.result.nModified !== 1)
                            throw new Error(test.result.nModified);
                    } else {
                        for (let j = 0; j < result.strt_m[i].lk.length; ++j) {
                            if (result.strt_m[i].lk[j].link == link && result.strt_m[i].lk[j].pos.c == c
                                    && result.strt_m[i].lk[j].pos.stc == stc) {
                                const test = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.ENG_BASE).updateOne({ 
                                    _id: rt.hashCode(),
                                    rt:rt,
                                    'strt_m.t': t,
                                    'strt_m.lk.vid':link,
                                    'strt_m.lk.c':parseInt(c),
                                    'strt_m.lk.stc':parseInt(stc)
                                },
                                {
                                    $pull:{
                                        'strt_m.$[].lk' : {
                                            'vid': link , 
                                            'c': parseInt(c), 
                                            'stc':parseInt(stc)
                                        }
                                    }
                                });

                                if (test.result.nModified !== 1)
                                    throw new Error(test.result.nModified);
                                break;
                            }
                        }
                        res.json({res:'complete'});
                        break;   
                    }
                }
            }
        } else {
            throw new Error('Something wrong');
        }
    } catch (e) {
        console.error(e.stack);
        res.json({res:e});
    } finally {
        await client.close()
    }
}

async function insert(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })

    req.accepts('application/json');
    const query = req.body, folder = req.query.folder, db = parseInt(req.query.db);

    db = ENUM.getDB(db);

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = undefined
        const _id = query.source+query.file;

        query['_id'] = _id;
        
        // SB_VIDEO ISNERT
        result = await client.db(db).collection(ENUM.COL.VIDEO).findOne({ _id: _id });
            
        if (result) {
            await replaceListing(client, query, ENUM.COL.VIDEO);
            console.log('[VIDEO_REPLACE_LISTING] _id : ',_id);
        } else {
            console.log('[VIDEO_CREATE_LISTING] _id : ', _id);
            await createListing(client, query, ENUM.COL.VIDEO);
        }

        delete query._id;
        fs.writeFileSync(path.join(VIDEO_ARCHIVE_PATH, folder, _id+'.json'), JSON.stringify(query, null, "\t"), "utf-8")

        // INSERT into SB_ENG_BASE  
        for (let i = 0; i < query['c'].length; ++i) {
            let stc = query['c'][i]['t']['stc']

            if (stc) {
                for (let j = 0; j < stc.length; ++j) {
                    let wd = stc[j]['wd'], strt = stc[j]['strt'];

                    if (wd) {
                        for (let k = 0; k < wd.length; ++k) {
                            const data = wd[k], ct = data['ct'].toLowerCase();
                            let rt = undefined;

                            if (data['rt']) rt = data['rt'].toLowerCase();
                            else rt = ct;
                            
                            // firstly, insert ct listing into base collection
                            const ctListing = { 
                                _id: ct.hashCode(), 
                                rt: ct,
                                wd_m: [{  
                                    lt: data['lt'],
                                    lk:[{
                                        vid:_id,
                                        date:new Date().toLocaleString(),
                                        c:i,
                                        stc:j,
                                        wd:k
                                    }]
                                }],
                                strt_m:[]
                            };
                            await insertWdIntoBase(client, db, ENUM.COL.ENG_BASE, ctListing, ct.hashCode());
                            await insertWdIntoList(client, db, ENUM.COL.ENG_LIST, ct);

                            // then rt
                            if (ct !== rt) {
                                const rtListing = { 
                                    _id: rt.hashCode(), 
                                    rt: rt,
                                    wd_m: [{  
                                        lt: data['lt'],
                                        lk:[{
                                            vid:_id,
                                            date:new Date().toLocaleString(),
                                            c:i,
                                            stc:j,
                                            wd:k
                                        }]
                                    }],
                                    strt_m:[]
                                };
                                await insertWdIntoBase(client, db, ENUM.COL.ENG_BASE, rtListing, rt.hashCode());
                                await insertWdIntoList(client, db, ENUM.COL.ENG_LIST, rt);
                            }
                        }
                    }

                    if (strt) {
                        for (let k = 0; k < strt.length; ++k) {
                            for (let l = 0; l < strt[k].rt.length; ++l) {
                                const rt = strt[k].rt[l],
                                    strt_m = {  
                                        t: strt[k].t,
                                        usg: strt[k].usg,
                                        lk:[{
                                            vid:_id,
                                            date:new Date().toLocaleString(),
                                            c:i,
                                            stc:j,
                                            strt:k,
                                        }]
                                    };

                                let result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne(
                                    { _id: rt.hashCode() }
                                );

                                if (result.strt_m.length === 0) {
                                    await insertStrt(client, db, strt_m, rt.hashCode());
                                } else {
                                    result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({
                                        _id: rt.hashCode(),
                                        'strt_m.t':strt_m.t,
                                        'strt_m.usg':strt_m.usg,
                                        'strt_m.lk.vid':strt_m.lk[0].vid,
                                        'strt_m.lk.c':strt_m.lk[0].c,
                                        'strt_m.lk.stc':strt_m.lk[0].stc,
                                        'strt_m.lk.strt':strt_m.lk[0].strt
                                    });

                                    if (result === null) {
                                        await insertStrt(client, db, strt_m, rt.hashCode());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // How to notice Product Server to update the WORD_LIST?
        // to re-video
        // fs.writeFileSync(LIST_OF_WORD, JSON.stringify(wordList, null, "\t"), "utf-8");
        // to re-sensebe
        // fs.writeFileSync(path.join('../re-sensebe', LIST_OF_WORD), JSON.stringify(wordList, null, "\t"), "utf-8");

        res.json({res:'complete'});
    } catch (e) {
        console.error(e.stack);
        res.json({res:e});
    } finally {
        await client.close()
    }
}

async function insertWdToPilot(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })

    req.accepts('application/json');
    const query = req.query, ct = query.ct, lt = query.lt, vid = query.link, db = query.db,
        c = parseInt(query.c), stc = parseInt(query.stc), wd = parseInt(query.wd);

    db = ENUM.getDB(db);

    console.log(ct);
    console.log(lt);
    console.log(vid);
    console.log(c);
    console.log(stc);
    console.log(wd);
    
    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = undefined

        // INSERT into SB_ENG_BASE  
        const ctListing = { 
            _id: ct.hashCode(), 
            rt: ct,
            wd_m: [{  
                lt: lt,
                lk:[{
                    vid:vid,
                    date:new Date().toLocaleString(),
                    c:c,
                    stc:stc,
                    wd:wd
                }]
            }],
            strt_m:[]
        };
        await insertWdIntoBase(client, db, ENUM.COL.ENG_BASE, ctListing, ct.hashCode());
        await insertWdIntoList(client, db, ENUM.COL.ENG_LIST, ct);

        res.json({res:'complete'});
    } catch (e) {
        console.error(e.stack);
        res.json({res:e});
    } finally {
        await client.close()
    }
}

async function addCanvasInfo(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, source = query.source, type = query.type;

    req.accepts('application/json');
    const body = req.body;

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.CANVAS).findOne({ _id: source });
        let o = {
            "ff" : body.ff,
            "fs" : body.fs,
            "pt" : body.pt,
            "pl" : body.pl,
            "pr" : body.pr
        }

        if (result) {
            result[type] = o;
            await replaceListing(client, result, ENUM.COL.CANVAS);
            delete result._id;
            res.json(Object.keys(result));
        } else {
            let json = {
                _id : source,
            }
            json[type] = o
            await createListing(client, json, ENUM.COL.CANVAS);
            delete result._id;
            res.json([`${type}`]);
        }
    } catch (e) {
        console.error(e)
        res.json([])
    } finally {
        await client.close()
    }
}

// DB Transaction
app.post('/api/insert', (req, res) => insert(req, res));
app.post('/api/addCanvasInfo', (req, res) => addCanvasInfo(req, res));

app.get('/api/getCanvasType', (req, res) => getCanvasType(req, res));
app.get('/api/getCanvasInfo', (req, res) => getCanvasInfo(req, res));
app.get('/api/getWdInfo', (req, res) => getWdInfo(req, res));
app.get('/api/getStrtInfo', (req, res) => getStrtInfo(req, res));
// app.get('/api/deleteVideo', (req, res) => deleteVideo(req, res));

app.get('/api/insertWdToPilot', (req, res) => insertWdToPilot(req, res));
app.get('/api/deleteWdBase', (req, res) => deleteWdBase(req, res));
app.get('/api/deleteStrtFromBase', (req, res) => deleteStrtFromBase(req, res));

// NLPK
app.get('/api/tokenizeStc', (req, res) => tokenizeStc(req, res));
app.get('/api/parseStc', (req, res) => parseStc(req, res));

// File
app.get('/api/getSnapshot', (req, res) => getSnapshot(req, res));
app.get('/api/getAudio', (req, res) => getAudio(req, res));
app.get('/api/getNav', (req, res) => getNav(res));
app.get('/api/getFile', (req, res) => getFile(req, res));
app.get('/api/getSourceList', (req, res) => getSourceList(res));

app.listen(process.env.PORT || 8080, () => {
    console.log(`Listening on port ${process.env.PORT || 8080}!`);
});




// Functions

async function createListing(client, newListing, collection){
    const result = await client.db(ENUM.DB.PRODUCT).collection(collection).insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}(${newListing.rt})`);
};

async function replaceListing(client, listing, collection) {
    result = await client.db(ENUM.DB.PRODUCT).collection(collection).replaceOne({
        _id : listing['_id']
    }, 
    {
        $set: listing
    });
    
    // console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`_id : ${listing['_id']}, for "${listing["link"]}" replaced : matchedCount(${result.matchedCount}), modiefiedCount(${result.modifiedCount})`);
};

async function insertWdIntoBase(client, db, col, listing, hashId) {
    let result = await client.db(db).collection(col).findOne({_id:hashId});

    if (result === null) {
        await createListing(client, listing, col);
    } else {
        let second = await client.db(db).collection(col).findOne({
            _id:listing._id,
            rt:listing.rt,
            'wd_m.lt': listing.wd_m[0].lt
        });

        if (second === null) {
            let third = await client.db(db).collection(col).findOne({
                _id:listing._id,
                rt:listing.rt,
                'wd_m.lt': listing.wd_m[0].lt,
                'wd_m.lk.vid': listing.wd_m[0].lk[0].vid,
                'wd_m.lk.c': listing.wd_m[0].lk[0].c,
                'wd_m.lk.stc': listing.wd_m[0].lk[0].stc,
                'wd_m.lk.wd': listing.wd_m[0].lk[0].wd
            });

            if (third === null) {
                const wd_m = listing.wd_m[0], lk=wd_m.lk[0];
                if (result.wd_m.length === 0) {
                    const test = await client.db(db).collection(col).updateOne(
                        { _id: result._id },
                        { $push: { 'wd_m': wd_m } }
                    );
                    if (test.result.nModified !== 1) {
                        throw new Error(test.result.nModified)
                    }
                } else {
                    let isExist = false;
                    for (let l = 0; l < result.wd_m.length; ++l) {
                        if (result.wd_m[l].lt === wd_m.lt) {
                            const test = await client.db(db).collection(col).updateOne(
                                { _id: result._id, 'wd_m.lt':wd_m.lt },
                                { $push:{ 'wd_m.$.lk': lk } }
                            );
                            if (test.result.nModified !== 1) {
                                throw new Error(test.result.nModified)
                            }
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist) {
                        const test = await client.db(db).collection(col).updateOne(
                            { _id: result._id },
                            { $push: { 'wd_m': wd_m } }
                        );
                        if (test.result.nModified !== 1) {
                            throw new Error(test.result.nModified)
                        }
                    }
                }
            }
        }
    }
};

async function insertWdIntoList(client, db, col, wd) {
    if (ENUM.WORD[wd] === undefined) {
        let result = await client.db(db).collection(col).insertOne({_id:wd, hash:wd.hashCode()});
        await ENUM.updateWord();
        console.log(result);
    }
};

async function insertStrt(client, db, strt, id) {
    const result = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne(
        { _id: id },
        { $push: { 'strt_m': strt } }
    );
    if (result.result.nModified !== 1) {
        throw new Error(result.result.nModified)
    }
};

Object.defineProperty(String.prototype, 'hashCode', {
    value: function() {
            var hash = 0, i, chr;
            for (i = 0; i < this.length; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
});