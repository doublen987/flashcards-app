import React from "react";
import { useState, useContext, useEffect } from "react";
import { AppStateContext, ChangeAppStateContext } from "../../App";
import { Link } from "react-router-dom";
import FlashCardListCSS from './FlashcardList.module.css'
import { arrayFromMap, functionGetSubjectsMapFromFlashcards, stringInitialized } from '../../util'
import {sortableContainer, sortableElement, SortableHandle} from 'react-sortable-hoc';
import {arrayMoveImmutable} from 'array-move';
import Aux from "../../hoc/Aux";
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



const FlashcardList = function(props) {
    
    const appContext = useContext(AppStateContext)
    const changeAppStateContext = useContext(ChangeAppStateContext)

    

    function arrayToMap(flashcards) {
        let subjectsMap = new Map();
        subjectsMap.set("other", {
            selected: false,
            flashcards: []
        })
        flashcards.forEach(flashcard => {
            let selected = false;
            if(flashcard.id === props.flashcardid) 
                selected = true;
            //If the flashcard doesnt have a subject add it to the "other" subtree
            if(!stringInitialized(flashcard.subject)) {
                let tmpflashcards = subjectsMap.get("other").flashcards
                tmpflashcards[flashcard.position] = {
                    ...flashcard,
                    selected: selected
                }
                subjectsMap.set("other", {
                    ...subjectsMap.get("other"),
                    selected: subjectsMap.get("other").selected? true : selected,
                    flashcards: tmpflashcards
                })
            } else {
                let chaptersMap;
                //if the flashcards subject isnt added yet add it
                if(!subjectsMap.has(flashcard.subject)) {
                    chaptersMap = new Map();
                    chaptersMap.set("other", {
                        position: appContext.subjects.get(flashcard.subject).chapters.get("other").position,
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
                    let tmpflashcards = chaptersMap.get("other").flashcards
                    tmpflashcards[flashcard.position] = {
                        ...flashcard,
                        selected: selected
                    }
                    chaptersMap.set("other", {
                        ...chaptersMap.get("other"),
                        selected: chaptersMap.get("other").selected? true: selected,
                        flashcards: tmpflashcards
                    })
                } else {
                    if(chaptersMap.has(flashcard.chapter)) {
                        let chapter = chaptersMap.get(flashcard.chapter); 
                        chapter.selected = chapter.selected? true : selected
                        chapter.flashcards[flashcard.position] = {
                            ...flashcard,
                            selected: selected
                        }
                    } else {
                        let chapter = appContext.subjects.get(flashcard.subject).chapters.get(flashcard.chapter);
                        let tmpflashcards = []
                        tmpflashcards[flashcard.position] = {
                            ...flashcard,
                            selected: selected
                        }
                        chaptersMap.set(flashcard.chapter, {
                            position: chapter.position,
                            selected: selected,
                            flashcards: tmpflashcards
                        })
                    }
                }
            }
        });
        return subjectsMap;
    }

    const [state,setState] = useState(function getInitialState() {
        return {
            subjects: arrayToMap(props.flashcards)
        }
    });

    useEffect(() => {
        setState({
            subjects: arrayToMap(props.flashcards)
        })
    }, [props.flashcards])

    const DragHandle = SortableHandle(() => <FontAwesomeIcon className={FlashCardListCSS.draghandle} icon={faBars}/>);

    const SortableItem = sortableElement(({children, className}) => { 
        return <li className={className}>{children}</li>
    });

    const SortableContainer = sortableContainer(({children, className}) => {
        return (
            <ul className={className}>
                {children}
            </ul>
        );
    });
    
    function onSelectSubject(subjectName) {
        return (e) => {
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

    function onChangeOrderChapter(subjectName) {
        return ({oldIndex, newIndex}) => {

            if(oldIndex === newIndex) {
                return;
            }
            let newChapters = new Map(appContext.subjects.get(subjectName).chapters);
            
            newChapters.forEach(chapter => {
                if(oldIndex === chapter.position) {
                    chapter.position = newIndex;
                    return
                }
                if(oldIndex < newIndex) {
                    if(chapter.position > oldIndex && chapter.position <= newIndex) {
                        chapter.position = chapter.position - 1;
                    } 
                } else {
                    if(chapter.position < oldIndex && chapter.position >= newIndex) {
                        chapter.position = chapter.position + 1;
                    }
                }
            })

            let newSubjects = new Map(appContext.subjects);
            newSubjects.set(subjectName, {
                ...appContext.subjects.get(subjectName),
                chapters: newChapters
            })
            changeAppStateContext({
                ...appContext,
                subjects: newSubjects
            })
            let newStateSubjects = new Map(state.subjects)
            let stateSubject = newStateSubjects.get(subjectName)
            newChapters.forEach((chapter, chapterName) => {
                if(stateSubject.chapters.get(chapterName)) {
                    stateSubject.chapters.get(chapterName).position = chapter.position
                }
            })
            setState({
                ...state,
                subjects: newStateSubjects
            })
        }
    }

    function onChangeOrderFlashcard(subjectName, chapterName) {
        return ({oldIndex, newIndex}) => {
            console.log("old: " + oldIndex + " new: " + newIndex)
            if(oldIndex === newIndex) {
                return;
            }
            let newFlashcards = new Map(appContext.flashcards);
            
            newFlashcards.forEach(flashcard => {
                if(flashcard.subject === subjectName && flashcard.chapter === chapterName) {
                    if(oldIndex === flashcard.position) {
                        flashcard.position = newIndex;
                        return
                    }
                    if(oldIndex < newIndex) {
                        if(flashcard.position > oldIndex && flashcard.position <= newIndex) {
                            flashcard.position = flashcard.position - 1;
                        } 
                    } else {
                        if(flashcard.position < oldIndex && flashcard.position >= newIndex) {
                            flashcard.position = flashcard.position + 1;
                        }
                    }
                }
            })

            changeAppStateContext({
                ...appContext,
                flashcards: newFlashcards
            })

            setState({
                ...state,
                subjects: arrayToMap(newFlashcards)
            })
        }
    }

    let list = []
    state.subjects.forEach((subject, subjectName) => {
        
        let chapters = [];
        if(subjectName === "other") {
            subject.flashcards.forEach((flashcard, index) => {
                chapters[flashcard.position] =  (
                    <SortableItem 
                        key={`sortable-other-flashcard-${index}`} 
                        index={index}
                        className={`${FlashCardListCSS["li"]}`}
                    >
                        <Link 
                        key={'flashcard-link-'+flashcard.id} 
                        className={`${flashcard.id===state.selectedFlashcard? 
                            FlashCardListCSS['flashcardlink-selected']: 
                            FlashCardListCSS["flashcardlink"]}`}  
                        to={`/editor/flashcard/${flashcard.id}`}>
                            {(index+1) + ". " +flashcard.question}
                        </Link>
                    </SortableItem>
                );
            })
        } else {
            let chapterIndex = 0;
            subject.chapters.forEach((chapter, chapterName) => {
                chapters[chapter.position] = (
                //Chapters
                    <SortableItem 
                        key={`sortable-chapter-item-${chapter.position}`} 
                        index={chapter.position}
                        className={FlashCardListCSS["chapterlistitem"]}
                    >
                        <div 
                            className={FlashCardListCSS["label"]} 
                            key={'chapter-label-'+subjectName+"-"+chapterName} 
                            onClick={onSelectChapter(subjectName, chapterName)}>
                                <DragHandle></DragHandle>{(chapter.position+1) + ". " + chapterName}
                        </div>
                        {/* Flashcards */}
                        <SortableContainer useDragHandle
                            className={`${FlashCardListCSS["ol"]} 
                                        ${chapter.selected? FlashCardListCSS["display_unset"] : 
                                                            FlashCardListCSS["display_none"]}`}
                            key={'chapter-contents-list-'+subjectName+"-"+chapterName} 
                            onSortEnd={onChangeOrderFlashcard(subjectName, chapterName)}
                        >
                            {chapter.flashcards.map((flashcard, index) => {
                                return (
                                <SortableItem 
                                    key={`sortable-flashcard-item-${flashcard.position}`} 
                                    index={flashcard.position}
                                    className={`${FlashCardListCSS["flashcardli"]}
                                                ${flashcard.selected? FlashCardListCSS["flashcardli-selected"] : null}`}    
                                >
                                    <DragHandle></DragHandle>
                                    <Link 
                                        className={`${FlashCardListCSS["flashcardlink"]}  
                                                    ${flashcard.selected? FlashCardListCSS["flashcardlink-selected"] : null}`}  
                                        key={'flashcard-link-'+flashcard.id} 
                                        to={`/editor/flashcard/${flashcard.id}`}>
                                            {(flashcard.position + 1) + ". " +flashcard.question}
                                    </Link>
                                </SortableItem>);
                            })}
                        </SortableContainer>
                    </SortableItem>
                )
                chapterIndex++;
            })
        }
        
        list.push(
            //Subjects
            <li 
                className={FlashCardListCSS["subjectlistitem"]} 
                key={'subject-list-item-'+subjectName}
            >
                <div 
                    className={FlashCardListCSS["label"]}
                    key={'subject-label-'+subjectName}  
                    onClick={onSelectSubject(subjectName)}
                >
                    {subjectName}
                </div>
                <SortableContainer  useDragHandle
                    className={`${FlashCardListCSS["ol"]} 
                                ${subject.selected? FlashCardListCSS["display_unset"] : 
                                                    FlashCardListCSS["display_none"]}`}
                    key={'subject-contents-list-'+subjectName} 
                    onSortEnd={onChangeOrderChapter(subjectName)}
                >
                    {chapters}
                </SortableContainer>
            </li>
        
        )
        
        
    })

    return (
        <div className={FlashCardListCSS["list-container"]} >
            {list}
        </div>
        
    );
}

export default FlashcardList;