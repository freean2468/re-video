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
const ENG_BASE_COLLECTION = "SB_ENG_BASE"
const CANVAS_COLLECTION = "SB_CANVAS"
const STRT_COLLECTION = "SB_STRT"

// lists
const LIST_OF_WORD = "list_word.json"
const LIST_OF_SOURCE = "list_source.json"

const PASSWORD = fs.readFileSync("./pw.txt", "utf8")

function getSourceList(res) {
    const json = JSON.parse(fs.readFileSync(LIST_OF_SOURCE, 'utf-8'))

    res.json(json)
}

function getFileList(res) {
    const filelist = fs.readdirSync(VIDEO_ARCHIVE_PATH)
    console.log(filelist)
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

async function getCanvasInfo(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(DATABASE_NAME).collection(CANVAS_COLLECTION).findOne({ _id: query['source'] });

        res.json(result);
    } catch (e) {
        console.error(e.stack)
        res.json({res:e})
    } finally {
        await client.close()
    }
}

async function getWdInfo(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, ct = query.ct;
    
    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).findOne({ _id: ct.hashCode() });

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
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query, rt = query.rt;
    
    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).findOne({ _id: rt.hashCode() });
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

async function deleteWdBase(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const query = req.query, 
        ct = query.ct.trim(), lt = query.lt.trim(), link = query.link.trim()
        c = query.c.trim(), stc = query.stc.trim(), wd = query.wd.trim();

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        const result = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).findOne({ 
            _id: ct.hashCode(),
            rt:ct,
            'wd_m.lt': lt
        });

        if (result) {
            console.log(result);
            for (let i = 0; i < result.wd_m.length; ++i) {
                if (result.wd_m[i].lt === lt) {
                    if (result.wd_m[i].lk.length <= 1) {
                        const test = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).updateOne({ 
                            _id: ct.hashCode(),
                            rt:ct,
                            'wd_m.lt': lt,
                            'wd_m.lk.link':link,
                            'wd_m.lk.pos':{c:parseInt(c), stc:parseInt(stc), wd:parseInt(wd)}
                        },
                        {
                            $pull:{
                                'wd_m' : {
                                    lt:lt
                                }
                            }
                        });

                        if (test.result.nModified !== 1)
                            throw new Error(test.result.nModified);
                    } else {
                        for (let j = 0; j < result.wd_m[i].lk.length; ++j) {
                            if (result.wd_m[i].lk[j].link.trim() == link.trim() && result.wd_m[i].lk[j].pos.c == c
                                    && result.wd_m[i].lk[j].pos.stc == stc && result.wd_m[i].lk[j].pos.wd == wd) {
                                const test = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).updateOne({ 
                                    _id: ct.hashCode(),
                                    rt:ct,
                                    'wd_m.lt': lt,
                                    'wd_m.lk.link':link,
                                    'wd_m.lk.pos':{c:parseInt(c), stc:parseInt(stc), wd:parseInt(wd)}
                                },
                                {
                                    $pull:{
                                        'wd_m.$[].lk' : {
                                            link: link , 
                                            pos: {c:parseInt(c), stc:parseInt(stc), wd:parseInt(wd)}
                                        }
                                    }
                                });

                                if (test.result.nModified !== 1)
                                    throw new Error(test.result.nModified);
                                break;
                            }
                        }
                    }
                    res.json({res:'complete'});
                    break;   
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

async function deleteStrtFromBase(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const query = req.query, rt = query.rt.trim(), t = query.t.trim(), link = query.link.trim()
        c = query.c.trim(), stc = query.stc.trim();

        console.log(c);
        console.log(stc);
        // what will happen if rt's array?
    console.log('[DeleteStrt] ', rt);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        const result = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).findOne({ 
            _id: rt.hashCode(),
            rt:rt,
            'strt_m.t': t
        });

        if (result) {
            for (let i = 0; i < result.strt_m.length; ++i) {
                if (result.strt_m[i].t === t) {
                    if (result.strt_m[i].lk.length <= 1) {
                        const test = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).updateOne({ 
                            _id: rt.hashCode(),
                            rt:rt,
                            'strt_m.t': t,
                            'strt_m.lk.link':link,
                            'strt_m.lk.pos.c':parseInt(c),
                            'strt_m.lk.pos.stc':parseInt(stc)
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
                                console.log('In!!');
                                const test = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).updateOne({ 
                                    _id: rt.hashCode(),
                                    rt:rt,
                                    'strt_m.t': t,
                                    'strt_m.lk.link':link,
                                    'strt_m.lk.pos.c':parseInt(c),
                                    'strt_m.lk.pos.stc':parseInt(stc)
                                },
                                {
                                    $pull:{
                                        'strt_m.$[].lk' : {
                                            link: link , 
                                            'pos.c': parseInt(c), 
                                            'pos.stc':parseInt(stc)
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
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

    req.accepts('application/json');
    const query = req.body

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

        // INSERT into SB_ENG_BASE  
        let wordList = JSON.parse(fs.readFileSync(LIST_OF_WORD, "utf8"));

        for (let i = 0; i < query['c'].length; ++i) {
            let stc = query['c'][i]['t']['stc']

            if (stc) {
                for (let j = 0; j < stc.length; ++j) {
                    let wd = stc[j]['wd'], strt = stc[j]['strt'];

                    if (wd) {
                        for (let k = 0; k < wd.length; ++k) {
                            const data = wd[k], ct = data['ct'].toLowerCase();
                            let rt = undefined;

                            if (data['rt']) {
                                rt = data['rt'].toLowerCase();
                            } else {
                                rt = ct;
                            }
                            
                            // firstly, insert ct listing into base collection
                            const ctListing = { 
                                _id: ct.hashCode(), 
                                rt: rt,
                                wd_m: [{  
                                    lt: data['lt'],
                                    lk:[{
                                        source:query.source,
                                        stc:stc[j].ct,
                                        link: link,
                                        pos: {
                                            c:i,
                                            stc:j,
                                            wd:k
                                        }
                                    }]
                                }],
                                strt_m:[]
                            };
                            await insertBase(ctListing, ct.hashCode());

                            if (ct !== rt) {
                                const rtListing = { 
                                    _id: rt.hashCode(), 
                                    rt: rt,
                                    wd_m: [{  
                                        lt: data['lt'],
                                        lk:[{
                                            source:query.source,
                                            stc:stc[j].ct,
                                            link: link,
                                            pos: {
                                                c:i,
                                                stc:j,
                                                wd:k
                                            }
                                        }]
                                    }],
                                    strt_m:[]
                                };
                                await insertBase(rtListing, rt.hashCode());
                            }

                            async function insertBase(listing, hasiId) {
                                let result = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).findOne({_id:hasiId});

                                if (result === null) {
                                    await createListing(client, listing, ENG_BASE_COLLECTION);
                                } else {
                                    let second = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).findOne({
                                        _id:listing._id,
                                        rt:listing.rt,
                                        'wd_m.lt': listing.wd_m[0].lt
                                    });

                                    if (second === null) {
                                        let third = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).findOne({
                                            _id:listing._id,
                                            rt:listing.rt,
                                            'wd_m.lt': listing.wd_m[0].lt,
                                            'wd_m.lk.link': listing.wd_m[0].lk[0].link,
                                            'wd_m.lk.pos.c': listing.wd_m[0].lk[0].pos.c,
                                            'wd_m.lk.pos.stc': listing.wd_m[0].lk[0].pos.stc,
                                            'wd_m.lk.pos.wd': listing.wd_m[0].lk[0].pos.wd
                                        });

                                        if (third === null) {
                                            const wd_m = listing.wd_m[0], lk=wd_m.lk[0];
                                            if (result.wd_m.length === 0) {
                                                const test = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).updateOne(
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
                                                        const test = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).updateOne(
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
                                                    const test = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).updateOne(
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
                            }
                            
                            if (wordList[ct] === undefined) {
                                wordList[ct] = hashId;
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
                                        cmt: strt[k].cmt,
                                        lk:[{
                                            source:query.source,
                                            stc:stc[j].ct,
                                            link: link,
                                            pos: {
                                                c:i,
                                                stc:j,
                                                from:strt[k].from
                                            }
                                        }]
                                    };

                                
                                const result = await client.db(DATABASE_NAME).collection(ENG_BASE_COLLECTION).updateOne(
                                    { _id: rt.hashCode() },
                                    { $push: { 'strt_m': strt_m } }
                                );
                                if (result.result.nModified !== 1) {
                                    throw new Error(result.result.nModified)
                                }
                            }
                        }
                    }
                }
            }
        }

        // to re-video
        fs.writeFileSync(LIST_OF_WORD, JSON.stringify(wordList, null, "\t"), "utf-8");
        // to re-sensebe
        fs.writeFileSync(path.join('../re-sensebe', LIST_OF_WORD), JSON.stringify(wordList, null, "\t"), "utf-8");

        res.json({res:'complete'});
    } catch (e) {
        console.error(e.stack);
        res.json({res:e});
    } finally {
        await client.close()
    }
}

async function insertCanvasInfo(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

    req.accepts('application/json');
    const query = req.body

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = await client.db(DATABASE_NAME).collection(CANVAS_COLLECTION).findOne({ _id: query['source'] });

        let json = {
            "_id" : query.source,
            "cv" :  {
                "ff" : query.ff,
                "fs" : query.fs,
                "pt" : query.pt,
                "pl" : query.pl,
                "pr" : query.pr
            }   
        }

        if (result) {
            await replaceListing(client, json, CANVAS_COLLECTION);
        } else {
            console.log('[IST CV CREATE}')
            await createListing(client, json, CANVAS_COLLECTION);
        }

        res.json({res:'complete'});
    } catch (e) {
        console.error(e)
        res.json({res:e})
    } finally {
        await client.close()
    }
}

// DB Transaction
app.post('/api/insert', (req, res) => insert(req, res));
app.post('/api/insertCanvasInfo', (req, res) => insertCanvasInfo(req, res));

app.get('/api/getCanvasInfo', (req, res) => getCanvasInfo(req, res));
app.get('/api/getWdInfo', (req, res) => getWdInfo(req, res));
app.get('/api/getStrtInfo', (req, res) => getStrtInfo(req, res));
app.get('/api/deleteWdBase', (req, res) => deleteWdBase(req, res));
app.get('/api/deleteStrtFromBase', (req, res) => deleteStrtFromBase(req, res));

// NLPK
app.get('/api/tokenizeStc', (req, res) => tokenizeStc(req, res));
app.get('/api/parseStc', (req, res) => parseStc(req, res));

//
app.get('/api/getFileList', (req, res) => getFileList(res));
app.get('/api/getFile', (req, res) => getFile(req, res));
app.get('/api/getSourceList', (req, res) => getSourceList(res));

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));

async function createListing(client, newListing, collection){
    const result = await client.db(DATABASE_NAME).collection(collection).insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}(${newListing.rt})`);
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