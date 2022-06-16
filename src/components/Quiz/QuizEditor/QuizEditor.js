import React, { Component, createContext, useContext } from "react";
import { AppStateContext, ChangeAppStateContext } from '../../App'
import { useParams } from 'react-router-dom'
import FlashcardSelectionList from "./FlashcardSelectionList";
import QuizEditorCSS from './QuizEditor.module.css';

export const ChangeQuizEditorStateContext = createContext();
export const QuizEditorStateContext = createContext();

function random(array) {
    var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}
function randomRoundRobin(flashcards) {}
function inOrder(flashcards) {}

function shuffleFlashcards(shuffletype, flashcards) {
    switch (shuffletype) {
        case "random":
            return random(flashcards)
        case "in-order":
            return flashcards
        default: 
            return random(flashcards)
    }
}

function mapToArray(subjects) {
    let newSubjectsArray = [];
    subjects.forEach((subject, subjectName) => {
        if(subjectName === "other") {
            newSubjectsArray.push(...subject.flashcards)
        } else {
            subject.chapters.forEach((chapter) => {
                newSubjectsArray.push(...chapter.flashcards)
            })
        }
        
    })

    return newSubjectsArray;
}

function QuizEditor(props) {
        let quizid = parseInt(props.quizid);

        const changeAppContext = useContext(ChangeAppStateContext);
        const appContext = useContext(AppStateContext);
        
        let initQuiz = {
            name: "",
            id: null,
            shuffletype: "in-order",
            subjects: new Map(),
            currentFlashcard: 0,
        };

        const [quizState, setQuiz] = React.useState(initQuiz)


        function addQuiz() {
            let newSubjects = [];
            let newChapters = [];

            console.log(quizState.subjects)
            console.log(mapToArray(quizState.subjects))

            quizState.subjects.forEach((subject, subjectName) => {
                if(subject.selected) 
                    newSubjects.push({id: subjectName})
                subject.chapters.forEach((chapter, chapterName) => {
                    if(chapter.selected)
                        newChapters.push({id: chapterName, subject: subjectName})
                })
            })

            changeAppContext({
                ...appContext,
                quizes: [
                    ...appContext.quizes,
                    {
                        ...quizState,
                        id: appContext.quizes.length,
                        flashcards: shuffleFlashcards(quizState.shuffletype, mapToArray(quizState.subjects)),
                        subjects: newSubjects,
                        chapters: newChapters
                    }
                ]
            })
        }

        function removeQuiz() {
            changeAppContext({
                ...appContext,
                quizes: [
                    ...appContext.quizes.slice(0, props.quizid),
                    ...appContext.quizes.slice(props.quizid + 1)
                ]
            })
        }

        function changeField(fieldName) {
            return (e) => {
                let value = e.target.value;
                setQuiz({
                    ...quizState,
                    [fieldName]: value
                })
            }
        }

        return (
            <QuizEditorStateContext.Provider value={quizState}>
            <ChangeQuizEditorStateContext.Provider value={setQuiz}>
                <div className={QuizEditorCSS["editor-container"]}>
                    <div className={QuizEditorCSS.editorsubcontainer}>
                        <div className={QuizEditorCSS.inputcontainer}>
                            <label className={QuizEditorCSS.label}>Quiz name: </label>
                            <input className={QuizEditorCSS.input} type="text" onChange={changeField("name")} value={quizState.name}></input>
                        </div>
                        <div className={QuizEditorCSS.inputcontainer}>
                            <label className={QuizEditorCSS.label}>Flashcards: </label>
                            <FlashcardSelectionList></FlashcardSelectionList>
                        </div>
                        <div className={QuizEditorCSS.submitbuttonscontainer}>
                            <button className={QuizEditorCSS.submitbtn} onClick={addQuiz}>Create New</button>
                            {quizState.id? <button className={QuizEditorCSS.submitbtn} onClick={updateQuiz}>Update</button>: null}
                            {quizState.id? <button className={QuizEditorCSS.submitbtn} onClick={removeQuiz}>Delete</button>: null}
                        </div>
                        
                    </div>
                </div>
            </ChangeQuizEditorStateContext.Provider>
            </QuizEditorStateContext.Provider>
        )
    
}

export default QuizEditor;