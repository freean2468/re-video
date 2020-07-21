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
    const name = req.query.name.trim(), t = req.query.t.trim(), size = req.query.size.trim(),
        source = req.query.source.trim();

    const mov = '.mov';
    let videoPath = '/Users/hoon-ilsong/Movies/ForYoutube/', imagePath = '';
    let videoFile = '', imageFile = '';

    try {
        if (t === '') {
            console.log('no t!');
            return res.send('no t');
        }

        if (!ENUM.verifySource(source)) throw new Error("Source : ",source);

        videoPath += `${source}/`;

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
                console.log("[getSnapshot] Error : " + err.message);
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
    } catch (e) {
        console.error(e.stack);
        res.end(null);
    }
}

function getAudio(req, res) {
    const name = req.query.name, source = req.query.source;

    const mp3 = '.mp3';
    let path = '/Users/hoon-ilsong/Movies/ForYoutube/';
    let file = '';

    try {
        if (!ENUM.verifySource(source)) throw new Error("source : ",source);

        path += `${source}/`;

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
    } catch (e) {
        console.error(e.stack);
        res.end(null);
    }
}

function getSourceList(res) {
    res.json(ENUM.SOURCE);
}

function getDBList(res) {
    res.json(ENUM.DB);
}

async function getNav(res) {
    const folderList = fs.readdirSync(VIDEO_ARCHIVE_PATH);
    let responseData = {};

    // add fileList (this will be removed not so long from now)
    let fileTree = {};

    folderList.forEach(folder => {
        if (folder === '.DS_Store') {
            return;
        }
        fileTree[folder]=[];
        const fileList = fs.readdirSync(VIDEO_ARCHIVE_PATH+'/'+folder);
        fileList.forEach(elm => {
            const fileName = elm.substring(0, elm.lastIndexOf('.'));
            const ex = elm.substring(elm.lastIndexOf('.')+1, elm.length);
            if (ex === 'json') {
                fileTree[folder].push(fileName);
            }
        });
    });

    Object.keys(fileTree).map((folder) => 
        fileTree[folder].sort(function (a, b) {
            // console.log(a.file);
            return a.localeCompare(b);
        })
    );

    responseData['file'] = fileTree;

    // add pilot list
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Connect to the MongoDB cluster
    try {
        await client.connect();

        await client.db(ENUM.DB.PILOT).collection(ENUM.COL.VIDEO).find({}).toArray().then(async (result) => {
            let pilotTree = {};

            for (let i in result) {
                const split = result[i]._id.split('#');
                if (pilotTree[split[0]] === undefined) {
                    pilotTree[split[0]] = [];
                }

                pilotTree[split[0]].push('#'+split[1]);
            }

            responseData[ENUM.DB.PILOT] = pilotTree;

            await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.VIDEO).find({}).toArray().then(async (result) => {
                let productTree = {};

                for (let i in result) {
                    const split = result[i]._id.split('#');
                    if (productTree[split[0]] === undefined) {
                        productTree[split[0]] = [];
                    }

                    productTree[split[0]].push('#'+split[1]);
                }

                responseData[ENUM.DB.PRODUCT] = productTree;

                return res.send(responseData);
            });
        });
    } catch (e) {
        console.error(e.stack)
        res.json({res:e})
    } finally {
        await client.close()
    }
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

async function getVideo(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, _id = query.id, db = query.db;

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(db).collection(ENUM.COL.VIDEO).findOne({ _id: _id });

        if (result) {
            delete result._id
            res.json(result);
        } else {
            throw new Error('none found according to the id('+_id+')');
        }
    } catch (e) {
        console.error(e.stack);
        res.end(null);
    } finally {
        await client.close()
    }
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
            throw new Error('[getCanvasType] not found according to the source('+source+')');
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

