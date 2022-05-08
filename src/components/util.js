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

function flashcardsArrayToMap(flashcards) {
    let subjectsMap = new Map();
    subjectsMap.set("other", {
        flashcards: []
    })
    flashcards.forEach(flashcard => {
        //If the flashcard doesnt have a subject add it to the "other" subtree
        if(!stringInitialized(flashcard.subject)) {
            let tmpflashcards = subjectsMap.get("other").flashcards
            tmpflashcards.push({
                ...flashcard
            })
            subjectsMap.set("other", {
                ...subjectsMap.get("other"),
                flashcards: tmpflashcards
            })
        } else {
            let chaptersMap;
            //if the flashcards subject isnt added yet add it
            if(!subjectsMap.has(flashcard.subject)) {
                chaptersMap = new Map();
                chaptersMap.set("other", {
                    flashcards: []
                })
                subjectsMap.set(flashcard.subject, {
                    chapters: chaptersMap
                }); 
            } else {
                chaptersMap = subjectsMap.get(flashcard.subject).chapters
            }
            if(!stringInitialized(flashcard.chapter)) {
                let tmpflashcards = chaptersMap.get("other").flashcards
                tmpflashcards.push({
                    ...flashcard
                })
                chaptersMap.set("other", {
                    ...chaptersMap.get("other"),
                    flashcards: tmpflashcards
                })
            } else {
                if(chaptersMap.has(flashcard.chapter)) {
                    let chapter = chaptersMap.get(flashcard.chapter); 
                    chapter.flashcards.push({
                        ...flashcard
                    })
                } else {
                    let tmpflashcards = []
                    tmpflashcards.push({
                        ...flashcard
                    })
                    chaptersMap.set(flashcard.chapter, {
                        flashcards: tmpflashcards
                    })
                }
            }
        }
    });
    return subjectsMap;
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
    return newMap
}

function treeFromArray(flashcards) {
    let subjects = [
        {
            id: "other",
            flashcards: []
        }
    ]
    flashcards.forEach(stateflashcard => {
        if(stateflashcard.subject !== "") {
            if(findNode(subjects, stateflashcard.subject)) {
                //let subject = findNode(subjects, stateflashcard.subject)
                if(!findNode(subjects, stateflashcard.subject, stateflashcard.chapter)) {
                    
                    setChapter(subjects, stateflashcard.subject, stateflashcard.chapter, {
                        subject: stateflashcard.subject,
                        id: stateflashcard.chapter,
                        name: stateflashcard.chapter,
                        flashcards: [
                            {
                                ...stateflashcard
                            }
                        ]
                    })
                } else {
                    setChapter(subjects, stateflashcard.subject, stateflashcard.chapter, {
                    subject: stateflashcard.subject,
                    id: stateflashcard.chapter,
                    name: stateflashcard.chapter,
                    flashcards: [
                        ...findNode(subjects,stateflashcard.subject, stateflashcard.chapter).flashcards,
                        {
                            ...stateflashcard
                        }
                    ]
                })

                }
            } else {
                setSubject(subjects, stateflashcard.subject, {
                    id: stateflashcard.subject,
                    name: stateflashcard.subject,
                    chapters: [{
                        subject: stateflashcard.subject,
                        //position: 0,
                        id: "other",
                        name: "other",
                        flashcards: [
                            {
                                ...stateflashcard
                            }
                        ]
                    }]
                })
                if(stateflashcard.chapter != "" && stateflashcard.chapter != null) {
                    //let subject = subjects.get(stateflashcard.subject)
                    setChapter(subjects,stateflashcard.subject, stateflashcard.chapter, {
                        subject: stateflashcard.subject,
                        //position: subject.chapters.size,
                        name: stateflashcard.chapter,
                        id: stateflashcard.chapter,
                        flashcards: [
                            {
                                ...stateflashcard
                            }
                        ]
                    })
                } else {
                    setChapter(subjects,stateflashcard.subject, "other", {
                        subject: stateflashcard.subject,
                        id: "other",
                        name: "other",
                        flashcards: [
                            {
                                ...stateflashcard
                            }
                        ]
                    })
                }
            }
        } else {
            setSubject(subjects, "other", {
                ...findNode(subjects, "other"),
                flashcards: [
                    ...findNode(subjects, "other").flashcards,
                    {
                        id: "other",
                        name: "other",
                        ...stateflashcard
                    }
                ]
            })
        }
    })
    return subjects
}

