import React, { Component, useContext, useEffect } from "react";
import { ChangeAppStateContext, AppStateContext } from '../../App'
import { getSubjectsMapFromFlashcards, arrayFromMap, mapFromArray, findNode, setChapter, setSubject, getFlashcardIndex, findFlashcardByIndex } from '../../util'
import { useParams } from 'react-router-dom'
import FlashCardEditorCSS from './FlashcardEditor.module.css'
import UpdatableSelect from "../UpdatableSelect/UpdatableSelect";
import ContentEditor from "../ContentEditor/ContentEditor";

function FlashcardEditor(props) {
        let flashcardid = props.flashcardid;

        let baseflashcard = {
            question: "",
            answer: "",
            subject: "",
            chapter: "",
            hints: []
        };
        const [hint, setHint] = React.useState()

        const changeAppStateContext = useContext(ChangeAppStateContext);
        const appContext = useContext(AppStateContext);

        let flashcards = findFlashcardByIndex(appContext.subjects, flashcardid)
        //const subjectsMap =  getSubjectsMapFromFlashcards(flashcards)
        
        const [stateflashcard, setFlashcard] = React.useState(function getInitialState() {
                if(flashcards) {
                    for(let j = 0; j < flashcards.length; j++) {
                        if(flashcards[j].id === flashcardid) {
                            return {
                                ...baseflashcard,
                                ...flashcards[j]
                            };
                        }
                    }
                }
                
                return baseflashcard;
            
            
        })

        const [prevflashcard, setPrevFlashcard] = React.useState(function getInitialState() {
            if(flashcards) {
            for(let j = 0; j < flashcards.length; j++) {
                if(flashcards[j].id === flashcardid) {
                    return {
                        ...baseflashcard,
                        ...flashcards[j]
                    };
                }
            }
        }
            
            return baseflashcard;
        
        
    })

        useEffect(() => {
            let newflashcard = findFlashcardByIndex(appContext.subjects, props.flashcardid)
            if(props.flashcardid && newflashcard) {
                setFlashcard(newflashcard)
                setPrevFlashcard(newflashcard)
            } else {
                setFlashcard(baseflashcard)
                setPrevFlashcard(newflashcard)
            }
        }, [props.flashcardid])


        //Get all available subjects and chapters from the subjects map
        let subjects = appContext.subjects.map(subject => subject.id)
        let chapters = []
        if(findNode(appContext.subjects, stateflashcard.subject) && stateflashcard.subject != "")
            chapters = findNode(appContext.subjects, stateflashcard.subject).chapters.map(chapter => chapter.id)

        

        function addFlashcard() {
            let newid = ""+Date.now()

            if(stateflashcard.subject == "") { stateflashcard.subject = "other"}
            if(stateflashcard.chapter == "") { stateflashcard.chapter = "other"}

            let subjects = appContext.subjects
            let subject = findNode(subjects, stateflashcard.subject)
            if(subject) {
                let chapter = findNode(subjects, stateflashcard.subject, stateflashcard.chapter)
                if(chapter) {
                    setChapter(subjects, stateflashcard.subject, stateflashcard.chapter, {
                        subject: stateflashcard.subject,
                        id: stateflashcard.chapter,
                        name: stateflashcard.chapter,
                        flashcards: [
                            ...chapter.flashcards,
                            {
                                ...stateflashcard,
                                id: newid
                            }
                        ]
                    })
                } else {
                    setChapter(subjects, stateflashcard.subject, stateflashcard.chapter, {
                        subject: stateflashcard.subject,
                        id: stateflashcard.chapter,
                        name: stateflashcard.chapter,
                        flashcards: [
                            {
                                ...stateflashcard,
                                id: newid
                            }
                        ]
                    })
                }
            } else {
                setSubject(subjects, stateflashcard.subject, {
                    id: stateflashcard.subject,
                    name: stateflashcard.subject,
                    chapters: [
                        {
                            subject: stateflashcard.subject,
                            id: stateflashcard.chapter,
                            name: stateflashcard.chapter,
                            flashcards: [
                                {
                                    ...stateflashcard,
                                    id: newid
                                }
                            ]

                        }
                    ]
                })
            }

            let newQuizes = appContext.quizes
            newQuizes.forEach(quiz => {
                let addToQuiz = false;
                quiz.subjects.forEach(subject => {
                    if(subject.id === stateflashcard.subject) {
                        addToQuiz = true;
                    }
                })
                quiz.chapters.forEach(chapter => {
                    if(chapter.subject == stateflashcard.subject && chapter.id == stateflashcard.chapter) {
                        addToQuiz = true;
                    }
                })

                if(addToQuiz) {
                    quiz.flashcards.push({
                        ...stateflashcard,
                        answered: false,
                    })
                }
            })

            console.log(newQuizes)

            changeAppStateContext({
                ...appContext,
                subjects: subjects,
                quizes: newQuizes
            })
            setFlashcard(baseflashcard)
        }

        function updateFlashcard() {
            let subjects = appContext.subjects
            let flashcardindex = getFlashcardIndex(subjects, flashcardid, prevflashcard.subject, prevflashcard.chapter)
            
            //Delete the flashcard from the previous chapter
            let chapter = findNode(subjects, prevflashcard.subject, prevflashcard.chapter)
            if(chapter && flashcardindex != null && flashcardindex != undefined) {
                chapter.flashcards.splice(flashcardindex, 1)
                setChapter(subjects, prevflashcard.subject, prevflashcard.chapter, chapter)
                
            }

            //Insert the flashcard into the new chapter
            if(stateflashcard.subject !== "") {
                if(findNode(subjects, stateflashcard.subject)) {
                    let locchapter = findNode(subjects,stateflashcard.subject, stateflashcard.chapter)
                    let chapterflashcards = locchapter? locchapter.flashcards : []
                    console.log(locchapter)
                    setChapter(subjects, stateflashcard.subject, stateflashcard.chapter, {
                        subject: stateflashcard.subject,
                        id: stateflashcard.chapter,
                        name: stateflashcard.chapter,
                        flashcards: [
                            ...chapterflashcards,
                            {
                                ...stateflashcard
                            }
                        ]
                    })
                        
                } else {
                    setSubject(subjects, stateflashcard.subject, {
                        name: stateflashcard.subject,
                        chapters: [ {
                            id: stateflashcard.chapter,
                            subject: stateflashcard.subject,
                            //position: 0,
                            name: "other"
                        }]
                    })
                    if(stateflashcard.chapter != "" && stateflashcard.chapter != null) {
                        //let subject = subjects.get(stateflashcard.subject)
                        setChapter(subjects, stateflashcard.subject, stateflashcard.chapter, {
                            ...findNode(subjects, "other"),
                            flashcards: [
                                ...findNode(subjects, stateflashcard.subject, stateflashcard.chapter).flashcards,
                                stateflashcard,
                            ]
                        })
                        
                    } else {
                        setSubject(subjects, "other", {
                            ...findNode(subjects, "other"),
                            flashcards: [
                                ...findNode(subjects, "other").flashcards,
                                {
                                    ...stateflashcard
                                }
                            ]
                        })
                    }
                }
            } else {
                if(flashcardindex != undeifned && flashcardindex != null) {
                    setSubject(subjects, "other", {
                        ...findNode(subjects, "other"),
                        flashcards: [
                            ...findNode(subjects, "other").flashcards.slice(0, flashcardindex),
                            stateflashcard,
                            ...findNode(subjects, "other").flashcards.slice(flashcardindex+1)
                        ]
                    })
                } else {
                    setSubject(subjects, "other", {
                        ...findNode(subjects, "other"),
                        flashcards: [
                            ...findNode(subjects, "other").flashcards,
                            stateflashcard,
                        ]
                    })
                }
            }

            changeAppStateContext({
                ...appContext,
                subjects: subjects,
                // flashcards: new Map(
                //     appContext.flashcards.set(flashcardid,stateflashcard)
                // )
            })
            setFlashcard(baseflashcard)
        }

        function deleteFlashcard() {
            
            function removeDeletedFlashcards(appContext) {
                let quizes = [...appContext.quizes];
                quizes.forEach((quiz, quizindex) => {  
                    [...quiz.flashcards].forEach((flashcard, index) => {
                        // let flashcardbody = findFlashcardByIndex(appContext.subjects, flashcard.id)
                        // if(!flashcardbody) {
                        //     quiz.flashcards.splice(index,1)
                        //     updateQuiz = true;
                        // }
                        if(flashcard.id == flashcardid) {
                            let newCurrentFlashcard = quiz.currentFlashcard;
                            if(quiz.currentFlashcard >= quiz.flashcards.length - 1) {
                                newCurrentFlashcard--
                            }
                            quizes = [
                                ...appContext.quizes.slice(0, quizindex),
                                {
                                    ...appContext.quizes[quizindex],
                                    currentFlashcard: newCurrentFlashcard,
                                    flashcards: [
                                        ...appContext.quizes[quizindex].flashcards.slice(0, index),
                                        ...appContext.quizes[quizindex].flashcards.slice(index+1)
                                    ]
                                },
                                ...appContext.quizes.slice(quizindex+1)
                            ]
                        }
                    })
                })
                return quizes;
                
            }
            let flashcardindex = getFlashcardIndex(appContext.subjects, flashcardid, prevflashcard.subject, prevflashcard.chapter)
            
            let newSubjects = [...appContext.subjects]
            
            let foundChapter = findNode(newSubjects, prevflashcard.subject, prevflashcard.chapter)
            if(foundChapter) {
                console.log(foundChapter)
                foundChapter.flashcards.splice(flashcardindex,1)
                changeAppStateContext({
                    ...appContext,
                    subjects: newSubjects,
                    quizes: removeDeletedFlashcards(appContext)
                })
                setFlashcard(baseflashcard)
            } else {
                console.log("Could not find flashcard to delete!")
            }
            
        }

        function addHint(hint) {
            return() => {
                setFlashcard({
                    ...stateflashcard,
                    hints: [
                        ...stateflashcard.hints,
                        hint
                    ]
                })
            }
        }

        function removeHint(index) {
            return () => {
                
                setFlashcard({
                    ...stateflashcard,
                    hints: [
                        ...stateflashcard.hints.slice(0, index),
                        ...stateflashcard.hints.slice(index + 1)
                    ]
                })
            }
        }

        function changeField(fieldName) {
            return (value) => {
                setFlashcard({
                    ...stateflashcard,
                    [fieldName]: value
                })
            }
        }

        function changeFieldOnEvent(fieldName) {
            return (e) => {
                let value = e.target.value;
                changeField(fieldName)(value)
            }
        }

        function handleHintChange(e) {
            setHint(e.target.value);
        }

        return (<div className={FlashCardEditorCSS["editor-container"]}>
            <div className={FlashCardEditorCSS.editorsubcontainer}>
                
            
                <div className={FlashCardEditorCSS.inputcontainer}>
                    <label className={FlashCardEditorCSS.label}>Question: </label>
                    <input className={FlashCardEditorCSS.input} type="text" onChange={changeFieldOnEvent("question")} value={stateflashcard.question}></input>
                </div>
                <div className={FlashCardEditorCSS.inputcontainer}>
                    <label className={FlashCardEditorCSS.label}>Answer: </label>
                    <ContentEditor className={FlashCardEditorCSS.textarea}  onChange={changeField("answer")} value={stateflashcard.answer}></ContentEditor>
                </div>
                <div className={FlashCardEditorCSS.inputcontainer}>
                    <label className={FlashCardEditorCSS.label}>Subject: </label>
                    <UpdatableSelect value={stateflashcard.subject} dropdownList={subjects} onSelectChange={changeField("subject")}></UpdatableSelect>
                </div>
                <div className={FlashCardEditorCSS.inputcontainer}>
                    <label className={FlashCardEditorCSS.label}>Chapter: </label>
                    <UpdatableSelect value={stateflashcard.chapter} dropdownList={chapters} onSelectChange={changeField("chapter")}></UpdatableSelect>
                </div>
                <div className={FlashCardEditorCSS.inputcontainer}>
                    <label className={FlashCardEditorCSS.label}>Hints: </label>
                    <ul className={FlashCardEditorCSS.hintul}>
                        {stateflashcard.hints.map((hint, i) => {
                            return <li className={FlashCardEditorCSS.hintli} key={'hint-list-item-'+i}>
                                <div className={FlashCardEditorCSS.hint}>{hint}</div><button className={FlashCardEditorCSS.hintdeletebtn} onClick={removeHint(i)}>Delete</button></li>
                        })}
                    </ul>
                </div>
                <div className={FlashCardEditorCSS.inputcontainer}>
                    <label className={FlashCardEditorCSS.label}>Hint: </label>
                    <textarea className={FlashCardEditorCSS.hinttextarea}  onChange={handleHintChange} value={hint}></textarea>
                    <button className={FlashCardEditorCSS.hintbtn} onClick={addHint(hint)}>Add hint</button>
                </div>
                <div className={FlashCardEditorCSS.submitbuttonscontainer}>
                    <button className={FlashCardEditorCSS.submitbtn} onClick={addFlashcard}>Create New</button>
                    {stateflashcard.id? <button className={FlashCardEditorCSS.submitbtn} onClick={updateFlashcard}>Update</button>: null}
                    {stateflashcard.id? <button className={FlashCardEditorCSS.submitbtn} onClick={deleteFlashcard}>Delete</button>: null}
                </div>
                
            </div>
        </div>)
    
}

export default FlashcardEditor;