import React, { useReducer, useState, useEffect, useCallback } from 'react';

import Container from "react-bootstrap/Container";
import { Redirect } from "react-router-dom";
import client from '../../client';

const Tags = ({ setTags, tags: givenTags }) => {
  const [tags, pushTag] = useReducer((state, tag) => ([...state, tag]), givenTags);
  const [customTag, setCustom] = useState('');

  useEffect(() => {
    if (tags) {
      setTags(tags);
    }
  }, [tags, setTags]);

  const addTag = useCallback((tag) => (evt) => {
    evt.preventDefault();
    pushTag(tag);
  }, [pushTag]);

  const addCustomTag = useCallback((evt) => {
    evt.preventDefault();
    console.log(customTag);
    pushTag(customTag);
  }, [customTag, pushTag]);

  const onCustomInput = useCallback((evt) => {
    evt.preventDefault();
    setCustom(evt.target.value);
  }, [setCustom]);

  return (
    <div className="row add-row">
      <div className="col-7">
        <div className="row">
          <input name="tag" placeholder="Some Custom Tag" type="text" onChange={onCustomInput} style={{width:'80%'}} value={customTag} />
          <button type="submit" onClick={addCustomTag}>{'+'}</button>
        </div>
      </div>
      <div className="col-5">
        <button type="submit" onClick={addTag('Front-end')}>Front-end</button>
        <button type="submit" onClick={addTag('Back-end')}>Back-end</button>
      </div>

      <ul>
        {
          tags && tags.length > 0 ? tags.map(tag => <li key={tag}>{tag}</li>) : null
        }
      </ul>
    </div>
  );
};

const Status = ({ defaultStatus, setStatus }) => {
  const [status, updateStatus] = useState(defaultStatus);

  useEffect(() => {
    setStatus(status);
  }, [status, setStatus]);

  const setStatusTo = useCallback((s) => (evt) => {
    evt.preventDefault();
    updateStatus(s);
  }, [updateStatus]);

  return (
    <div className="row add-row">
      <h6>Status:</h6>
      <button type="submit" onClick={setStatusTo('To Do')}>To Do</button>
      <button type="submit" onClick={setStatusTo('In Progress')}>In Progress</button>
      <button type="submit" onClick={setStatusTo('Complete')}>Complete</button>
    </div>
  );
};

export default ({ task = {}, edit = false }) => {
  const [submitted, submit] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [formData, setFormState] = useReducer((s, [k, v]) => ({
    ...s,
    [k]: v,
  }), task);

  const setTitle = useCallback((v) => setFormState(['title', v]), [setFormState]);
  const setTags = useCallback((v) => setFormState(['tags', v]), [setFormState]);
  const setStatus = useCallback((v) => setFormState(['status', v]), [setFormState]);
  const setDescription = useCallback((v) => setFormState(['description', v]), [setFormState]);

  const onSubmit = useCallback((evt) => {
    evt.preventDefault();
    setTitle(evt.target.elements.title.value);
    setDescription(evt.target.elements.description.value);
    submit(true);
  }, [setTitle, setDescription, setStatus, setTags, submit]);


  useEffect(() => {
    if (submitted && formData) {
      const taskService = client.service('tasks');

      let request;

      if (edit) {
        const { _id, ...body } = formData;
        request = taskService.update(_id, body);
      }

      else {
        request = taskService.create(formData);
      }

      console.dir(formData);
      request.then((f) => {
        console.dir(f);
        setUpdated(true);
      }).catch((e) => {
        console.dir(e);
      });
    }
  }, [formData, setUpdated]);

  const onTitleInput = useCallback((evt) => {
    evt.preventDefault();
    setTitle(evt.target.value);
  }, [setTitle]);

  const onDescriptionInput = useCallback((evt) => {
    evt.preventDefault();
    setDescription(evt.target.value);
  }, [setDescription]);

  if (updated) {
    return <Redirect to={{
      pathname: '/'
    }} />
  }

  return (
    <Container className="p-3">
      <form onSubmit={onSubmit}>
        <div className="row add-row">
          <input type="text" name="title" placeholder="Enter a title" onChange={onTitleInput} value={formData.title ? formData.title : ''} />
        </div>
        <div className="row add-row">
        <input type="text" name="description" placeholder="Enter a description" onChange={onDescriptionInput} value={formData.description ? formData.description : ''} />
        </div>
        <Tags setTags={setTags} tags={formData.tags ? formData.tags : []}/>
        <Status setStatus={setStatus} defaultStatus={formData.status ? formData.status : ''} />
        <button type="submit">{'Submit'}</button>
      </form>
    </Container>
  );
};