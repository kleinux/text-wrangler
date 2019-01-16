import * as React from 'react'
import { Nav } from 'reactstrap';
import Wrangle from '../wrangle/wrangle';

const ide = () => {
    return (
        <div>
            <Nav id="navbar-example3" className="navbar navbar-light bg-light">
                <a className="navbar-brand" href="#">Navbar</a>
                <Nav className="nav nav-pills flex-column">
                    <a className="nav-link" href="#item-1">Item 1</a>
                    <Nav className="nav nav-pills flex-column">
                        <a className="nav-link ml-3 my-1" href="#item-1-1">Item 1-1</a>
                        <a className="nav-link ml-3 my-1" href="#item-1-2">Item 1-2</a>
                    </Nav>
                    <a className="nav-link" href="#item-2">Item 2</a>
                    <a className="nav-link" href="#item-3">Item 3</a>
                    <Nav className="nav nav-pills flex-column">
                        <a className="nav-link ml-3 my-1" href="#item-3-1">Item 3-1</a>
                        <a className="nav-link ml-3 my-1" href="#item-3-2">Item 3-2</a>
                    </Nav>
                </Nav>
            </Nav>
            <Wrangle></Wrangle>
        </div>
    )
}

export default ide;