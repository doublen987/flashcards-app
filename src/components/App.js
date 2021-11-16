import React, {Component, useState} from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Editor from './Editor/Editor';
import SetEditor from './Editor/SetEditor/SetEditor';
import QuizContainer from './Quiz/QuizContainer';
import Nav from './Nav';
import Footer from './Footer'
import { arrayFromMap, mapFromArray } from './util';

export const AppStateContext = React.createContext()
export const ChangeAppStateContext = React.createContext();


var random = Date.now();

let appInit = {
    subjects: [
        {
            "id": 0,
            "name": "Matematika 2"
        },
        {
            "id": 1,
            "name": "Projektovanje Softvera"
        }
    ],
    chapters: [
        {
            "id": 0,
            "subjectid": 0,
            "name":"Srednja vrednost",
        }
    ],
    flashcards: new Map([[""+random+1, {
        id: ""+random+1,
        question: "Sta je lagranzova teorija?",
        answer: "Lagranzova teorija je...",
        subject: "Matematika 2",
        chapter: "Srednja vrednost",
        hints: [
            "hint1", 
            "hint2",
            "hint3"
        ]
    }],
    [""+random+2, {
        id: ""+random+2,
        question: "Integralna suma",
        subject: "Matematika 2",
        chapter: "Srednja vrednost",
        answer: "Integralna suma je...",
        hints: [
            "hint1", 
            "hint2",
            "hint3"
        ]
    }],
    [""+random+3,{
        id: ""+random+3,
        question: "Dovoljna statistika?",
        subject: "Statistika",
        chapter: "Dovoljnost statistika",
        answer: "Dovoljna statistika je ona koji ima sve informacije iz originalne statistike",
        hints: [
            "hint1", 
            "hint2",
            "hint3"
        ]
    }],
    [""+random+4, {
        id: ""+random+4,
        question: "Efikasna ocena",
        subject: "Statistika",
        chapter: "Ocene",
        answer: "Efikasna ocena je ona sa najmanjom varijansom",
        hints: [
            "hint1", 
            "hint2",
            "hint3"
        ]
    }]]),
    sets: [
        {
            id: 0,
            name: "Matematika 2",
            subjects: new Map()
        },
        {
            id: 1,
            name: "Statistika",
            subjects: new Map()
        }
    ],
    quizes: [
        {
            id: 0,
            name: "Quiz 1",
            setid: 0,
            currentFlashcard: 0,
            flashcards: [
                {
                    id: 0,
                    question: "Sta je lagranzova teorija?",
                    answer: "Lagranzova teorija je...",
                    hints: [
                        "hint1sdcasdgdfbfgdhgghfghgfghfghsdfghfghgshhghfgshfghsfghgfhfghfgshfhfghgfhgfdhdhfgbdgfbgfghntyhjyjtythtyhthfsgdfgfdgas", 
                        "hint2"
                    ]
                },
                {
                    id: 1,
                    question: "Integralna suma",
                    answer: "Integralna suma je..."
                },
                {
                    id: 2,
                    question: "Dovoljna statistika?",
                    answer: "Dovoljna statistika je ona koji ima sve informacije iz originalne statistike"
                }
            ]
        },
        {
            id: 1,
            name: "Quiz 2",
            setid: 0,
            currentFlashcard: 0,
            flashcards: [
                {
                    id: 0,
                    question: "Dovoljna statistika?",
                    answer: "Dovoljna statistika je ona koji ima sve informacije iz originalne statistike"
                }
            ]
        }
    ]
}

function App() {
    //if(!localStorage.getItem("appState")) {
    //    localStorage.setItem("appState", JSON.stringify(appInit))
    //}
    //saveState(appInit)

    //let tmpState = JSON.parse(localStorage.getItem("appState"))
    let tmpState = appInit
    tmpState.flashcards = mapFromArray(tmpState.flashcards)
    console.log(tmpState)

    const [appState, changeAppState] = useState(tmpState)

    function saveState(state) {
        let tmpState = {
            ...state,
            flashcards: arrayFromMap(state.flashcards)
        }
        localStorage.setItem("appState", JSON.stringify(tmpState))
    }

    function updateState(newState) {
        saveState(newState)
        changeAppState(newState)
    }

    return (
        <AppStateContext.Provider value={appState}>
            <ChangeAppStateContext.Provider value={updateState}>
                <div>
                    <Router>
                        <Nav></Nav>
                        <Switch>
                            <Route path="/editor">
                                <Editor></Editor>
                            </Route>
                            <Route path="/quiz">
                                <QuizContainer></QuizContainer>
                            </Route>
                            
                        </Switch>
                    </Router>
                </div>
            </ChangeAppStateContext.Provider>
        </AppStateContext.Provider>
    );
}

export default App;