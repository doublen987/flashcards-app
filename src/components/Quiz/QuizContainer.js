import React, { Component, useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import { Switch, Route, useRouteMatch } from "react-router";
import { AppStateContext, ChangeAppStateContext } from '../App'
import Quiz from "./Quiz/Quiz";
import QuizEditor from "./QuizEditor/QuizEditor";
import QuizCSS from './QuizContainer.module.css'
import QuizList from "./QuizList/QuizList";
import Aux from "../hoc/Aux";

function QuizContainer() {

        let {path, url} = useRouteMatch();
        const appContext = useContext(AppStateContext);

        return (<div className={QuizCSS.quizpage}>
            
            <Switch>
                <Route path={`${path}/:quizid`} render={(props) => {
                    console.log(props.match.params.quizid)
                  
                    let redirect = <Redirect to={`/quiz`}></Redirect>;
                    
                    if(appContext.quizes.find(quiz => quiz.id == props.match.params.quizid)) {
                        redirect = <Aux>
                            <QuizList key={"quizlist-" + props.match.params.quizid} quizid={props.match.params.quizid}></QuizList>
                            <Quiz key={"quiz-" + props.match.params.quizid} quizid={props.match.params.quizid}></Quiz>
                        </Aux>
                    }
                    
                    return(
                    {...redirect}
                )}}/>
                <Route path={"/quiz"}>
                    <Aux>
                        <QuizList></QuizList>
                        <QuizEditor></QuizEditor>
                    </Aux>
                    
                </Route>
                
            </Switch>
        </div>);
        
}

export default QuizContainer;