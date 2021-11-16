const fs = require('fs');
const path = require('path');

let filename = path.resolve(__dirname, './json/state.json')

function Storage() {
    
    this.saveFlashcards = function(flashcards) {
        fs.writeFile(filename, JSON.stringify(flashcards, null, 2), err => {
            if(err) {
                console.log(err);
                return err
            } else {
                console.log("File successfully created")
                return null;
            }
        })
    },

    this.saveFlashcard = function(flashcard) {

    },

    this.getFlashcards = function() {
        const jsonString = fs.readFileSync(filename, 'utf8')

        try {
                
            let data = JSON.parse(jsonString);
            return data;
        } catch(err) {
            console.log('Error parsing JSON', err)
            return null;
        }

    },

    this.getFlashcard = function(id) {
        fs.readFile(filename, 'utf-8', (err, jsonString) => {
            if(err) {
                console.log(err)
                return null
            }
            try {
                let data = JSON.parse(jsonString);
                let foundFlashcard = data.find((flashcard) => {
                    return flashcard.id === id
                })
                return foundFlashcard;
            } catch(err) {
                console.log('Error parsing JSON', err)
                return null;
            }
        })
    },

    this.updateFlashcard = function(flashcard) {

    },

    this.deleteFlashcard = function(id) {

    }
    
}

module.exports = Storage;