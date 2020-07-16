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

            await client.db('pilot').collection("SB_ENG_LIST").find({}).toArray().then((result) => {
                delete result._id;

                Object.keys(result).map((item) => {
                    this.WORD[item] = result[item];
                });
            });
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

            await client.db('pilot').collection("SB_ENG_LIST").find({}).toArray.then((result) => {
                delete result._id;

                this.WORD = [];

                Object.keys(result).map((item) => {
                    this.WORD[item] = result[item];
                });
            });
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

    this.getDB = function (db) {
        return this.DB[db];
    };

    this.getSource = function (source) {
        return this.SOURCE[source];
    };
}