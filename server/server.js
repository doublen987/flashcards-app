const Storage = require('./storage/Storage')

const express = require('express');
const path = require('path');
const PORT = 5000;
const app = express();
app.use(express.json())
const storage = new Storage();

app.use(express.static('./dist'));
app.listen(PORT)

app.get('/home', (req,res) => {
    res.sendFile(path.resolve('./dist/index.bundle.js'))
})

app.get('/state', (req, res) => {
    let flashcards = storage.getFlashcards()
    if(flashcards) {
        res.status(200).json({ success: true, flashcards: flashcards})
    } else {
        res.status(404).json({ success: false, msg: "Could not get flashcards" })
    }
})

app.post('/state', (req, res) => {
    try {
        let err = storage.saveFlashcards(req.body)
        
        if(err) {
            res.status(404).json({ success: false, msg: err.message })
        } else {
            res.status(200).json({ success: true})
        }
    } catch (error) {
        console.log("Error parsing request body")   
        res.status(404).json({ success: false, msg: error.message })
    }
    
})