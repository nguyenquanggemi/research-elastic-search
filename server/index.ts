import ElasticSearch from "elasticsearch"
import express from 'express'
import bodyParser from "body-parser"
import { v4 as uuidv4 } from 'uuid';

const app = express()
app.use(bodyParser.json())


const Client = new ElasticSearch.Client({
    hosts: ["http://127.0.0.1:9200"]
})

Client.ping({
    requestTimeout: 30000
}, (err) => {
    err ? console.log("Down") : console.log("OK hihi")
})


const createIndex = async (indexName: string) => {
    return await Client.indices.create({
        index: indexName
    })
}

const addmappingToIndex = async (indexName: string, mappingType: string, mapping: any) => {
    console.log(indexName)
    console.log(mapping)
    console.log(mappingType)
    return await Client.indices.putMapping({
        index: indexName,
        type: mappingType,
        body: mapping,
        includeTypeName: true
    })
}
const insertDoc = async (indexName: string, _id: any, mappingType: string, data: any) => {
    return await Client.index({
        index: indexName,
        type: mappingType,
        id: _id,
        body: data
    })
}

const searchDoc = async (indexName: string, mappingType: string, payload: any) => {
    return await Client.search({
        index: indexName,
        type: mappingType,
        body: payload
    })
}

const deleteDoc = async (indexName: string, mappingType: string, id: string) => {
    return await Client.delete({
        id,
        index: indexName,
        type: mappingType
    })
}

app.get("/documents", async (req, res) => {
    try {
        const { payload, type, indexName } = req.body
        const result = await searchDoc(indexName, type, payload)
        console.log(result)
        return res.send(result)
    }
    catch (err) {
        console.log(err)
    }
})

app.post('/createIndex', async (req, res) => {
    try {
        const result = await createIndex(req.body?.indexName)
        console.log(result)
        res.send(result)
    } catch (err) {
        console.log(err)
    }

})

app.post('/createMapping', async (req, res) => {
    try {
        const { indexName, mappingType, mapping } = req.body
        console.log(req.body)
        const result = await addmappingToIndex(indexName, mappingType, mapping)
        res.send(result)
    }
    catch (e) {
        console.log(e)
    }
})

app.post("/createDocument", async (req, res) => {
    try {
        const { indexName, mappingType, data } = req.body
        const result = await insertDoc(indexName, uuidv4(), mappingType, data)
        res.send(result)
    }
    catch (err) {
        console.log(err)
    }
})

app.delete('/deleteDoc', async (req, res) => {
    try {
        const { indexName, mappingType, id }: any = req.query
        const result = await deleteDoc(indexName, mappingType, id)
        res.send(result)
    }
    catch (err) {
        console.log(err)
    }
})

app.get("/", (_, res) => {
    res.send("Hello world \n")
})

app.listen(5000, () => {
    console.log("Listen port 5000")
})

