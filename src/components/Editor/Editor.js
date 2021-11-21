import React from "react";
import { useContext } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { AppStateContext } from "../App";
import FlashcardList from "./FlashcardEditor/FlashcardList";
import FlashcardEditor from "./FlashcardEditor/FlashcardEditor";
import SetEditor from "./SetEditor/SetEditor";
import SetList from "./SetEditor/SetList";
import { Redirect } from "react-router-dom";
import {arrayFromMap} from '../util'

const Editor = function() {
    
    let {path, url} = useRouteMatch();
    const appContext = useContext(AppStateContext);
    let flashcards = arrayFromMap(appContext.flashcards)

    return (<div>
            <Switch>
                <Route path={`${path}/flashcard/:flashcardid`} render={(props) => {
                  console.log(props.match.params.flashcardid)
                  
                  let redirect = <Redirect to={`/editor`}></Redirect>;
                  if(appContext.flashcards.has(props.match.params.flashcardid))
                    redirect = <div>
                        <FlashcardList key={"flashcardlist-"+Date.now()} flashcardid={props.match.params.flashcardid} flashcards={flashcards}></FlashcardList>
                        <FlashcardEditor key={"flashcardeditor-" + props.match.params.flashcardid} flashcardid={props.match.params.flashcardid}></FlashcardEditor>
                    </div>;
                  return(
                      {...redirect}
                )}}/>
                <Route path={`${path}/set/:setid`} render={(props) => (
                    <div>
                        <SetList key={"setlist-" + props.match.params.setid} setid={props.match.params.setid}></SetList>
                        <SetEditor key={"seteditor-" + props.match.params.setid} setid={props.match.params.setid}></SetEditor>
                    </div>
                )}/>
                <Route path={`${path}/set`} render={(props) => (
                    <div>
                        <SetList key={"setlist-" + props.match.params.setid}></SetList>
                        <SetEditor key={"seteditor-" + props.match.params.setid}></SetEditor>
                    </div>
                )}/>
                <Route path={path}>
                    <div>
                        <FlashcardList key={"flashcardlist-"+Date.now()}flashcards={flashcards}></FlashcardList>
                        <FlashcardEditor></FlashcardEditor>
                    </div>
                </Route>
            </Switch>
    </div>)

}

export default Editor;