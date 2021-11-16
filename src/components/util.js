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
    return Array.from(myMap.values())
}

function mapFromArray(myArray) {
    let newMap = new Map();
    myArray.forEach(element => {
        newMap.set(element.id, element)
    })
    return newMap
}

export { getSubjectsMapFromFlashcards, stringInitialized, arrayFromMap, mapFromArray };