import React, { Component, useContext } from "react";
import { ChangeAppStateContext, AppStateContext } from '../../App'
import { getSubjectsMapFromFlashcards, arrayFromMap } from '../../util'
import { useParams } from 'react-router-dom'
import MultipleChoiceEditorCSS from './FlashcardEditor.module.css'
import UpdatableSelect from "../UpdatableSelect/UpdatableSelect";
import ContentEditor from "../ContentEditor/ContentEditor";

function MultipleChoiceEditor(props) {
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
        
        const [stateQuestion, setQuestion] = React.useState(function getInitialState() {
                console.log(flashcardid)
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

        let subjects = Array.from(subjectsMap.keys())
        let chapters = []
        if(subjectsMap.has(stateQuestion.subject))
            chapters = Array.from(subjectsMap.get(stateQuestion.subject).keys())

        function addFlashcard() {
            let newid = ""+Date.now()

            let subjects = new Map(appContext.subjects) 
            if(stateQuestion.subject !== "") {
                if(subjects.has(stateQuestion.subject)) {
                    let subject = subjects.get(stateQuestion.subject)
                    if(!subject.chapters.has(stateQuestion.chapter)) {
                        
                        subject.chapters.set(stateQuestion.chapter, {
                            subject: stateQuestion.subject,
                            position: chapters.size,
                            name: stateQuestion.chapter
                        })
                    } 
                } else {
                    subjects.set(stateQuestion.subject, {
                        name: stateQuestion.subject,
                        chapters: new Map([["Other", {
                            subject: stateQuestion.subject,
                            position: 0,
                            name: "Other"
                        }]])
                    })
                }
            } 

            let position = -1;
            appContext.flashcards.forEach((flashcard) => {
                if(flashcard.subject === stateQuestion.subject && flashcard.chapter == stateQuestion.chapter && position < flashcard.position) {
                    position = flashcard.position;
                }
            })

            changeAppStateContext({
                ...appContext,
                subjects: subjects,
                flashcards: new Map(
                    appContext.flashcards.set(newid, {
                        ...stateQuestion,
                        position: position + 1,
                        id: newid
                    })
                )
            })
            setQuestion(baseflashcard)
        }

        function updateFlashcard() {

            changeAppStateContext({
                ...appContext,
                flashcards: new Map(
                    appContext.flashcards.set(flashcardid,stateQuestion)
                )
            })
            setQuestion(baseflashcard)
        }

        function deleteFlashcard() {
            let newFlashcards = new Map(appContext.flashcards)
            newFlashcards.forEach((flashcard) => {
                if(flashcard.subject === stateQuestion.subject && flashcard.chapter == stateQuestion.chapter) {
                    if(flashcard.position > stateQuestion.position)
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
            setQuestion(baseflashcard)
        }

        function addHint(hint) {
            return() => {
                setQuestion({
                    ...stateQuestion,
                    hints: [
                        ...stateQuestion.hints,
                        hint
                    ]
                })
            }
        }

        function removeHint(index) {
            return () => {
                
                setQuestion({
                    ...stateQuestion,
                    hints: [
                        ...stateQuestion.hints.slice(0, index),
                        ...stateQuestion.hints.slice(index + 1)
                    ]
                })
            }
        }

        function changeField(fieldName) {
            return (value) => {
                setQuestion({
                    ...stateQuestion,
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

        return (<div className={MultipleChoiceEditorCSS["editor-container"]}>
            <div className={MultipleChoiceEditorCSS.editorsubcontainer}>
                
            
                <div className={MultipleChoiceEditorCSS.inputcontainer}>
                    <label className={MultipleChoiceEditorCSS.label}>Question: </label>
                    <input className={MultipleChoiceEditorCSS.input} type="text" onChange={changeFieldOnEvent("question")} value={stateQuestion.question}></input>
                </div>
                <div className={MultipleChoiceEditorCSS.inputcontainer}>
                    <label className={MultipleChoiceEditorCSS.label}>Answer: </label>
                    <ContentEditor className={MultipleChoiceEditorCSS.textarea}  onChange={changeField("answer")} value={stateQuestion.answer}></ContentEditor>
                </div>
                <div className={MultipleChoiceEditorCSS.inputcontainer}>
                    <label className={MultipleChoiceEditorCSS.label}>Subject: </label>
                    <UpdatableSelect value={stateQuestion.subject} dropdownList={subjects} onSelectChange={changeField("subject")}></UpdatableSelect>
                </div>
                <div className={MultipleChoiceEditorCSS.inputcontainer}>
                    <label className={MultipleChoiceEditorCSS.label}>Chapter: </label>
                    <UpdatableSelect value={stateQuestion.chapter} dropdownList={chapters} onSelectChange={changeField("chapter")}></UpdatableSelect>
                </div>
                <div className={MultipleChoiceEditorCSS.inputcontainer}>
                    <label className={MultipleChoiceEditorCSS.label}>Hints: </label>
                    <ul className={MultipleChoiceEditorCSS.hintul}>
                        {stateQuestion.hints.map((hint, i) => {
                            return <li className={MultipleChoiceEditorCSS.hintli} key={'hint-list-item-'+i}>
                                <div className={MultipleChoiceEditorCSS.hint}>{hint}</div><button className={MultipleChoiceEditorCSS.hintdeletebtn} onClick={removeHint(i)}>Delete</button></li>
                        })}
                    </ul>
                </div>
                <div className={MultipleChoiceEditorCSS.inputcontainer}>
                    <label className={MultipleChoiceEditorCSS.label}>Hint: </label>
                    <textarea className={MultipleChoiceEditorCSS.hinttextarea}  onChange={handleHintChange} value={hint}></textarea>
                    <button className={MultipleChoiceEditorCSS.hintbtn} onClick={addHint(hint)}>Add hint</button>
                </div>
                <div className={MultipleChoiceEditorCSS.submitbuttonscontainer}>
                    <button className={MultipleChoiceEditorCSS.submitbtn} onClick={addFlashcard}>Create New</button>
                    {stateQuestion.id? <button className={MultipleChoiceEditorCSS.submitbtn} onClick={updateFlashcard}>Update</button>: null}
                    {stateQuestion.id? <button className={MultipleChoiceEditorCSS.submitbtn} onClick={deleteFlashcard}>Delete</button>: null}
                </div>
                
            </div>
        </div>)
    
}

export default MultipleChoiceEditor;