import React from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from '../../components/nav/Nav';
import './NotFoundPage.scss';

class NotFoundPage extends React.Component{
    render(){
        return <div className="page">
            <Navbar />
            <span style={{textAlign:"center", display:"block"}}>
              <NavLink to="/">Go to Home </NavLink>
              <h1> 404 PAGE NOT FOUND</h1>
            </span>
          </div>;
    }
}
export default NotFoundPage;