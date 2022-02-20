import React, { Component, useContext, useEffect } from "react";
import { ChangeAppStateContext, AppStateContext } from '../../App'
import { getSubjectsMapFromFlashcards, arrayFromMap, mapFromArray } from '../../util'
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

        let flashcards = arrayFromMap(appContext.flashcards)

        const subjectsMap =  getSubjectsMapFromFlashcards(flashcards)
        
        const [stateflashcard, setFlashcard] = React.useState(function getInitialState() {
                for(let j = 0; j < flashcards.length; j++) {
                    if(flashcards[j].id === flashcardid) {
                        return {
                            ...baseflashcard,
                            ...flashcards[j]
                        };
                    }
                }
                
                return baseflashcard;
            
            
        })

        useEffect(() => {
            let newflashcard = flashcards.find(flashcard => flashcard.id === props.flashcardid)
            if(props.flashcardid && newflashcard) {
                setFlashcard(newflashcard)
            } else {
                setFlashcard(baseflashcard)
            }
        }, [props.flashcardid])


        //Get all available subjects and chapters from the subjects map
        let subjects = Array.from(subjectsMap.keys())
        let chapters = []
        if(subjectsMap.has(stateflashcard.subject))
            chapters = Array.from(subjectsMap.get(stateflashcard.subject).keys())

        function addFlashcard() {
            let newid = ""+Date.now()

            let subjects = new Map(appContext.subjects)
            subjects.forEach(subject => {
                console.log(subject.chapters)
                subject.chapters = mapFromArray(subject.chapters)
            })
            // let bla = new Map(mapFromArray(subjects.get("Matematika 2").chapters))
            // console.log(bla)
            // subjects.set("Matematika 2", {...subjects.get("Matematika 2"), chapters: bla} )
            
            if(stateflashcard.subject !== "") {
                if(subjects.has(stateflashcard.subject)) {
                    let subject = subjects.get(stateflashcard.subject)
                    if(!subject.chapters.has(stateflashcard.chapter)) {
                        
                        subject.chapters.set(stateflashcard.chapter, {
                            subject: stateflashcard.subject,
                            position: chapters.size,
                            name: stateflashcard.chapter
                        })
                    } 
                } else {
                    subjects.set(stateflashcard.subject, {
                        name: stateflashcard.subject,
                        chapters: new Map([["Other", {
                            subject: stateflashcard.subject,
                            position: 0,
                            name: "Other"
                        }]])
                    })
                }
            } 

            let position = -1;
            appContext.flashcards.forEach((flashcard) => {
                if(flashcard.subject === stateflashcard.subject && flashcard.chapter == stateflashcard.chapter && position < flashcard.position) {
                    position = flashcard.position;
                }
            })

            console.log(appContext)

            changeAppStateContext({
                ...appContext,
                flashcards: new Map(
                    appContext.flashcards.set(newid, {
                        ...stateflashcard,
                        position: position + 1,
                        id: newid
                    })
                )
            })
            setFlashcard(baseflashcard)
        }

        function updateFlashcard() {

            changeAppStateContext({
                ...appContext,
                flashcards: new Map(
                    appContext.flashcards.set(flashcardid,stateflashcard)
                )
            })
            setFlashcard(baseflashcard)
        }

        function deleteFlashcard() {
            let newFlashcards = new Map(appContext.flashcards)
            newFlashcards.forEach((flashcard) => {
                if(flashcard.subject === stateflashcard.subject && flashcard.chapter == stateflashcard.chapter) {
                    if(flashcard.position > stateflashcard.position)
                        newFlashcards.set(flashcard.id, {
                            ...flashcard,
                            position: flashcard.position - 1
                        })
                }
            })
            newFlashcards.delete(flashcardid)

            changeAppStateContext({
                ...appContext,
                flashcards: newFlashcards
            })
            setFlashcard(baseflashcard)
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