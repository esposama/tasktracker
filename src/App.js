import React, { useEffect, useCallback, useState } from 'react';
import Client from "./client";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import IndexPage from './pages/Index';
import LogInPage from './pages/LogIn';
import DetailPage from './pages/Detail';
import AddPage from './pages/Add';
import RegisterPage from './pages/Register';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import client from './client';

const Routes = () => {
  return (
    <React.Fragment>
      <Route path="/" exact component={IndexPage} />
      <Route path="/LogIn" exact component={LogInPage} />
      <Route path="/Detail/:id" exact component={DetailPage} />
      <Route path="/Add" exact component={AddPage} />
      <Route path="/Register" exact component={RegisterPage} />
    </React.Fragment>
  );
};

const Nav = ({ loggedIn }) => {
  return (
    <Container inline="true" className="nav-bar">
      {loggedIn ? (
        <h6>Logged In</h6>
      ) : (
          <>
            <Link className="mr-3" to="/Register">Register</Link>
            <Link to="/LogIn">Log In</Link>
          </>
        )}
      <Link to="/"></Link>
    </Container>
  );
};

const useAuth = () => {

  const [logIn, setLogIn] = useState(false);
  useEffect(() => {
    client.authenticate().catch(() => setLogIn(false));
    client.on('authenticated', login => {
      setLogIn(login);
    })
  }, []);

  return logIn;
}

function App() {

  const logIn = useAuth();

  return (
    <Router>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/">Issue Tracking</Navbar.Brand>
        <Nav className="m-auto" loggedIn={logIn} />
      </Navbar>
      <Routes />
    </Router>
  );
}

export default App;
