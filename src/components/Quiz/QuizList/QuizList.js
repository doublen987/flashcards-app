import React, { Component } from "react";
import { useState, useContext, useEffect } from "react";
import { AppStateContext, ChangeAppStateContext } from "../../App";
import { shuffleFlashcards} from '../utils/index'
import { Link, useParams } from "react-router-dom";
import QuizListCSS from './QuizList.module.css'

const QuizList = function(props) {
    const appContext  = useContext(AppStateContext);
    const changeAppContext = useContext(ChangeAppStateContext)
    
    const [state,setState] = useState(function getInitialState() {
        for(let i = 0; i < appContext.quizes.length; i++) {
            let quiz = appContext.quizes[i];
            if(quiz.id === parseInt(props.quizid)) {
                return {
                    selectedQuiz: parseInt(props.quizid),
                    rightClickedQuiz: null
                }
            }
        }
        return {
            selectedQuiz: null,
            rightClickedQuiz: null
        }
    });
    
    
    function refreshQuiz(quizid) {
        return () => {
            let quiz = appContext.quizes[quizid]
            let newFlashcards = shuffleFlashcards("random", quiz.flashcards)
            changeAppContext({
                ...appContext,
                quizes: [
                    ...appContext.quizes.slice(0, quizid),
                    {
                        ...appContext.quizes[quizid],
                        currentFlashcard: 0,
                        flashcards: newFlashcards.map(flashcard => {flashcard.answered=false; return flashcard;})
                    },
                    ...appContext.quizes.slice(quizid + 1)
                ] 
            })

        }
    }

    function deleteQuiz(quizid) {
        return () => {
            changeAppContext({
                ...appContext,
                quizes: [
                    ...appContext.quizes.slice(0, quizid),
                    ...appContext.quizes.slice(quizid + 1).map(quiz => {quiz.id = quiz.id - 1; return quiz})
                ] 
            })

        }
    }

    function removeRightClickModal() {
        setState({
            ...state,
            rightClickedQuiz: null,
        })
    }

    function onRightClick(quizid) {
        return (e) => {
            e.preventDefault();
            console.log("bla")
            setState({
                ...state,
                rightClickedQuiz: quizid,
                rightClickX: e.clientX,
                rightClickY: e.clientY,
            })
        }
    }
    return(
        <div className={QuizListCSS["list-container"]}>
            <ul className={QuizListCSS.quizul}>
            {appContext.quizes.map(quiz => <>
                 <Link 
                    key={'quiz-link-'+quiz.id} 
                    className={`${quiz.id===state.selectedQuiz? QuizListCSS['quizlink-selected']: QuizListCSS.quizlink}`}  
                    to={`/quiz/${quiz.id}`}
                    onContextMenu={onRightClick(quiz.id)}    
                >
                    
                <li key={'quiz-list-item-'+quiz.id} className={`${QuizListCSS.li}`}>
                   {quiz.name}
                </li>
                </Link>
                <div 
                    onClick={removeRightClickModal}
                    className={QuizListCSS.rightclickmodalbackground}
                    style={state.rightClickedQuiz === quiz.id ? {display: "unset"} : {display: "none"}}    
                >

                </div>
                <div
                    onContextMenu={(e) => {e.preventDefault()}} 
                    className={QuizListCSS.rightclickmodal} style={state.rightClickedQuiz === quiz.id ? {display: "unset", top: state.rightClickY, left: state.rightClickX} : {display: "none"}}>
                    <a onClick={refreshQuiz(quiz.id)} >Refresh</a>
                    <a onClick={()=>{}} >Update</a>
                    <a onClick={deleteQuiz(quiz.id)} >Delete</a>
                </div>
                </>
            )}
            <Link key={'quiz-link-new-quiz'} className={`${props.quizid?  QuizListCSS.quizlink: QuizListCSS['quizlink-selected']}`}  to={`/quiz`}>
                <li key={'quiz-list-item-new-quiz'} className={`${QuizListCSS.li}`}>
                    Create new quiz!
                </li>
            </Link>
            </ul> 
        </div>
    );
}

export default QuizList;