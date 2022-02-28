import React, { createRef, useContext, useEffect, useRef, useState } from 'react'
import {AppStateContext, ChangeAppStateContext} from '../../App'
import QuizCSS from './Quiz.module.css'

function Quiz(props) {
    let quizid = parseInt(props.quizid);

    const appContext = useContext(AppStateContext);
    const changeAppStateContext = useContext(ChangeAppStateContext)
    const [state, setState] = useState({ answerShown: false })
    const node = createRef()

    const renderMath = () => {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, node.current]);
    };

    useEffect(() => {
        
        renderMath();
    })

    let currentFlashcard = -1;
    if(appContext.quizes[quizid].currentFlashcard > -1 && appContext.quizes[quizid].currentFlashcard < appContext.quizes[quizid].flashcards.length) {
        currentFlashcard = appContext.quizes[quizid].currentFlashcard
    }

    let quiz = "";
    if( appContext.quizes[quizid]) {
        if(currentFlashcard > -1) {
            if(!state.answerShown)
                quiz = <div ref={node} className={QuizCSS.slideshow + " " + QuizCSS.slideshowQuestion} onClick={showAnswer}>{appContext.quizes[quizid].flashcards[appContext.quizes[quizid].currentFlashcard].question}</div>
            else 
                quiz = <div ref={node} className={QuizCSS.slideshow} onClick={showAnswer} dangerouslySetInnerHTML={{__html: appContext.quizes[quizid].flashcards[appContext.quizes[quizid].currentFlashcard].answer}}></div>
        }
        else {
            quiz = "Invalid flashcard pointer"
        }
    } else {
        quiz = "Quiz does not exist"
    }

    function showAnswer() {
        
        
        if(!appContext.quizes[quizid].flashcards[currentFlashcard].answered) {
            let date = new Date(Date.now())
            let year = date.getFullYear()
            let month = date.getMonth() + 1
            let day = date.getDate()
            console.log("year: " + year + " month: " + month + " day: " + day)

            let lastDay = appContext.stats.chronologicalData[appContext.stats.chronologicalData.length-1]
            if(appContext.stats.chronologicalData.length != 0 && lastDay.day === day) {
                lastDay.answered = lastDay.answered + 1
            } else {
                lastDay = {
                    year: year,
                    month: month,
                    day: day,
                    answered: 1
                }
                appContext.stats.chronologicalData.push(lastDay)
            }
        }

        changeAppStateContext({
            ...appContext,
            stats: {
                ...appContext.stats,
                chronologicalData: [
                    ...appContext.stats.chronologicalData
                ]
            },
            quizes: [
                ...appContext.quizes.slice(0, quizid),
                {
                    ...appContext.quizes[quizid],
                    flashcards: [
                        ...appContext.quizes[quizid].flashcards.slice(0, currentFlashcard),
                        {
                            ...appContext.quizes[quizid].flashcards[currentFlashcard],
                            answered: true
                        },
                        ...appContext.quizes[quizid].flashcards.slice(currentFlashcard+1),
                    ]
                },
                ...appContext.quizes.slice(quizid + 1)
            ]
        })
        setState({
            answerShown: !state.answerShown
        })
    }

    function showHint() {

        if(currentFlashcard > -1) {
            let flashcard = appContext.quizes[quizid].flashcards[currentFlashcard]
            let currentHint = null
            if(flashcard.currentHint != undefined) {
                if(flashcard.currentHint < flashcard.hints.length - 1)
                    currentHint = flashcard.currentHint + 1;
                else 
                    currentHint = 0;
            } else {
                if(flashcard.hints != undefined && flashcard.hints.length !== 0) {
                    currentHint = 0;
                }
            }
            changeAppStateContext({
                ...appContext,
                quizes: [
                    ...appContext.quizes.slice(0, quizid),
                    {
                        ...appContext.quizes[quizid],
                        flashcards: [
                            ...appContext.quizes[quizid].flashcards.slice(0, currentFlashcard),
                            {
                                ...appContext.quizes[quizid].flashcards[currentFlashcard],
                                currentHint: currentHint
                            },
                            ...appContext.quizes[quizid].flashcards.slice(currentFlashcard+1),
                        ]
                    },
                    ...appContext.quizes.slice(quizid + 1)
                ]
            })
        }
    }

    function onNext() {
        return () => {
            let newCurrentFlashcard = appContext.quizes[quizid].currentFlashcard + 1
            if(newCurrentFlashcard === appContext.quizes[quizid].flashcards.length) {
                newCurrentFlashcard--;
            }
            changeAppStateContext({
                ...appContext,
                answerShown: false,
                quizes: [
                    ...appContext.quizes.slice(0, quizid),
                    {
                        ...appContext.quizes[quizid],
                        currentFlashcard: newCurrentFlashcard
                    },
                    ...appContext.quizes.slice(quizid+1)
                ]
            })
            setState({
                answerShown: false
            })
        }
    }

    function onPrevious() {
        return () => {
            let newCurrentFlashcard = appContext.quizes[quizid].currentFlashcard - 1
            if(newCurrentFlashcard === -1) {
                newCurrentFlashcard++;
            }
            changeAppStateContext({
                ...appContext,
                answerShown: false,
                quizes: [
                    ...appContext.quizes.slice(0, quizid),
                    {
                        ...appContext.quizes[quizid],
                        currentFlashcard: newCurrentFlashcard
                    },
                    ...appContext.quizes.slice(quizid+1)
                ]
            })
            setState({
                answerShown: false
            })
        }
    }

    let hints = null;
    if(currentFlashcard > -1 && appContext.quizes[quizid].flashcards[currentFlashcard].hints != undefined) {
        hints = appContext.quizes[quizid].flashcards[currentFlashcard].hints.map((hint, hintindex) => {
            let currentHint = appContext.quizes[quizid].flashcards[currentFlashcard].currentHint
            let hintArrayLength = appContext.quizes[quizid].flashcards[currentFlashcard].hints.length
            if(currentHint > -1 && currentHint < hintArrayLength && hintindex <= currentHint) {
                return(<div key={"hint-"+hintindex} className={QuizCSS.hint}>{hint}</div>)
            } else {
                return null;
            }
        })
    }

    return (
        <div className={QuizCSS.quizcontainer}>
            <div className={QuizCSS.slideshowcontainer}>
                {quiz}    
                <div className={QuizCSS.flashcardcounter}>{(currentFlashcard+1) + "/" + appContext.quizes[quizid].flashcards.length}</div>
            </div>
            <div className={QuizCSS.btncontainer}>
                <button onClick={onPrevious()} className={QuizCSS.btnflashcard}>Previous</button>
                <button onClick={showHint} className={QuizCSS.btnflashcard}>Hint</button>
                <button onClick={onNext()} className={QuizCSS.btnflashcard}>Next</button>
            </div>
            <div className={QuizCSS.hintcontainer}>
                {hints}
            </div>
        </div>
        
    );
} 

export default Quiz;