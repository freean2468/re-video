const {MongoClient} = require('mongodb');
const fs = require('fs');

module.exports = function Enum() {
    this. PASSWORD = fs.readFileSync("./pw.txt", "utf8");
    this.URI = `mongodb+srv://sensebe:${this.PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`;
    this.DB = {}; 
    this.COL = {};
    this.SOURCE = {};

    this.WORD = {};

    this.initialize = async function () {
        const client = new MongoClient(this.URI, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            // Connect to the MongoDB cluster
            await client.connect();

            let result = await client.db('sensebe_dictionary').collection("SB_ENUM").findOne({_id:"DB"});
            
            delete result._id;

            Object.keys(result).map((item) => {
                this.DB[item] = result[item];
            });

            result = await client.db('sensebe_dictionary').collection("SB_ENUM").findOne({_id:"SOURCE"});
            
            delete result._id;

            Object.keys(result).map((item) => {
                this.SOURCE[item] = result[item];
            });

            result = await client.db('sensebe_dictionary').collection("SB_ENUM").findOne({_id:"COLLECTION"});
            
            delete result._id;

            Object.keys(result).map((item) => {
                this.COL[item] = result[item];
            });

            for (let key in this.DB) {
                await client.db(this.DB[key]).collection("SB_ENG_LIST").find({}).toArray().then((result) => {
                    delete result._id;
    
                    this.WORD[key] = {};
                    Object.keys(result).map((item) => {
                        this.WORD[key][item] = result[item];
                    });
                });    
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    };

    this.updateWord = async function () {
        const client = new MongoClient(this.URI, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            // Connect to the MongoDB cluster
            await client.connect();

            for (let key in this.DB) {
                await client.db(this.DB[key]).collection("SB_ENG_LIST").find({}).toArray().then((result) => {
                    delete result._id;
    
                    this.WORD[key] = {};
                    Object.keys(result).map((item) => {
                        this.WORD[key][item] = result[item];
                    });
                });    
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

    this.getWd = function (db, wd) {
        let _db = this.getDBByKey(db);
        return this.WORD[_db][wd];
    }

    this.getDBByKey = function (db) {
        for (let key in this.DB) {
            this.DB[key] == db;
            return key;
        }
        return new Error(`no valid key : ${db}`)
    };

    // this.getSource = function (source) {
    //     return this.SOURCE[source];
    // };
}