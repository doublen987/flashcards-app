import React from "react";
import { useState, useContext, useEffect } from "react";
import { AppStateContext } from "../../App";
import { Link } from "react-router-dom";
import FlashCardListCSS from './FlashcardList.module.css'
import { functionGetSubjectsMapFromFlashcards, stringInitialized } from '../../util'

const FlashcardList = function(props) {
    
    const [state,setState] = useState(function getInitialState() {
        let subjectsMap = new Map();
        subjectsMap.set("other", {
            selected: false,
            flashcards: []
        })
        props.flashcards.forEach(flashcard => {
            let selected = false;
            if(flashcard.id === props.flashcardid) 
                selected = true;
            //If the flashcard doesnt have a subject add it to the "other" subtree
            if(!stringInitialized(flashcard.subject)) {
                subjectsMap.set("other", {
                    ...subjectsMap.get("other"),
                    selected: subjectsMap.get("other").selected? true : selected,
                    flashcards: [
                        ...subjectsMap.get("other").flashcards,
                        {
                            ...flashcard,
                            selected: selected
                        }
                        
                ]})
            } else {
                let chaptersMap;
                //if the flashcards subject isnt added yet add it
                if(!subjectsMap.has(flashcard.subject)) {
                    chaptersMap = new Map();
                    chaptersMap.set("other", {
                        selected: selected,
                        flashcards: []
                    })
                    subjectsMap.set(flashcard.subject, {
                        selected: selected,
                        chapters: chaptersMap
                    }); 
                } else {
                    subjectsMap.get(flashcard.subject).selected = subjectsMap.get(flashcard.subject).selected? true: selected
                    chaptersMap = subjectsMap.get(flashcard.subject).chapters
                }
                if(!stringInitialized(flashcard.chapter)) {
                    chaptersMap.set("other", {
                        ...chaptersMap.get("other"),
                        selected: chaptersMap.get("other").selected? true: selected,
                        flashcards: [
                            ...chaptersMap.get("other").flashcards,
                            {
                                selected: selected,
                                ...flashcard
                            }
                        ]
                    })
                } else {
                    if(chaptersMap.has(flashcard.chapter)) {
                        let chapter = chaptersMap.get(flashcard.chapter); 
                        chapter.selected = chapter.selected? true : selected
                        chapter.flashcards.push({
                            ...flashcard,
                            selected: selected
                        })
                    } else {
                        chaptersMap.set(flashcard.chapter, {
                            selected: selected,
                            flashcards: [{
                                ...flashcard,
                                selected: selected
                            }]
                        })
                    }
                }
            }
        });
        return {
            subjects: subjectsMap
        }
    });
    
    function onSelectSubject(subjectName) {
        return (e) => {
            let checked = e.target.checked
            setState({
                ...state,
                subjects: new Map(state.subjects.set(subjectName, {
                    ...state.subjects.get(subjectName),
                    selected: !state.subjects.get(subjectName).selected
                }))
            })
        }
    }

    function onSelectChapter(subjectName, chapterName) {
        return (e) => {
            let checked = e.target.checked
            setState({
                ...state,
                subjects: new Map(state.subjects.set(subjectName, {
                    ...state.subjects.get(subjectName),
                    chapters: new Map(state.subjects.get(subjectName).chapters.set(chapterName, {
                        ...state.subjects.get(subjectName).chapters.get(chapterName),
                        selected: !state.subjects.get(subjectName).chapters.get(chapterName).selected
                    }))
                }))
            })
        }
    }

    let list = []
    state.subjects.forEach((subject, subjectName) => {
        
        let chapters = [];
        if(subjectName === "other") {
            chapters = subject.flashcards.map(flashcard => {
                return (<li key={'flashcard-list-item-'+flashcard.id} className={`${FlashCardListCSS.li}`}>
                    <Link 
                    key={'flashcard-link-'+flashcard.id} 
                    className={`${flashcard.id===state.selectedFlashcard? FlashCardListCSS['flashcardlink-selected']: FlashCardListCSS.flashcardlink}`}  
                    to={`/editor/flashcard/${flashcard.id}`}>
                        {flashcard.question}
                    </Link>
                </li>);
            })
        } else {
            subject.chapters.forEach((chapter, chapterName) => {
                chapters.push(
                <li 
                    className={FlashCardListCSS.chapterlistitem}
                    key={'chapter-'+subjectName+"-"+chapterName}>
                    <div 
                        key={'chapter-label-'+subjectName+"-"+chapterName} 
                        className={FlashCardListCSS.label} 
                        onClick={onSelectChapter(subjectName, chapterName)}>
                            {chapterName}
                    </div>
                    <ul key={'chapter-contents-list-'+subjectName+"-"+chapterName} className={`${FlashCardListCSS.ol} ${
                    chapter.selected? FlashCardListCSS.display_unset : FlashCardListCSS.display_none
                    }`}>
                    {chapter.flashcards.map(flashcard => {
                        return (
                        <li 
                            key={'flashcard-list-item-'+flashcard.id} 
                            className={`${FlashCardListCSS.li}`}>
                                <Link 
                                    key={'flashcard-link-'+flashcard.id} 
                                    className={`${FlashCardListCSS.flashcardlink}  ${flashcard.selected? FlashCardListCSS["flashcardlink-selected"] : null}`}  
                                    to={`/editor/flashcard/${flashcard.id}`}>
                                        {flashcard.question}
                                </Link>
                        </li>);
                    })}
                    </ul>
                </li>)
            })
        }
        

        list.push(
            <li className={FlashCardListCSS.subjectlistitem} key={'subject-list-item-'+subjectName}>
                <div key={'subject-label-'+subjectName} className={FlashCardListCSS.label} onClick={onSelectSubject(subjectName)}>{subjectName}</div>
                <ol key={'subject-contents-list-'+subjectName} className={`${FlashCardListCSS.ol} ${
                    subject.selected? FlashCardListCSS.display_unset : FlashCardListCSS.display_none
                    }`}>
                    {chapters}
                </ol>
            </li>
        )
        
        
    })

    return (
        <div className={FlashCardListCSS["list-container"]} >
            <ul className={FlashCardListCSS.ullistcontainer}>
            {list}
            </ul>
        </div>
        
    );
}

export default FlashcardList;