import React, {useState} from "react";
import UpdatableSelectCSS from './UpdatableSelect.module.css'

function UpdatableSelect(props) {

    const [dropdown, setDropdown] = useState(false);

    function onChange() {
        return (e) => {
            props.onSelectChange(e.target.value)
        }
    }

    function onClickDropdown(value) {

        return () => {
            console.log(value)
            props.onSelectChange(value)
            setDropdown(false)
        }
    }

    function onInputSelect() {
        setDropdown(true)
    }

    function onInputDeselect() {
        setDropdown(false)
    }

    return (<div className={UpdatableSelectCSS.updatableselectcontainer}>
        <input onSelect={onInputSelect} 
            className={UpdatableSelectCSS.updatableselectinput}  
            onChange={onChange()} 
            value={props.value}>

        </input>
        <div className={dropdown? UpdatableSelectCSS.backdrop : UpdatableSelectCSS.invisible} onClick={onInputDeselect}></div>
        <div className={dropdown? UpdatableSelectCSS.dropdown : UpdatableSelectCSS.invisible}>
            {props.dropdownList.map((element, index) => {
                return (<div key={"updatable-select-element-"+index} className={UpdatableSelectCSS.dropdownelement} onClick={onClickDropdown(element)}>
                    {element}
                </div>)
            })}
        </div>
        </div>)
}

export default UpdatableSelect;