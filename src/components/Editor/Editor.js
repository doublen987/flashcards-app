import React from "react";
import { useContext, useCallback, useMemo } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { AppStateContext } from "../App";
import FlashcardList from "./QuestionsList/FlashcardList";
import FlashcardEditor from "./FlashcardEditor/FlashcardEditor";
import SetEditor from "./SetEditor/SetEditor";
import SetList from "./SetEditor/SetList";
import { Redirect } from "react-router-dom";
import {arrayFromMap, findFlashcardByIndex} from '../util'

const Editor = function(props) {
    
    let {path, url} = useRouteMatch();
    const appContext = useContext(AppStateContext);
    let flashcards = appContext.subjects

    const render = useCallback(
        (props) => {
            console.log(props.match.params.flashcardid)
            
            let redirect = <Redirect to={`/editor`}></Redirect>;
           // console.log(findFlashcardByIndex(appContext.subjects, props.match.params.flashcardid))
            if(findFlashcardByIndex(appContext.subjects, props.match.params.flashcardid))
              redirect = <div>
                  <FlashcardList flashcardid={props.match.params.flashcardid} flashcards={flashcards}></FlashcardList>
                  <FlashcardEditor flashcardid={props.match.params.flashcardid}></FlashcardEditor>
              </div>;
            return(
                {...redirect}
          )},
        [1]
    );

    const routeEditor = useMemo(() => <Route path={`${path}/flashcard/:flashcardid`} render={render}/>, []);

    return (<div>
            <Switch>
                {routeEditor}
                <Route path={path}>
                    <div>
                        <FlashcardList flashcards={flashcards}></FlashcardList>
                        <FlashcardEditor></FlashcardEditor>
                    </div>
                </Route>
            </Switch>
    </div>)

}

export default Editor;