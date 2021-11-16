import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import NavCSS from './Nav.module.css'

class Nav extends Component {
    constructor(props) {
        super(props)
        this.props = props;
    }
    render() { 
        return(
        <nav className={NavCSS["main-nav"]}>
            {/* <div className={`${NavCSS["nav-icon-container"]} ${NavCSS["nav-icon-container-not-clicked"]}`}>
                <img className={NavCSS["nav-icon"]} src="/content/doublen987-logo-5.svg" />
            </div> */}
            <ul className={NavCSS["nav-items"]}>
                <li className={NavCSS["nav-item"]}>
                    <Link to="/home">Home</Link>
                </li>
                <li className={NavCSS["nav-item"]}>
                    <Link to="/quiz">Quizes</Link>
                </li>
                <li className={NavCSS["nav-item"]}>
                    <Link to="/editor">Flashcards</Link>
                </li>
            </ul>
            <div id="modal" className={NavCSS["modal-hidden"]}>

            </div>
        </nav>);
    }
}

export default Nav;