async function deleteWd(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const query = req.query, 
        ct = query.ct.trim(), lt = query.lt.trim(), vid = query.vid.trim(), db = query.db,
        c = query.c.trim(), stc = query.stc.trim(), wd = query.wd.trim();

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        let result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({ 
            _id: ct.hashCode(),
            rt:ct,
            'wd_m.lt': lt
        });
    
        if (result) {
            for (let i = 0; i < result.wd_m.length; ++i) {
                if (result.wd_m[i].lt === lt) {
                    if (result.wd_m[i].lk.length <= 1) {
                        result = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne({ 
                            _id: ct.hashCode(),
                            rt:ct,
                            'wd_m.lt': lt,
                            'wd_m.lk.vid':vid,
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
    
                        if (result.result.nModified !== 1) {
                            throw new Error(result.result.nModified + ' has been modified (expected:1)');
                        } else {
                            result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({ 
                                _id: ct.hashCode(),
                                rt:ct
                            });
    
                            if (result.wd_m.length === 0 && result.strt_m.length === 0) {
                                if (ENUM.DB.PRODUCT === ENUM.getDBByKey(db)) {
                                    notifyProductToUpdateWordList();
                                }
    
                                await client.db(db).collection(ENUM.COL.ENG_BASE).deleteOne({ 
                                    _id: ct.hashCode(),
                                    rt:ct
                                });
    
                                await client.db(db).collection(ENUM.COL.ENG_LIST).deleteOne({ 
                                    _id: ct,
                                    hash:ct.hashCode()
                                });
                            }
                        }
                    } else {
                        for (let j = 0; j < result.wd_m[i].lk.length; ++j) {
                            if (result.wd_m[i].lk[j].vid == vid.trim() && result.wd_m[i].lk[j].c == c
                                    && result.wd_m[i].lk[j].stc == stc && result.wd_m[i].lk[j].wd == wd) {
                                        result = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne({ 
                                    _id: ct.hashCode(),
                                    rt:ct,
                                    'wd_m.lt': lt,
                                    'wd_m.lk.vid':vid,
                                    'wd_m.lk.c':parseInt(c),
                                    'wd_m.lk.stc':parseInt(stc),
                                    'wd_m.lk.wd':parseInt(wd)
                                },
                                {
                                    $pull:{
                                        'wd_m.$[].lk' : {
                                            vid: vid , 
                                            c: parseInt(c),
                                            stc: parseInt(stc), 
                                            wd:parseInt(wd)
                                        }
                                    }
                                });
    
                                if (result.result.nModified !== 1)
                                    throw new Error(result.result.nModified + ' has been modified');
                                break;
                            }
                        }
                    }
                    res.end('completed');
                }
            }
        } else {
            console.log('[deleteWdBase] None found from query');
            res.end('failed');
        }
    } catch (e) {
        console.error(e.stack);
        res.end('failed');
    } finally {
        await client.close()
    }
}

async function deleteStrt(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const query = req.query, rt = query.rt.trim(), t = query.t.trim(), vid = query.vid.trim(), db = query.db.trim(),
        c = query.c.trim(), stc = query.stc.trim();

    // TODO
    // what will happen if rt's an array?
    console.log('[DeleteStrt] ', rt);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        console.log(db);

        const result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({ 
            _id: rt.hashCode(),
            rt:rt,
            'strt_m.t': t
        });
    
        if (result) {
            for (let i = 0; i < result.strt_m.length; ++i) {
                if (result.strt_m[i].t === t) {
                    if (result.strt_m[i].lk.length <= 1) {
                        const test = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne({ 
                            _id: rt.hashCode(),
                            rt:rt,
                            'strt_m.t': t,
                            'strt_m.lk.vid':vid,
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
                            if (result.strt_m[i].lk[j].vid == vid && result.strt_m[i].lk[j].pos.c == c
                                    && result.strt_m[i].lk[j].pos.stc == stc) {
                                const test = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne({ 
                                    _id: rt.hashCode(),
                                    rt:rt,
                                    'strt_m.t': t,
                                    'strt_m.lk.vid':vid,
                                    'strt_m.lk.c':parseInt(c),
                                    'strt_m.lk.stc':parseInt(stc)
                                },
                                {
                                    $pull:{
                                        'strt_m.$[].lk' : {
                                            'vid': vid , 
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
                        res.end('complete');
                        break;   
                    }
                }
            }
        } else {
            throw new Error('[deleteStrt] none found');
        }
    } catch (e) {
        console.error(e.stack);
        res.end('failed');
    } finally {
        await client.close();
    }
}

async function push(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true });

    req.accepts('application/json');
    const data = req.body, query = req.query, folder = query.folder, db = query.db;

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        let result = undefined
        const _id = data.source+data.file;

        // Backup into the local
        fs.writeFileSync(path.join(VIDEO_ARCHIVE_PATH+'_BACKUP', folder, _id+'.json'), JSON.stringify(data, null, "\t"), "utf-8");
        
        data['_id'] = _id;

        // pull data from PILOT completely.
        await pull(client, ENUM.DB.PILOT, _id);
        if (db === ENUM.DB.PRODUCT) {
            await pull(client, ENUM.DB.PRODUCT, _id);
        }
        
        // SB_VIDEO ISNERT
        result = await client.db(db).collection(ENUM.COL.VIDEO).findOne({ _id: _id });
            
        if (result) {
            await replaceListing(client, db, ENUM.COL.VIDEO, data);
        } else {
            await insertListing(client, db, ENUM.COL.VIDEO, data);
        }

        delete data._id;

        // INSERT into SB_ENG_BASE  
        for (let i = 0; i < data['c'].length; ++i) {
            let stc = data['c'][i]['t']['stc']

            if (stc) {
                for (let j = 0; j < stc.length; ++j) {
                    let wd = stc[j]['wd'], strt = stc[j]['strt'];

                    // wd
                    if (wd) {
                        for (let k = 0; k < wd.length; ++k) {
                            const data = wd[k], ct = data['ct'].toLowerCase(), lt = data.lt;
                            let rt = undefined;

                            if (data.is === false) {
                                continue;
                            }

                            if (data['rt']) rt = data['rt'].toLowerCase();
                            else rt = ct;

                            async function insert(client, db, rt, lt, _id, c, stc, wd) {
                                const listing = { 
                                    _id: rt.hashCode(), 
                                    rt: rt,
                                    wd_m: [{  
                                        lt: lt,
                                        lk:[{
                                            vid:_id,
                                            date:new Date().toLocaleString(),
                                            c:c,
                                            stc:stc,
                                            wd:wd
                                        }]
                                    }],
                                    strt_m:[]
                                };
                                await insertWdIntoBase(client, db, listing, rt.hashCode());
                            };
                            
                            // firstly, insert ct listing into base collection
                            await insert(client, db, ct, lt, _id, i, j, k);
                            // then rt
                            if (rt !== ct) {
                                await insert(client, db, rt, lt, _id, i, j, k);
                            }
                        }
                    }

                    // strt
                    if (strt) {
                        for (let k = 0; k < strt.length; ++k) {
                            for (let l = 0; l < strt[k].rt.length; ++l) {
                                const rt = strt[k].rt[l], t = strt[k].t,
                                    strt_m = {  
                                        t: t,
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
                                    await pushStrt(client, db, strt_m, rt.hashCode());
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
                                        await pushStrt(client, db, strt_m, rt.hashCode());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // ENUM.updateWord();

        if (db === ENUM.DB.PRODUCT) {
            // TODO
            // How to notice Product Server to update the WORD_LIST?
        }

        res.json({res:'complete'});
    } catch (e) {
        console.error(e.stack);
        res.json({res:e});
    } finally {
        await client.close();
    }
}

async function insertWd(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })

    req.accepts('application/json');
    const query = req.query, ct = query.ct, lt = query.lt.trim(), vid = query.link.trim(), db = query.db,
        c = parseInt(query.c), stc = parseInt(query.stc), wd = parseInt(query.wd);
    
    try {
        // Connect to the MongoDB cluster
        await client.connect();

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
        
        await insertWdIntoBase(client, db, ctListing, ct.hashCode());

        res.json({res:'complete'});
    } catch (e) {
        console.error(e.stack);
        res.json({res:e});
    } finally {
        await client.close()
    }
}

async function insertStrt(req, res) {
    const client = new MongoClient(ENUM.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, rt = query.rt, t = query.t.trim(), usg = query.usg.trim(), 
        vid = query.vid.trim(), db = query.db.trim(), c = parseInt(query.c), stc = parseInt(query.stc),
        strt = query.strt.trim();

    // TODO
    // what will happen when rt is an array more than one element.
    console.log(rt);
    
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // INSERT into SB_ENG_BASE  
        const strt_m = {
            t: t,
            usg: usg,
            lk:[{
                vid:vid,
                date:new Date().toLocaleString(),
                c:c,
                stc:stc,
                strt:strt
            }]
        };
        
        await pushStrt(client, db, strt_m, rt.hashCode());

        res.end('complete');
    } catch (e) {
        console.error(e.stack);
        res.end(e);
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
        await client.connect();

        let result = await client.db(ENUM.DB.PRODUCT).collection(ENUM.COL.CANVAS).findOne({ _id: source });
        let o = {
            "ff" : body.ff,
            "fs" : body.fs,
            "pt" : body.pt,
            "pl" : body.pl,
            "pr" : body.pr
        };

        if (result) {
            result[type] = o;
            await replaceListing(client, ENUM.DB.PRODUCT, ENUM.COL.CANVAS, result);
            delete result._id;
            res.json(Object.keys(result));
        } else {
            let json = {
                _id : source,
            }
            json[type] = o
            await insertListing(client, ENUM.DB.PRODUCT, ENUM.COL.CANVAS, json);
            delete json._id;
            res.json([`${type}`]);
        }
    } catch (e) {
        console.error(e);
        res.json([]);
    } finally {
        await client.close()
    }
}

// DB Transaction
app.post('/api/push', (req, res) => push(req, res));
app.post('/api/addCanvasInfo', (req, res) => addCanvasInfo(req, res));

app.get('/api/getVideo', (req, res) => getVideo(req, res));
app.get('/api/getCanvasType', (req, res) => getCanvasType(req, res));
app.get('/api/getCanvasInfo', (req, res) => getCanvasInfo(req, res));
app.get('/api/getWdInfo', (req, res) => getWdInfo(req, res));
app.get('/api/getStrtInfo', (req, res) => getStrtInfo(req, res));
// app.get('/api/deleteVideo', (req, res) => deleteVideo(req, res));

app.get('/api/insertWd', (req, res) => insertWd(req, res));
app.get('/api/insertStrt', (req, res) => insertStrt(req, res));
app.get('/api/deleteWd', (req, res) => deleteWd(req, res));
app.get('/api/deleteStrt', (req, res) => deleteStrt(req, res));

// NLPK
app.get('/api/tokenizeStc', (req, res) => tokenizeStc(req, res));
app.get('/api/parseStc', (req, res) => parseStc(req, res));

// File or Data
app.get('/api/getSnapshot', (req, res) => getSnapshot(req, res));
app.get('/api/getAudio', (req, res) => getAudio(req, res));
app.get('/api/getNav', (req, res) => getNav(res));
app.get('/api/getFile', (req, res) => getFile(req, res));
app.get('/api/getSourceList', (req, res) => getSourceList(res));
app.get('/api/getDBList', (req, res) => getDBList(res));

app.listen(process.env.PORT || 8080, () => {
    console.log(`Listening on port ${process.env.PORT || 8080}!`);
});




// Functions

async function insertListing(client, db, col, listing){
    const result = await client.db(db).collection(col).insertOne(listing);
    console.log(`a listing inserted with the id: ${result.insertedId} to ${db}:${col}`);
};

async function replaceListing(client, db, col, listing) {
    result = await client.db(db).collection(col).replaceOne({
        _id : listing['_id']
    }, 
    {
        $set: listing
    });
    
    // console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`_id : ${listing['_id']}, for "${listing["link"]}" replaced : matchedCount(${result.matchedCount}), modiefiedCount(${result.modifiedCount})`);
};

async function insertWdIntoBase(client, db, listing, hashId) {
    let result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({_id:hashId});

    await insertWdIntoList(client, db, listing.rt);
    if (result === null) {
        await insertListing(client, db, ENUM.COL.ENG_BASE, listing);
    } else {
        const wd_m = listing.wd_m[0], lk = wd_m.lk[0];

        for (let l = 0; l < result.wd_m.length; ++l) {
            if (result.wd_m[l].lt === wd_m.lt) {
                const transRes = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne(
                    { 
                        _id: result._id, 
                        'wd_m.lt':wd_m.lt 
                    },
                    { $push:{ 'wd_m.$.lk': lk } }
                );
                if (transRes.result.nModified !== 1) {
                    throw new Error(transRes.result.nModified)
                }

                return true;
            }
        }

        const transRes = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne(
            { _id: result._id },
            { $push: { 'wd_m': wd_m } }
        );

        if (transRes.result.nModified !== 1) {
            throw new Error(transRes.result.nModified)
        }

        return true;
    }
};

async function deleteWdFromBase(client, db, rt, vid) {
    let result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({ 
        _id: rt.hashCode(),
        rt:rt
    });

    // TODO
    // Here could be performence problem.
    console.log(result);
    if (result) {
        const length = result.wd_m.length;
        for (let i = 0; i < length; ++i) {
            if (result.wd_m[i].lk.length <= 1) {
                result = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne({ 
                    _id: rt.hashCode(),
                    rt:rt,
                    'wd_m.lk.vid':vid,
                },
                {
                    $pull:{
                        'wd_m' : {
                            vid:vid
                        }
                    }
                });

                if (result.result.nModified !== 1) {
                    // throw new Error(result.result.nModified + ' has been modified (expected:1)');
                    console.log(result.result.nModified + ' has been modified (expected:1)');
                } else {
                    result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({ 
                        _id: rt.hashCode(),
                        rt:rt
                    });

                    if (result.wd_m.length === 0) {
                        if (ENUM.DB.PRODUCT === ENUM.getDBByKey(db)) {
                            notifyProductToUpdateWordList();
                        }

                        await client.db(db).collection(ENUM.COL.ENG_BASE).deleteOne({ 
                            _id: rt.hashCode(),
                            rt:rt
                        });

                        await client.db(db).collection(ENUM.COL.ENG_LIST).deleteOne({ 
                            _id: rt,
                            hash:rt.hashCode()
                        });
                    }
                }
            } else {
                for (let j = 0; j < result.wd_m[i].lk.length; ++j) {
                    if (result.wd_m[i].lk[j].vid == vid.trim()) {
                        result = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne({ 
                            _id: rt.hashCode(),
                            rt:rt,
                            'wd_m.lk.vid':vid
                        },
                        {
                            $pull:{
                                'wd_m.$[].lk' : {
                                    vid: vid
                                }
                            }
                        });

                        if (result.result.nModified !== 1)
                            throw new Error(result.result.nModified + ' has been modified');
                        break;
                    }
                }
            }
        }
        return true;
    } else {
        console.log('[deleteWdBase] None found from query');
        return false;
    }
}

async function insertWdIntoList(client, db, wd) {
    if (ENUM.getWord(db, wd) === undefined) {
        await insertListing(client, db, ENUM.COL.ENG_LIST, {_id:wd, hash:wd.hashCode()});
        ENUM.pushWord(db, wd, wd.hashCode());

        notifyProductToUpdateWordList();

        // TODO
        // if (result.ok !== 1) {
        //     throw new Error(result.ok);
        // }
    }
};

async function pushStrt(client, db, strt, id) {
    const result = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne(
        { _id: id },
        { $push: { 'strt_m': strt } }
    );
    if (result.result.nModified !== 1) {
        throw new Error(result.result.nModified)
    }
};

async function deleteStrtFromBase(client, db, rt, vid) {
    const result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({ 
        _id: rt.hashCode(),
        rt:rt
    });

    if (result) {
        for (let i = 0; i < result.strt_m.length; ++i) {
            if (result.strt_m[i].lk.length <= 1) {
                const test = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne({ 
                    _id: rt.hashCode(),
                    rt:rt,
                    'strt_m.lk.vid':vid
                },
                {
                    $pull:{
                        'strt_m' : {
                            'lk.vid':vid
                        }
                    }
                });

                if (test.result.nModified !== 1)
                    throw new Error(test.result.nModified);
            } else {
                for (let j = 0; j < result.strt_m[i].lk.length; ++j) {
                    if (result.strt_m[i].lk[j].vid == vid) {
                        const test = await client.db(db).collection(ENUM.COL.ENG_BASE).updateOne({ 
                            _id: rt.hashCode(),
                            rt:rt,
                            'strt_m.lk.vid':vid
                        },
                        {
                            $pull:{
                                'strt_m.$[].lk' : {
                                    'vid': vid
                                }
                            }
                        });

                        if (test.result.nModified !== 1)
                            throw new Error(test.result.nModified);
                    }
                }
            }
        }
    } else {
        throw new Error('Something wrong');
    }
};

async function pull(client, db, vid) {
    // TODO
    // Here could be performance problem

    // ENG_BASE & ENG_LIST
    // strt
    await client.db(db).collection(ENUM.COL.ENG_BASE).updateMany({
       'strt_m.lk.vid':vid
    },
    {
        $pull:{
            'strt_m': {
                'lk.vid':vid
            }
        }
    });

    // wd
    await client.db(db).collection(ENUM.COL.ENG_BASE).aggregate([
        { $match: {
            'wd_m.lk.vid':vid
        }},
        { $project: {
            rt : 1,
            _id:0
        }}
    ])
    .toArray()
    .then(await async function (res) {
        let result = await client.db(db).collection(ENUM.COL.ENG_BASE).updateMany({
            'wd_m.lk.vid':vid
        },
        {
            $pull:{
                'wd_m': {
                    'lk.vid':vid
                }
            }
        });
    
        result = await client.db(db).collection(ENUM.COL.ENG_BASE).deleteMany({
            'wd_m':{$size:0}
        });

        for (let i in res) {
            result = await client.db(db).collection(ENUM.COL.ENG_BASE).findOne({
                rt:res[i].rt
            });
            if (result === null) {
                result = await client.db(db).collection(ENUM.COL.ENG_LIST).deleteOne({
                    _id:res[i].rt
                });
                ENUM.pullWord(db, res[i].rt);
            }
        }
        
    });

    // VIDEO
    await client.db(db).collection(ENUM.COL.VIDEO).deleteOne({
        _id:vid
    });
}

// To other server
function notifyProductToUpdateWordList(db) {
    if (ENUM.DB.PRODUCT === ENUM.getDBByKey(db)) {
        // do sth to notify product server that update the word list.
        // fetch('http://ume.gg/updateWordList')
    }
}



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