import React, { Component } from "react";
import { useState, useContext, useEffect } from "react";
import { AppStateContext } from "../../App";
import { QuizEditorStateContext, ChangeQuizEditorStateContext } from './QuizEditor'
import { Link, useParams } from "react-router-dom";
import FlashcardSelectionListCSS from './FlashcardSelectionList.module.css'
import { setSubject, setChapter, findNode, stringInitialized } from '../../util'



const FlashcardSelectionList = function(props) {

    const appContext  = useContext(AppStateContext);
    const changeQuizEditorStateContext = useContext(ChangeQuizEditorStateContext);
    const quizEditorStateContext = useContext(QuizEditorStateContext);

    //console.log(QuizEditorStateContext)

    function getChecked(subjectName, chapterName, flashcardIndex) {
        let subject = quizEditorStateContext.subjects.get(subjectName)
        if(subject !== undefined) {
            if(chapterName !== undefined && chapterName !== null) {

                let chapter = subject.chapters.get(chapterName);
                if(chapter !== undefined) {
                    if(flashcardIndex != undefined) {
                        if(chapter.flashcards.find(flashcard => flashcardIndex === flashcard.id)) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return chapter.checked
                    }
                }
            } else {
                if(flashcardIndex != null && flashcardIndex != undefined) {
                    console.log(flashcardIndex + " " + flashcard.id)
                    if(subject.flashcards.find(flashcard => flashcardIndex === flashcard.id)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return subject.checked;
                }
            }
        } else {
            return false;
        }
    }

    const [state,setState] = useState(function getInitialState() {
        // let subjectsMap = new Map();
        // subjectsMap.set("other", {
        //     checked: false,
        //     selected: false,
        //     flashcards: []
        // })
        // appContext.flashcards.forEach((flashcard, flashcardIndex) => {
        //     //If the flashcard doesnt have a subject add it to the "other" subtree
        //     if(!stringInitialized(flashcard.subject)) {
        //         let tmpflashcards = subjectsMap.get("other").flashcards
        //         tmpflashcards[flashcard.position] = {
        //             ...flashcard,
        //             checked: false
        //         }
        //         subjectsMap.set("other", {
        //             ...subjectsMap.get("other"),
        //             selected: false,
        //             flashcards: tmpflashcards
        //         })
        //     } else {
        //         let chaptersMap;
        //         //if the flashcards subject isnt added yet add it
        //         if(!subjectsMap.has(flashcard.subject)) {
        //             chaptersMap = new Map();
        //             chaptersMap.set("other", {
        //                 position: appContext.subjects.get(flashcard.subject).chapters.get("other").position,
        //                 selected: false,
        //                 checked: false, //getChecked(flashcard.subject, "other"),
        //                 flashcards: []
        //             })
        //             subjectsMap.set(flashcard.subject, {
        //                 selected: false,
        //                 checked: false, // getChecked(flashcard.subject),
        //                 chapters: chaptersMap
        //             }); 
        //         } else {
        //             chaptersMap = subjectsMap.get(flashcard.subject).chapters
        //         }
        //         if(!stringInitialized(flashcard.chapter)) {
        //             let tmpflashcards = chaptersMap.get("other").flashcards
        //             tmpflashcards[flashcard.position] = {
        //                 ...flashcard,
        //                 checked: false
        //             }
        //             chaptersMap.set("other", {
        //                 ...chaptersMap.get("other"),
        //                 selected: false,
        //                 checked: false,
        //                 flashcards: tmpflashcards
        //             })
        //         } else {
        //             if(chaptersMap.has(flashcard.chapter)) {
        //                 let chapter = chaptersMap.get(flashcard.chapter); 
        //                 chapter.flashcards[flashcard.position] = {
        //                     ...flashcard,
        //                     checked: false//getChecked(flashcard.subject, flashcard.chapter, flashcard.id)
        //                 }
        //             } else {
        //                 let chapter = appContext.subjects.get(flashcard.subject).chapters.get(flashcard.chapter);
        //                 let tmpflashcards = []
        //                 tmpflashcards[flashcard.position] = {
        //                     ...flashcard,
        //                     checked: false
        //                 }
        //                 chaptersMap.set(flashcard.chapter, {
        //                     position: chapter.position,
        //                     selected: false,
        //                     checked: false,
        //                     flashcards: tmpflashcards
        //                 })
        //             }
        //         }
        //     }
        // });
        let localSubjects = [...appContext.subjects]
        localSubjects.forEach(subject => {
            subject.selected = false
            subject.checked = false
            if(subject.id == "other") {
                subject.flashcards.forEach(flashcard => {
                    flashcard.selected = false
                    flashcard.checked = false
                }) 
            } else {
                subject.chapters.forEach(chapter => {
                    chapter.selected = false
                    chapter.checked = false
                    chapter.flashcards.forEach(flashcard => {
                        flashcard.selected = false
                        flashcard.checked = false
                        
                    })
                })
            }
        })

        return {
            subjects: [...appContext.subjects]
        }
    });

    
    function onSelectSubject(subjectName) {
        return (e) => {
            let checked = e.target.checked
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
            setState({
                ...state,
                // subjects: new Map(state.subjects.set(subjectName, {
                //     ...state.subjects.get(subjectName),
                //     chapters: new Map(state.subjects.get(subjectName).chapters.set(chapterName, {
                //         ...state.subjects.get(subjectName).chapters.get(chapterName),
                //         selected: !state.subjects.get(subjectName).chapters.get(chapterName).selected
                //     }))
                // })),

                subjects: setChapter(state.subjects, subjectName, chapterName, {
                    ...findNode(state.subjects, subjectName, chapterName),
                    selected: !findNode(state.subjects, subjectName, chapterName).selected
                })
            })
        }
    }

    function getAllCheckedFlashcards() {
        let checkedFlashcards = new Map();
        state.subjects.forEach((subject, subjectIndex) => {
            let subjectName = subject.id
            if(subjectName !== "other") {
                if(subject.checked) {
                    checkedFlashcards.set(subjectName, {...subject});
                } else {
                    let subjectadded = false;
                    subject.chapters.forEach((chapter, chapterIndex) => {
                        let chapterName = chapter.id
                        if(chapter.checked) {
                            if(!subjectadded) {
                                subjectadded = true;
                                checkedFlashcards.set(subjectName, {
                                    chapters: new Map()
                                })
                            } 
                            checkedFlashcards.get(subjectName).chapters.set(chapterName, {...chapter})
                            
                        } else {
                            let chapteradded = false;
                            chapter.flashcards.forEach(flashcard => {
                                if(flashcard.checked) {
                                    if(!subjectadded) {
                                        subjectadded = true;
                                        checkedFlashcards.set(subjectName, {
                                            ...checkedFlashcards.get(subjectName),
                                            chapters: new Map()
                                        })
                                    }
                                    if(!chapteradded) {
                                        chapteradded = true;
                                        checkedFlashcards.get(subjectName).chapters.set(chapterName, {
                                            ...checkedFlashcards.get(subjectName).chapters.get(chapterName),
                                            flashcards: []
                                        })
                                    }
                                    checkedFlashcards.get(subjectName).chapters.get(chapterName).flashcards.push(flashcard)
                                }
                            })
                        }
                    }) 
                }
            } else {
                if(subject.checked) {
                    checkedFlashcards.set(subjectName, {...subject});
                } else {
                    let subjectadded = false;
                    subject.flashcards.forEach(flashcard => {
                        if(flashcard.checked) {
                            if(!subjectadded) {
                                subjectadded = true;
                                checkedFlashcards.set(subjectName, {...subject})
                            }
                            
                            checkedFlashcards.get(subjectName).chapters.get(chapterName).flashcards.push(flashcard)
                        }
                    })
                }
            }
        })
        console.log(checkedFlashcards)
        return checkedFlashcards;
    }

    function onCheckmarkChange() {
        changeQuizEditorStateContext({
            ...quizEditorStateContext,
            subjects: getAllCheckedFlashcards()
        })
    }

    function onSubjectCheckmarkChange(subjectName) {
        return (e) => {
            e.stopPropagation()
            //let checked = !find(state.subjects, subjectName).checked
            let subject = findNode(state.subjects, subjectName);
            let checked = (subject.checked != undefined && subject.checked != null)? !subject.checked : false
            subject.checked = checked

            if(subjectName !== "other") {
                subject.chapters.forEach((chapter) => {
                    chapter.checked = checked
                    chapter.flashcards.forEach(flashcard => {
                        flashcard.checked = checked
                    })
                })

                setState({
                    ...state,
                    subjects: setSubject(state.subjects, subjectName, subject)
                })
            } else {
                subject.flashcards.forEach(flashcard => {
                    flashcard.checked = checked
                })

                setState({
                    ...state,
                    subjects: setSubject(state.subjects, subjectName, subject)
                })
            }

            onCheckmarkChange()
            
        }
    }

    function onChapterCheckmarkChange(subjectName, chapterName) {
        return (e) => {
            // let checked = !state.subjects.get(subjectName).chapters.get(chapterName).checked
            // let subject = state.subjects.get(subjectName)
            // let chapter = state.subjects.get(subjectName).chapters.get(chapterName)

            let subject = findNode(state.subjects, subjectName);
            let chapter = findNode(state.subjects, subjectName, chapterName);
            let checked = (chapter.checked != undefined && chapter.checked != null)? !chapter.checked : false
            chapter.checked = checked
            subject.checked = !checked? false : subject.checked
            chapter.flashcards.forEach(flashcard => {
                flashcard.checked = checked
            })

            setState({
                ...state,
                // subjects: new Map(state.subjects.set(subjectName, {
                //     ...subject,
                //     checked: !checked? false : subject.checked,
                //     chapters: new Map(subject.chapters.set(chapterName, {
                //         ...chapter,
                //         checked: checked,
                //         flashcards: chapter.flashcards.map(flashcard => {
                //             return {
                //                 ...flashcard,
                //                 checked: checked
                //             }
                //         })
                //     }))
                // }))
                subjects: setSubject(state.subjects, subjectName, subject)
            })
            onCheckmarkChange()
        }
    }

    function onFlashcardCheckmarkChange(subjectName, chapterName, flashcardid) {
        return (e) => {
            if(subjectName !== "other") {
                
                // let flashcardindex = state.subjects.get(subjectName).chapters.get(chapterName).flashcards.findIndex((flashcard) => flashcard.id === flashcardid);
                // let hierarchycheck = !state.subjects.get(subjectName).chapters.get(chapterName).flashcards[flashcardindex].checked;
                
                let subject = findNode(state.subjects, subjectName);
                let chapter = findNode(state.subjects, subjectName, chapterName);
                let flashcard = findNode(state.subjects, subjectName, chapterName, flashcardid);

                let checked = (flashcard.checked != undefined && flashcard.checked != null)? !flashcard.checked : false
                chapter.checked = checked? chapter.checked : false,
                subject.checked = checked? subject.checked : false,
                flashcard.checked = checked


                setState({
                    ...state,
                    subjects: setSubject(state.subjects, subjectName, subject)
                    // subjects: new Map(state.subjects.set(subjectName, {
                    //     ...state.subjects.get(subjectName),
                    //     checked: hierarchycheck? state.subjects.get(subjectName).checked : false,
                    //     chapters: new Map(state.subjects.get(subjectName).chapters.set(chapterName, {
                    //         ...state.subjects.get(subjectName).chapters.get(chapterName),
                    //         checked: hierarchycheck? state.subjects.get(subjectName).chapters.get(chapterName).checked : false,
                    //         flashcards: [
                    //             ...state.subjects.get(subjectName).chapters.get(chapterName).flashcards.slice(0, flashcardindex),
                    //             {
                    //                 ...state.subjects.get(subjectName).chapters.get(chapterName).flashcards[flashcardindex],
                    //                 checked: !state.subjects.get(subjectName).chapters.get(chapterName).flashcards[flashcardindex].checked
                    //             },
                    //             ...state.subjects.get(subjectName).chapters.get(chapterName).flashcards.slice(flashcardindex+1)
                    //         ]
                    //     }))
                    // }))
                })
                
            } else {
                let subject = findNode(state.subjects, subjectName);
                //let chapter = find(state.subjects, subjectName, chapterName);
                //let flashcard = find(state.subjects, subjectName, chapterName, flashcardid);
                let flashcard = subject.flashcards.find(flashcard => flashcard.id == flashcardid)
                let checked = !flashcard.checked
                //chapter.checked = checked? chapter.checked : false,
                subject.checked = checked? subject.checked : false,
                flashcard.checked = checked


                setState({
                    ...state,
                    subjects: setSubject(state.subjects, subjectName, subject)
                })
                // let flashcardindex = state.subjects.get(subjectName).flashcards.findIndex((flashcard) => flashcard.id === flashcardid);
                // let hierarchycheck = !state.subjects.get(subjectName).flashcards[flashcardindex].checked;
                
                // setState({
                //     ...state,
                //     subjects: new Map(state.subjects.set(subjectName, {
                //         ...state.subjects.get(subjectName),
                //         checked: hierarchycheck? state.subjects.get(subjectName).checked : false,
                //         flashcards: [
                //             ...state.subjects.get(subjectName).flashcards.slice(0, flashcardindex),
                //             {
                //                 ...state.subjects.get(subjectName).flashcards[flashcardindex],
                //                 checked: !state.subjects.get(subjectName).flashcards[flashcardindex].checked
                //             },
                //             ...state.subjects.get(subjectName).flashcards.slice(flashcardindex+1)
                //         ]
                        
                //     }))
                // })
            }
            onCheckmarkChange()
        }
    }

    let list = []
    state.subjects.forEach((subject, subjectIndex) => {
        
        let subjectName = subject.id
        let chapters = [];
        if(subjectName === "other") {
            subject.flashcards.forEach((flashcard, flashcardIndex) => {
            chapters[flashcardIndex] = (
                <div key={'flashcard-list-item-'+flashcard.id} className={`${FlashcardSelectionListCSS['flashcard-list-item']}`}>
                    <input 
                    onChange={onFlashcardCheckmarkChange(subjectName, null, flashcard.id )}
                    onClick={(e)=>{e.stopPropagation()}} 
                    type="checkbox" 
                    value={flashcard.id}
                    checked={flashcard.checked}></input>
                    <span className={FlashcardSelectionListCSS['checkmark']}></span>
                    {flashcard.question}
                </div>);
            })
        } else {
            subject.chapters.forEach((chapter, chapterIndex) => {
                let chapterName = chapter.id
                chapters[chapterIndex] = (
                <div key={'chapter-'+subjectName+"-"+chapterName} className={FlashcardSelectionListCSS["list"]} >
                    
                    <div 
                        key={'chapter-label-'+subjectName+"-"+chapterName} 
                        className={FlashcardSelectionListCSS['label']} 
                        onClick={onSelectChapter(subjectName, chapterName)}
                        style={{paddingLeft: "40px"}}
                        >
                        
                        <input 
                            onChange={onChapterCheckmarkChange(subjectName, chapterName)} 
                            onClick={(e)=>{e.stopPropagation()}}
                            type="checkbox"
                            checked={chapter.checked}></input>
                        <span className={FlashcardSelectionListCSS['checkmark']}></span>
                        {chapterName}
                    </div>
                    <div 
                        key={'chapter-contents-list-'+subjectName+"-"+chapterName} 
                        className={`
                            ${FlashcardSelectionListCSS["questions-list"]} 
                            ${chapter.selected? FlashcardSelectionListCSS.display_unset : FlashcardSelectionListCSS.display_none}
                        `}
                    >
                        {chapter.flashcards.map(flashcard => {
                            return (
                            <div 
                                key={'flashcard-list-item-'+flashcard.id} 
                                style={{paddingLeft: "60px"}}
                                className={`${FlashcardSelectionListCSS['flashcard-list-item']}`}>
                                    <input 
                                    onClick={(e)=>{e.stopPropagation()}}
                                    onChange={onFlashcardCheckmarkChange(subjectName, chapterName, flashcard.id)} type="checkbox" value={flashcard.id} checked={flashcard.checked}></input>
                                    <span className={FlashcardSelectionListCSS['checkmark']}></span>
                                    {flashcard.question}
                            </div>);
                        })}
                    </div>
                </div>)
            })
        }
        

        list.push(
            <div key={'subject-list-item-'+subjectName} className={FlashcardSelectionListCSS["list"]}>
                
                <div key={'subject-label-'+subjectName} className={FlashcardSelectionListCSS['label']} onClick={onSelectSubject(subjectName)}>
                    <span className={FlashcardSelectionListCSS['checkmark']}></span>
                    <input 
                        onChange={onSubjectCheckmarkChange(subjectName)}
                        onClick={(e)=>{e.stopPropagation()}} 
                        type="checkbox" 
                        checked={subject.checked}>
                    </input>
                    {subjectName}
                </div>
                <div key={'subject-contents-list-'+subjectName} className={`${FlashcardSelectionListCSS['chapters-list']} ${
                    subject.selected? FlashcardSelectionListCSS.display_unset : FlashcardSelectionListCSS.display_none
                    }`}>
                    {chapters}
                </div>
            </div>
        )
        
        
    })

    return (
        <div className={FlashcardSelectionListCSS["list-container"]} >
            <div className={FlashcardSelectionListCSS["subjects-list"]}>
            {list}
            </div>
        </div>
    );
}

export default FlashcardSelectionList;