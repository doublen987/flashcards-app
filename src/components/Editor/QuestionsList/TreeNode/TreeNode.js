import React from "react";
import { useState, useContext, useEffect } from "react";
import { AppStateContext, ChangeAppStateContext } from "../../../App";
import { Link } from "react-router-dom";
import FlashCardListCSS from './FlashcardList.module.css'
import { arrayFromMap, findNode, functionGetSubjectsMapFromFlashcards, setChapter, setFlashcard, setSubject, stringInitialized, treeFromArray } from '../../../util'
import {arrayMove, sortableContainer, sortableElement, SortableHandle} from 'react-sortable-hoc';
import {arrayMoveImmutable} from 'array-move';
import { faBars, faSortDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const TreeNode = ({type, node, name, nodeIndex}) => {

    const appContext = useContext(AppStateContext)
    const changeAppStateContext = useContext(ChangeAppStateContext)

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

    const [selected, setSelected] = useState(false);

    
    let childNodes = (type == "subject" && node.flashcards == undefined) ? node.chapters : node.flashcards;

    function onChangeOrderChapter(subjectName) {
        return ({oldIndex, newIndex}) => {

            if(oldIndex === newIndex) {
                return;
            }
            let newChapters = findNode(appContext.subjects, subjectName).chapters;
            newChapters = arrayMoveImmutable(newChapters, oldIndex, newIndex)
            changeAppStateContext({
                ...appContext,
                subjects: setSubject(appContext.subjects, subjectName, {
                    ...findNode(appContext.subjects, subjectName),
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
            let flashcards = findNode(appContext.subjects, subjectName, chapterName).flashcards;
            let newFlashcards = arrayMoveImmutable(flashcards, oldIndex, newIndex)


            changeAppStateContext({
                ...appContext,
                subjects: setChapter(appContext.subjects, subjectName, chapterName, {
                    ...findNode(appContext.subjects, subjectName, chapterName),
                    flashcards: newFlashcards
                })
            })
        }
    }
    function toggleSelection() {
        setSelected(!selected)
    }

    const DragHandleChapter = SortableHandle(() => <FontAwesomeIcon className={FlashCardListCSS.draghandle} icon={selected? faSortDown: faBars}/>);
    
    let sortableClassName = FlashCardListCSS["flashcardli"]
    if(type == "chapter") {
        sortableClassName = FlashCardListCSS["chapterlistitem"]
    }
    if(type == "subject") {
        sortableClassName = FlashCardListCSS["subjectlistitem"]
    }
    
    let nodeDOM = null;

    if(type == "chapter" || type == "subject") {
        nodeDOM = (
        //Chapters
            <SortableItem 
                //key={`sortable-chapter-item-${chapterIndex}`} 
                index={nodeIndex}
                className={sortableClassName}
            >
                <div 
                    className={selected? FlashCardListCSS["chapter-label-selected"] : FlashCardListCSS["chapter-label"]} 
                    //key={'chapter-label-'+subjectName+"-"+chapterName} 
                    onClick={toggleSelection}>
                        <DragHandleChapter></DragHandleChapter>{name}
                </div>
                {/* Flashcards */}
                <SortableContainer useDragHandle
                    className={`${FlashCardListCSS["ol"]} 
                                ${selected? FlashCardListCSS["display_unset"] : 
                                                    FlashCardListCSS["display_none"]}`}
                    //key={'chapter-contents-list-'+subjectName+"-"+chapterName} 
                    onSortEnd={type=="subject"? onChangeOrderChapter(node.id) : onChangeOrderFlashcard(node.subject, node.id)}
                >
                    {childNodes.map((childNode, index) => {
                        let childType = childNode.question != undefined? "flashcard" :"chapter";

                        if(childType == "flashcard") {
                        return ( 
                            <TreeNode key={"flashcard-"+index} type="flashcard" node={childNode} name={index+". " + childNode.question} nodeIndex={index}></TreeNode>
                        )
                        } else {
                            return ( 
                            <TreeNode key={"chapter_"+index} type="chapter"  node={childNode} name={index+". " + childNode.name}  nodeIndex={index}></TreeNode>
                            )
                        };
                    })}
                </SortableContainer>
            </SortableItem>
        )
    }
    if(type == "flashcard") {
        nodeDOM = <SortableItem 
                key={`sortable-flashcard-item-${nodeIndex}`} 
                index={nodeIndex}
                className={`${sortableClassName}
                            ${selected? FlashCardListCSS["flashcardli-selected"] : null}`}    
            >
                <DragHandle></DragHandle>
                <Link 
                    className={`${FlashCardListCSS["flashcardlink"]}  
                                ${selected? FlashCardListCSS["flashcardlink-selected"] : null}`}  
                    key={'flashcard-link-'+node.id} 
                    to={`/editor/flashcard/${node.id}`}>
                        {name}
                </Link>
            </SortableItem>;
    }

    return(
        {...nodeDOM}
    )
}

export default TreeNode;