import React from "react";
import { useState, useContext, useEffect } from "react";
import { AppStateContext, ChangeAppStateContext } from "../../App";
import { Link } from "react-router-dom";
import FlashCardListCSS from './FlashcardList.module.css'
import { arrayFromMap, findNode, functionGetSubjectsMapFromFlashcards, setChapter, setFlashcard, setSubject, stringInitialized, treeFromArray } from '../../util'
import {arrayMove, sortableContainer, sortableElement, SortableHandle} from 'react-sortable-hoc';
import {arrayMoveImmutable} from 'array-move';
import Aux from "../../hoc/Aux";
import { faBars, faSortDown } from '@fortawesome/free-solid-svg-icons'
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
                tmpflashcards.push({
                    ...flashcard,
                    selected: selected
                })
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
                        //position: appContext.subjects.get(flashcard.subject).chapters.get("other").position,
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
                    tmpflashcards.push({
                        ...flashcard,
                        selected: selected
                    })
                    chaptersMap.set("other", {
                        ...chaptersMap.get("other"),
                        selected: chaptersMap.get("other").selected? true: selected,
                        flashcards: tmpflashcards
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
                        let chapter = appContext.subjects.get(flashcard.subject).chapters.get(flashcard.chapter);
                        let tmpflashcards = []
                        tmpflashcards.push({
                            ...flashcard,
                            selected: selected
                        })
                        chaptersMap.set(flashcard.chapter, {
                            //position: chapter.position,
                            selected: selected,
                            flashcards: tmpflashcards
                        })
                    }
                }
            }
        });
        return subjectsMap;
    }

    // console.log(props.flashcards)
    // console.log( treeFromArray(props.flashcards) )

    const [state,setState] = useState(function getInitialState() {
        return {
            subjects: props.flashcards
        }
    });

    useEffect(() => {
        setState({
            subjects: props.flashcards
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
                // subjects: new Map(state.subjects.set(subjectName, {
                //     ...state.subjects.get(subjectName),
                //     selected: !state.subjects.get(subjectName).selected
                // }))
                subjects: setSubject(state.subjects, subjectName, {
                    ...findNode(state.subjects, subjectName),
                    selected: !findNode(state.subjects, subjectName).selected
                })
            })
        }
    }

    function onSelectChapter(subjectName, chapterName) {
        return (e) => {
            let checked = e.target.checked
            setState({
                ...state,
                // subjects: new Map(state.subjects.set(subjectName, {
                //     ...state.subjects.get(subjectName),
                //     selected: !state.subjects.get(subjectName).selected
                // }))
                subjects: setChapter(state.subjects, subjectName, chapterName, {
                    ...findNode(state.subjects, subjectName, chapterName),
                    selected: !findNode(state.subjects, subjectName, chapterName).selected
                })
            })
        }
    }

    function onChangeOrderChapter(subjectName) {
        return ({oldIndex, newIndex}) => {

            if(oldIndex === newIndex) {
                return;
            }
            let newChapters = findNode(state.subjects, subjectName).chapters;
            newChapters = arrayMoveImmutable(newChapters, oldIndex, newIndex)
            changeAppStateContext({
                ...appContext,
                subjects: setSubject(state.subjects, subjectName, {
                    ...findNode(state.subjects, subjectName),
                    chapters: newChapters
                })
            })
            setState({
                ...state,
                subjects: setSubject(state.subjects, subjectName, {
                    ...findNode(state.subjects, subjectName),
                    chapters: newChapters
                })
            })
        }
    }

    function onChangeOrderFlashcard(subjectName, chapterName) {
        return ({oldIndex, newIndex}) => {
            console.log("old: " + oldIndex + " new: " + newIndex)
            if(oldIndex === newIndex) {
                return;
            }
            let flashcards = findNode(state.subjects, subjectName, chapterName).flashcards;
            let newFlashcards = arrayMoveImmutable(flashcards, oldIndex, newIndex)


            changeAppStateContext({
                ...appContext,
                subjects: setChapter(state.subjects, subjectName, chapterName, {
                    ...findNode(state.subjects, subjectName, chapterName),
                    flashcards: newFlashcards
                })
            })

            setState({
                ...state,
                subjects: setChapter(state.subjects, subjectName, chapterName, {
                    ...findNode(state.subjects, subjectName, chapterName),
                    flashcards: newFlashcards
                })
            })
        }
    }

    let list = []
    let otherSubject = null;

    state.subjects.forEach((subject, index) => {

        let chapters = [];
        let subjectName = subject.id
        
        if(subject.id === "other") {
            otherSubject = subject
        } else {
            subject.chapters.forEach((chapter, chapterIndex) => {
                let chapterName = chapter.id
                const DragHandleChapter = SortableHandle(() => <FontAwesomeIcon className={FlashCardListCSS.draghandle} icon={chapter.selected? faSortDown: faBars}/>);
                chapters[chapterIndex] = (
                //Chapters
                    <SortableItem 
                        key={`sortable-chapter-item-${chapterIndex}`} 
                        index={chapterIndex}
                        className={FlashCardListCSS["chapterlistitem"]}
                    >
                        <div 
                            className={chapter.selected? FlashCardListCSS["chapter-label-selected"] : FlashCardListCSS["chapter-label"]} 
                            key={'chapter-label-'+subjectName+"-"+chapterName} 
                            onClick={onSelectChapter(subjectName, chapterName)}>
                                <DragHandleChapter></DragHandleChapter>{(chapterIndex+1) + ". " + chapterName}
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
                                    key={`sortable-flashcard-item-${index}`} 
                                    index={index}
                                    className={`${FlashCardListCSS["flashcardli"]}
                                                ${flashcard.selected? FlashCardListCSS["flashcardli-selected"] : null}`}    
                                >
                                    <DragHandle></DragHandle>
                                    <Link 
                                        className={`${FlashCardListCSS["flashcardlink"]}  
                                                    ${flashcard.selected? FlashCardListCSS["flashcardlink-selected"] : null}`}  
                                        key={'flashcard-link-'+flashcard.id} 
                                        to={`/editor/flashcard/${flashcard.id}`}>
                                            {(index + 1) + ". " +flashcard.question}
                                    </Link>
                                </SortableItem>);
                            })}
                        </SortableContainer>
                    </SortableItem>
                )
            })
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
        }

        
    })

    let chapters = [];

    if(otherSubject != null) {
        otherSubject.flashcards.forEach((flashcard, index) => {
            chapters[index] =  (
                <SortableItem 
                    key={`sortable-other-flashcard-${index}`} 
                    index={index}
                    className={`${FlashCardListCSS["flashcardli"]}
                                ${flashcard.selected? FlashCardListCSS["flashcardli-selected"] : null}`}
                >
                    <Link 
                    key={'flashcard-link-'+flashcard.id} 
                    className={`${FlashCardListCSS["flashcardlink"]}  
                                ${flashcard.selected? FlashCardListCSS["flashcardlink-selected"] : null}`} 
                    to={`/editor/flashcard/${flashcard.id}`}>
                        {(index+1) + ". " +flashcard.question}
                    </Link>
                </SortableItem>
            );
        })
        list.push(
            //Subjects
            <li 
                className={FlashCardListCSS["subjectlistitem"]} 
                key={'subject-list-item-'+"other"}
            >
                <div 
                    className={FlashCardListCSS["label"]}
                    key={'subject-label-'+"other"}  
                    onClick={onSelectSubject("other")}
                >
                    {"other"}
                </div>
                <SortableContainer  useDragHandle
                    className={`${FlashCardListCSS["ol"]} 
                                ${otherSubject.selected? FlashCardListCSS["display_unset"] : 
                                                    FlashCardListCSS["display_none"]}`}
                    key={'subject-contents-list-'+"other"} 
                    onSortEnd={onChangeOrderChapter("other")}
                >
                    {chapters}
                </SortableContainer>
            </li>
        )
    }

    return (
        <div className={FlashCardListCSS["list-container"]} >
            {list}
            <Link 
                style={{textDecoration: "none"}}
                key={'link-new-question'} 
                to={`/editor`}>
                    <div
                     className={`${!props.flashcardid? 
                        FlashCardListCSS['newquiz-selected']: 
                        FlashCardListCSS["newquiz"]}`}
                    >Create new question!</div>
            </Link>

        </div>
        
    );
}

export default FlashcardList;