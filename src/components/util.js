function getSubjectsMapFromFlashcards(flashcards) {
    let subjects = new Map();
   
    flashcards.forEach((flashcard) => {
        if(flashcard.subject) {
            if(!subjects.has(flashcard.subject)) {
                subjects.set(flashcard.subject, new Map());
                if(flashcard.chapter) {
                    subjects.get(flashcard.subject).set(flashcard.chapter, true)
                }
            } else {
                if(flashcard.chapter) {
                    subjects.get(flashcard.subject).set(flashcard.chapter, true)
                }
            }
        }
    });

    return subjects;
}

function stringInitialized(value) {
    if(value !== "" && value !== null && value !== undefined) {
        return true;
    } else {
        return false
    }
}

function arrayFromMap(myMap) {
    if(myMap instanceof Array) {
        return Array.from(myMap.map((element) => {
            return arrayFromMap(element)
        }))
    }

    if(myMap instanceof Map) {
        return Array.from(myMap.entries()).map((element) => {
            element[1].id = element[0]
            return arrayFromMap(element[1])
        })
    }

    if(myMap instanceof Object) {
        let newObj = {}
        for (const prop in myMap) {
            newObj[prop] = arrayFromMap(myMap[prop])
        }
        return newObj;
    }
    return myMap;
}

function mapFromArray(myArray) {
    let newMap = new Map();
    myArray.forEach(element => {
        newMap.set(element.id, element)
    })
    console.log(newMap)
    return newMap
}


export { getSubjectsMapFromFlashcards, stringInitialized, arrayFromMap, mapFromArray };