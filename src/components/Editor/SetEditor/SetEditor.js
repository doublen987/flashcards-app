import React, { Component, createContext, useContext } from "react";
import { AppStateContext, ChangeAppStateContext } from '../../App'
import FlashcardSelectionList from './FlashcardSelectionList'
import SetList from "./SetList";
import { useParams } from 'react-router-dom'
import SetEditorCSS from './SetEditor.module.css'

export const ChangeSetEditorStateContext = createContext();
export const SetEditorStateContext = createContext();


function SetEditor(props) {
        let setid = parseInt(props.setid);

        let set = {
            name: "",
            subjects: new Map()
        };

        const changeAppContext = useContext(ChangeAppStateContext);
        const appContext = useContext(AppStateContext);
        
        const [stateset, setSet] = React.useState(function getInitialState() {
            for(let i = 0; i < appContext.sets.length; i++) {
                let curset = appContext.sets[i];
                if(curset.id === setid) {
                    
                    return appContext.sets[i];
                }
            }
            return set;
        })


        function addSet() {
            let sets = [
                ...appContext.sets
            ]
            let setId = sets.push(stateset) - 1
            sets[setId].id = setId;

            changeAppContext({
                ...appContext,
                sets: sets
            })
        }
        function updateSet() {

            let newState = {
                ...appContext,
                sets: appContext.sets.map((set) => {
                    if(set.id === setid) {
                        return stateset;
                    } else {
                        return set
                    }
                })
            }

            changeAppContext(newState)
        }
        function changeField(fieldName) {
            return (e) => {
                let value = e.target.value;
                setSet({
                    ...stateset,
                    [fieldName]: value
                })
            }
        }
        

        return (
        <SetEditorStateContext.Provider value={stateset}>
            <ChangeSetEditorStateContext.Provider value={setSet}>
                <div className={SetEditorCSS["editor-container"]}>

                    <div className={SetEditorCSS.editorsubcontainer}>
                        
                    
                        <div className={SetEditorCSS.inputcontainer}>
                            <label className={SetEditorCSS.label}>Set name: </label>
                            <input className={SetEditorCSS.input} type="text" onChange={changeField("name")} value={stateset.name}></input>
                        </div>
                        <div className={SetEditorCSS.inputcontainer}>
                            <label className={SetEditorCSS.label}>Flashcards: </label>
                            <FlashcardSelectionList></FlashcardSelectionList>
                        </div>
                        <div className={SetEditorCSS.submitbuttonscontainer}>
                            <button className={SetEditorCSS.submitbtn} onClick={addSet}>Create New</button>
                            {stateset.id != undefined? <button className={SetEditorCSS.submitbtn} onClick={updateSet}>Update</button>: null}
                            {stateset.id != undefined? <button className={SetEditorCSS.submitbtn} onClick={()=>{}}>Delete</button>: null}
                        </div>
                        
                    </div>
                </div>
            </ChangeSetEditorStateContext.Provider>
        </SetEditorStateContext.Provider>
        )
    
}

export default SetEditor;