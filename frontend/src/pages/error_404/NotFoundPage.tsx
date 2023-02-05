import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Navbar from '../../components/nav/Nav';
import './NotFoundPage.scss';

class NotFoundPage extends React.Component{
    render(){
        return <div className="page">
            <Navbar />
            <p style={{textAlign:"center"}}>
              <NavLink to="/">Go to Home </NavLink>
              <h1> 404 PAGE NOT FOUND</h1>
            </p>
          </div>;
    }
}
export default NotFoundPage;