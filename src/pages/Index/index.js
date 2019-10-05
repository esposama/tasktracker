import React, { useState, useEffect, useCallback } from 'react';
import client from '../../client';
import { Redirect } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import BootstrapTable from 'react-bootstrap-table-next';

const Nav = ({ selected, setTasks }) => {
  const [redirectTo, setRedirect] = useState(null);
  const [error, setError] = useState(null);

  const onViewDetails = useCallback((evt) => {
    evt.preventDefault();
    setRedirect(`/Detail/${selected._id}`);
  });

  const onDeleteTask = useCallback((evt) => {
    evt.preventDefault();
    client.service('tasks').remove(selected._id).then(() => {
      if (setTasks) setTasks(null);
    }).catch(err => setError(err));
  });

  if(error){
    return <h1>{error.message}</h1>;
  }

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return (
    <div className="d-flex justify-content-end" inline="true" >
      <Button type="submit" onClick={onDeleteTask}>Delete</Button>
      <Button href="/Add" className="mx-2">Add</Button>
      <Button type="submit" onClick={onViewDetails}>View Details</Button>
    </div>
  );
};

export default () => {
  const [tasks, setTasks] = useState(null);
  const [errors, setErrors] = useState(null);
  const [needsToLogIn, setShouldLogIn] = useState(true);
  const [selectedIndex, setSelected] = useState(null);

  useEffect(() => {
    if (needsToLogIn) {
      client.authenticate()
        .then(() => setShouldLogIn(false))
        .catch(err => setErrors(err));
    }
  }, [needsToLogIn, setShouldLogIn, setErrors]);

  //get tasks
  useEffect(() => {
    if (!needsToLogIn && !tasks) {
      client
        .service('tasks')
        .find({
          query: {
            $limit: 50
          }
        })
        .then(tasks => setTasks(tasks.data))
        .catch(err => setErrors(err));
    }
    console.dir(tasks);
  }, [needsToLogIn, setTasks, tasks, setErrors]);



  const selectRowProp = {
    mode: 'radio', // single row selection
    onSelect: (row, isSelect, rowIndex, e) => {
      e.preventDefault();
      setSelected(row);
      console.dir(row);
    },
  };

  const columns = [
    {
      dataField: 'title',
      text: 'Title'
    },
  {
    dataField: 'description',
    text: 'Description'
  },
  {
    dataField: 'tags',
    text: 'Tags',
    formatter: (cell, row, rowIndex, formatExtraData) => row.tags.length > 0 ? row.tags.map(tag => tag.text).join(', ') : '-',
  },
  {
    dataField: 'status',
    text: 'Status'
  }];

  if (errors) {
    return (
      <h1>Error</h1>
    )
  }

  return (
    <Container className="mt-3">
      {
        needsToLogIn ? <h1>You need to log in</h1> : (tasks && 
          <BootstrapTable
            keyField='_id'
            data={tasks}
            columns={columns}
            selectRow={selectRowProp}
          />
        )
      }

      <div className="col-12 align-items-end">
        <Nav selected={selectedIndex} setTasks={setTasks} />
      </div>
    </Container>

  );
};