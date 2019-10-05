import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import client from '../../client';

import AddPage from '../Add/';

export default () => {
  const { id } = useParams();
  const [editTask, setEditTask] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      client.service('tasks').get(id).then(task => setEditTask(task)).catch(err => setError(err))
    }
  }, [id, setEditTask]);

  if(error){
    return <h1>{error.message}</h1> 
  }

  if(editTask){
    console.dir(editTask);
    return <AddPage edit task={editTask} />;
  }

  return (
    <Container className="p-3">
      <Form>
        <Form.Group controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control type="email" placeholder="Enter description" />
        </Form.Group>

        <Form.Group controlId="tags">
          <Form.Label>Tags</Form.Label>
          <Form.Control type="email" placeholder="Select tags" />
        </Form.Group>

        <Form.Group controlId="status">
          <Form.Label>Status</Form.Label>
          <Form.Control type="status" placeholder="Enter Status" />
        </Form.Group>

        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
    </Container>
  );
};