function getState(tmpState) {
    tmpState.flashcards = mapFromArray(tmpState.flashcards)
    tmpState.subjects = tmpState.subjects
    // tmpState.subjects.forEach(subject => {
    //     console.log(subject.chapters)
    //     subject.chapters = mapFromArray(subject.chapters)
    // })
    return tmpState
}

function findNode(subjects, subjectName, chapterName, flashcardid) {
    let node = null
    subjectName = subjectName == ""? "other": subjectName
    chapterName = chapterName == ""? "other": chapterName
    if(subjectName) {
        node = subjects.find(subject => subject.id == subjectName)
    }
    if(subjectName && chapterName && node) {
        node = node.chapters.find(chapter => (chapter.id == chapterName || chapter.name == chapterName))
    }
    if(subjectName && chapterName && node && flashcardid) {
        node = node.flashcards.find(flashcard => flashcard.id == flashcardid)
    }
    return node;
}

function findFlashcardByIndex(subjects, flashcardid) {
    let foundFlashcard = null
    subjects.forEach(subject => {
        if(subject.id == "other") {
            subject.flashcards.forEach(flashcard => {
                if(flashcard.id == flashcardid)
                    foundFlashcard = flashcard
            })
        } else {
        subject.chapters.forEach(chapter => {
            chapter.flashcards.forEach(flashcard => {
                if(flashcard.id == flashcardid)
                    foundFlashcard = flashcard
            })
        })}
    })
    return foundFlashcard;
}

function setSubject(subjects, subjectName, subjectToSet) {
    let updated = false
    subjects.forEach((subject, index) => {
        if(subject.id == subjectName) {
            subjects[index] = subjectToSet
            updated = true;
        }
    })
    if(!updated)
        subjects.push(subjectToSet)
    return [...subjects]
}

function setChapter(subjects, subjectName, chapterName, chapterToSet) {
    let updated = false
    subjects.forEach((subject, index) => {
        if(subject.id == subjectName) {
            subject.chapters.forEach((chapter, chapterIndex) => {
                if(chapter.id == chapterName) {
                    subjects[index].chapters[chapterIndex] = chapterToSet
                    updated = true;
                }
            })
            if(!updated)
                subject.chapters.push(chapterToSet)
        }
    })
    
    return [...subjects]
}

function setFlashcard(subjects, subjectName, chapterName, flashcardid, flashcardToSet) {
    let updated = false
    subjects.forEach((subject, index) => {
        if(subject.id == subjectName) {
            subject.chapters.forEach((chapter, chapterIndex) => {
                if(chapter.id == chapterName) {
                    chapter.flashcards.forEach((flashcard, flashcardIndex) => {
                        if(flashcard.id == flashcardid) {
                            subjects[index].chapters[chapterIndex].flashcards[flashcardIndex] = flashcardToSet
                            updated = true;
                        }
                    })
                    if(!updated)
                        chapter.flashcards.push(flashcardToSet)
                }
            })
        }
    })
    return [...subjects]
}

function getFlashcardIndex(subjects, flashcardid, subjectName, chapterName) {
    let foundIndex = null

    subjects.forEach(subject => {
        if(subject.id == subjectName) {
            if(!chapterName) {
                subject.flashcards.forEach((flashcard, index) => {
                    if(flashcard.id == flashcardid)
                        foundIndex = index
                })
            } else {
                subject.chapters.forEach(chapter => {
                    if(chapter.id == chapterName) {
                        return chapter.flashcards.forEach((flashcard, index) => {
                            if(flashcard.id == flashcardid)
                                foundIndex = index
                        })
                    }
                })
            }
        }
    })

    return foundIndex;
}


export { getSubjectsMapFromFlashcards, stringInitialized, arrayFromMap, mapFromArray, getState, findNode, findFlashcardByIndex, setSubject, setChapter, setFlashcard, getFlashcardIndex, treeFromArray };