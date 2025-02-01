const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://hassanmoharram:prodDBPass@cluster0.4oc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function clearCollection() {
    const client = new MongoClient(uri, {
        serverApi: ServerApiVersion.v1
    });

    try {
        await client.connect();
        const database = client.db("Sites");
        const collection = database.collection("Sites");

        const result = await collection.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents`);
    } finally {
        await client.close();
    }
}

clearCollection().catch(console.dir);