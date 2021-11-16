import React, { Component } from "react";
import { useState, useContext, useEffect } from "react";
import { AppStateContext } from "../../App";
import { Link, useParams } from "react-router-dom";
import SetListCSS from './SetList.module.css'

const SetList = function(props) {
    const appContext  = useContext(AppStateContext);
    
    const [state,setState] = useState(function getInitialState() {
        for(let i = 0; i < appContext.sets.length; i++) {
            let set = appContext.sets[i];
            if(set.id === parseInt(props.setid)) {
                return {
                    selectedSet: parseInt(props.setid),
                }
            }
        }
        return {
            selectedSet: null
        }
    });
    
    

    function onClick(set) {
        return () => {
            setState({
                state,
                selectedSet: set
            })
        }
    }
    return(
        <div className={SetListCSS["list-container"]}>
            <ul className={SetListCSS.setul}>
            {appContext.sets.map(set => 
                <li key={'set-list-item-'+set.id} className={`${SetListCSS.li}`}>
                    <Link key={'set-link-'+set.id} className={`${set.id===state.selectedSet? SetListCSS['setlink-selected']: SetListCSS.setlink}`}  to={`/editor/set/${set.id}`}>{set.name}</Link>
                </li>
            )}
            </ul> 
        </div>
    );
}

export default SetList;