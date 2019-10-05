import React, { useReducer, useState, useEffect, useCallback } from 'react';

import Container from "react-bootstrap/Container";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

import { Redirect } from "react-router-dom";
import client from '../../client';

const Tags = ({ setTags, tags: selectedTags }) => {
  const [currentTags, setCurrentTags] = useState(selectedTags);
  const [customTag, setCustom] = useState('');
  const [allTags, getTags] = useState(null);
  const [errors, setErrors] = useState(null);
  const [needsToLogIn, setShouldLogIn] = useState(true);

  const [submitted, submit] = useState(false);
  const [formData, setFormState] = useReducer((s, [k, v]) => ({
    ...s,
    [k]: v,
  }), allTags);

  const setText = useCallback((v) => setFormState(['text', v]), [setFormState]);

  //authetication 
  useEffect(() => {
    if (needsToLogIn) {
      client.authenticate()
        .then(() => setShouldLogIn(false))
        .catch(err => setErrors(err)); 
    }
  }, [needsToLogIn, setShouldLogIn, setErrors]);

  
  //add new tag
  useEffect(() => {
    if (submitted && formData) {
      const tagService = client.service('tags');
      let request = tagService.create(formData);

      request.then((f) => {
        window.location.reload(true);
      }).catch((e) => {
        console.dir(e);
      });
    }
  }, [submitted, formData]);

  //get all tags
  useEffect(() => {
    if (!needsToLogIn && !allTags) {
      client
        .service('tags')
        .find({
          query: {
            $limit: 50
          }
        })
        .then(allTags => getTags(allTags.data))
        .catch(err => setErrors(err));
    }
  }, [needsToLogIn, getTags, allTags, setErrors]);

    //get tags for selected entry
    useEffect(() => {
      console.dir(allTags)
      if (currentTags && allTags) {
        console.dir(currentTags)
        setTags(currentTags);
      }
    }, [currentTags, setTags, allTags]);
  
  const addCustomTag = useCallback((evt) => {
    evt.preventDefault();
    //check to see if tag is already in database
    setText(customTag);
    submit(true);
  }, [setText, submit, customTag]);

  const onCustomInput = useCallback((evt) => {
    evt.preventDefault();
    setCustom(evt.target.value);
  }, [setCustom]);

  const setTagsTo = useCallback((tagIds) => {
    const selectedTags = tagIds.map(tagId => allTags.filter(t => t._id === tagId).pop());
    console.dir(selectedTags);
    setCurrentTags(selectedTags);
    // setTags(tags);
  }, [setCurrentTags, allTags]);

  const removeTag = useCallback((evt) => {
    evt.preventDefault();
    const tagService = client.service('tags');
      let request = tagService.find({
        query:{
          text: customTag
        }
      })

      request.then((f) => {
        tagService.remove(f.data);
      }).catch((e) => {
        console.dir(e);
      });
    setCurrentTags(currentTags.filter(tag => tag.text !== customTag));
    window.location.reload(true);

  }, [setCurrentTags, currentTags, customTag]);


  if (errors) {
    return (
      <h1>{errors}</h1>
    )
  }

  return (
    <Container className="mt-3">
      <div className="row add-row">
        <div className="col-12">
          <input name="tag" placeholder="Enter tag" type="text" onChange={onCustomInput} style={{ width: '80%' }} value={customTag} />
          <button type="submit" onClick={addCustomTag}>{'+'}</button>
          <button type="submit" onClick={removeTag}>{'-'}</button>
        </div>
      </div>
      <div className="row add-row">
        <h6 className="mr-5 ml-3">Tags:</h6>
        <ToggleButtonGroup type="checkbox" name="options" defaultValue={currentTags.map(tag => tag._id)} onChange={setTagsTo}>
          {
            allTags && allTags.length > 0 ? allTags.map(tag => <ToggleButton key={tag._id} value={tag._id}>{tag.text}</ToggleButton>) : null
          }
        </ToggleButtonGroup >
      </div>
    </Container>
  );
};

const Status = ({ defaultStatus, setStatus }) => {
  const [status, updateStatus] = useState(defaultStatus);

  useEffect(() => {
    setStatus(status);
  }, [status, setStatus]);

  const setStatusTo = useCallback((val) => {
    updateStatus(val);
  }, [updateStatus]);

  return (
    <div className="row add-row">
      <h6>Status:</h6>
      <ToggleButtonGroup type="radio" name="options" defaultValue={status} onChange={setStatusTo}>
        <ToggleButton value={'To do'}>To Do</ToggleButton>
        <ToggleButton value={'In progress'}>In Progress</ToggleButton>
        <ToggleButton value={'Complete'}>Complete</ToggleButton>
      </ToggleButtonGroup>
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
  const setTags = useCallback((v) => {console.dir(v);setFormState(['tags', v])}, [setFormState]);
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
      console.dir(formData);
      const taskService = client.service('tasks');

      let request;

      if (edit) {
        const { _id, ...body } = formData;
        console.dir(body);
        request = taskService.update(_id, body);
      }

      else {
        request = taskService.create(formData);
      }

      request.then((f) => {
        console.dir(f)
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
        <Tags setTags={setTags} tags={formData.tags ? formData.tags : []} />
        <Status setStatus={setStatus} defaultStatus={formData.status ? formData.status : ''} />
        <button type="submit">{'Submit'}</button>
      </form>
    </Container>
  );
};