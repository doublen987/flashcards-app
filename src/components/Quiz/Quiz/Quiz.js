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
                quiz = <div ref={node} className={QuizCSS.slideshow} onClick={showAnswer}>{appContext.quizes[quizid].flashcards[appContext.quizes[quizid].currentFlashcard].question}</div>
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
        <div className={QuizCSS.slideshowcontainer}>
            {quiz}    
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