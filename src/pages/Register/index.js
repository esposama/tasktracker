import React, { useState, useEffect, useCallback } from 'react';
import { Redirect } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import client from '../../client';

export default () => {

  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const onSubmit = useCallback(evt => {
    evt.preventDefault();
    setFormData({
      email: evt.target.email.value,
      password: evt.target.password.value
    });
  }, [setFormData]);

  useEffect(() => {
    if (formData && !loggedIn) {
      client.service('users').create(formData).then(() => {
        return client.authenticate({
          strategy: 'local',
          ...formData
        })
      }).then(() => setLoggedIn(true)).catch(e => {
        setError(e);
      });
    }
  }, [formData])

  if (loggedIn) {
    return <Redirect to={{
      pathname: '/'
    }} />
  }

  if (error) {
    throw error; //ToDo: Error ; 
  }

  return (

    <Container className="p-3">
      <Form onSubmit={onSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control name="email" type="email" placeholder="Enter email" />
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control name="password" type="password" placeholder="Password" />
        </Form.Group>

        <Form.Group controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="Check me out" />
        </Form.Group>
        
        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </Container>
  );
};