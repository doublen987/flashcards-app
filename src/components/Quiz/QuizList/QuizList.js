import React, { Component } from "react";
import { useState, useContext, useEffect } from "react";
import { AppStateContext } from "../../App";
import { Link, useParams } from "react-router-dom";
import QuizListCSS from './QuizList.module.css'

const QuizList = function(props) {
    const appContext  = useContext(AppStateContext);
    
    const [state,setState] = useState(function getInitialState() {
        for(let i = 0; i < appContext.quizes.length; i++) {
            let quiz = appContext.quizes[i];
            if(quiz.id === parseInt(props.quizid)) {
                return {
                    selectedQuiz: parseInt(props.quizid),
                }
            }
        }
        return {
            selectedQuiz: null
        }
    });
    
    

    function onClick(set) {
        return () => {
            setState({
                state,
                selectedQuiz: set
            })
        }
    }
    return(
        <div className={QuizListCSS["list-container"]}>
            <ul className={QuizListCSS.quizul}>
            {appContext.quizes.map(quiz => 
                 <Link key={'quiz-link-'+quiz.id} className={`${quiz.id===state.selectedQuiz? QuizListCSS['quizlink-selected']: QuizListCSS.quizlink}`}  to={`/quiz/${quiz.id}`}>
                <li key={'quiz-list-item-'+quiz.id} className={`${QuizListCSS.li}`}>
                   {quiz.name}
                </li>
                </Link>
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