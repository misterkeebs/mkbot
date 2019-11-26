import React, { useState } from 'react';
import {
  Container, Row, Col, Button,
  Form, FormGroup, Label, Input,
} from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import axios from 'axios';

import { useAuth0 } from '../react-auth0-spa';
import Alert from "../components/Alert";
import DataLoading from '../components/DataLoading';
import getUser from '../actions/getUser';

const getMakers = async () => {
  const response = await fetch(`/api/makers?order=name`);
  return response.json();
};

const getSculpts = async (maker_id) => {
  const response = await fetch(`/api/makers/${maker_id}/sculpts`);
  return response.json();
}

const Submission = () => {
  const { getTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [makers, setMakers] = useState([]);
  const [maker, setMaker] = useState(null);
  const [newMaker, setNewMaker] = useState(null);
  const [sculpt, setSculpt] = useState(null);
  const [colorway, setColorWay] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [author, setAuthor] = useState(null);
  const [wantsCredit, setWantsCredit] = useState(true);
  const [sculpts, setSculpts] = useState([]);
  const [message, setMessage] = useState(null);

  useState(() => {
    getUser(getTokenSilently).then(user => {
      setAuthor(user.nickname || (user.email && user.email.split('@')[0]));
    });
  }, []);

  const imageHandler = async (e) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const makers = await getMakers();
      makers.unshift({});
      makers.push({ maker_id: 'new', name: 'New maker...' });
      setMakers(makers);
      setLoading(false);
      setPreview(reader.result);
    };

    reader.readAsDataURL(e.target.files[0]);
    setImage(e.target.files[0]);
  };

  const uploadForm = !image && (
    <Col>
      <FormGroup className="mkb-files">
        <Label for="image">
          To start the submission process, select or drag the
          artisan image to the box below:
        </Label>
        <Input type="file" name="file" id="image" onChange={imageHandler} />
      </FormGroup>
    </Col>
  );

  if (loading) return <DataLoading />;

  const submit = async () => {
    setUploading(true);
    const token = await getTokenSilently();
    const formData = new FormData();
    formData.append('maker', newMaker || maker);
    formData.append('sculpt', sculpt);
    formData.append('colorway', colorway);
    formData.append('image', image);
    formData.append('anonymous', !wantsCredit);
    if (wantsCredit) {
      formData.append('author', author);
    }
    await axios.put('/api/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    setUploading(false);
    setImage(null);
    setMessage(`Thanks for your submission! We'll notify you when it gets processed.`)
  };

  const setMakerAndGetSculpts = async (maker) => {
    setMaker(maker);
    if (maker === 'New maker...') return;
    const makerObj = makers.find(m => m.name === maker);
    setUploading(true);
    const sculpts = await getSculpts(makerObj.maker_id);
    console.log('sculpts', sculpts);
    setSculpts(sculpts.map(s => s.sculpt));
    setUploading(false);
  };

  const handleSculpt = sculpt => {
    console.log('sculpt', sculpt);
    setSculpt(sculpt);
  };

  const alert = message && <Alert color="success" message={message} />
  const invalid = !(maker && sculpt && colorway);
  const imagePreview = image && (
    <>
      <Col className="mkb-file-preview" xs={6}>
        <img src={preview} alt="Preview" />
      </Col>
      <Col xs={6}>
        <Form>
          <FormGroup>
            <Label for="maker">Maker</Label>
            <Input
              type="select" name="maker" id="maker"
              disabled={uploading} onChange={e => setMakerAndGetSculpts(e.target.value)}
              autoComplete="off"
            >
              {makers.map((m, i) => <option key={i}>{m.name}</option>)}
            </Input>
          </FormGroup>
          {maker && maker === 'New maker...' &&
            <FormGroup>
              <Label for="newMaker">Maker</Label>
              <Input
                type="text" name="newMaker" id="newMaker" disabled={uploading}
                onChange={e => setNewMaker(e.target.value)}
              />
            </FormGroup>
          }
          <FormGroup>
            <Label for="sculpt">Sculpt</Label>
            <Typeahead
              allowNew={true}
              newSelectionPrefix={''}
              emptyLabel={false}
              options={sculpts}
              name="sculpt"
              id="sculpt"
              disabled={uploading}
              onBlur={e => handleSculpt(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="colorway">Colorway</Label>
            <Input
              type="text" name="colorway" id="colorway" disabled={uploading}
              autoComplete="off"
              onChange={e => setColorWay(e.target.value)}
            />
          </FormGroup>
          <FormGroup check>
            <Label for="wantsCredit">
              <Input
                type="checkbox" name="wantsCredit" id="wantsCredit"
                autoComplete="off"
                disabled={uploading} checked={wantsCredit}
                onChange={e => setWantsCredit(e.target.checked)}
              />{' '}
              Credit me for the submission
            </Label>
          </FormGroup>
          {wantsCredit && <FormGroup>
            <Label for="author">How do you want to be credited as?</Label>
            <Input
              type="text" name="author" id="author"
              autoComplete="off"
              value={author} disabled={uploading}
              onChange={e => setAuthor(e.target.value)}
            />
          </FormGroup>}
          {!wantsCredit && <FormGroup>
            <Label>This submission will be sent anonymously.</Label>
          </FormGroup>}
        </Form>
        <Container className="nopadding">
          <Row noGutters>
            <Col>
              <Button color="primary" disabled={uploading || invalid} onClick={submit}>Submit</Button>
            </Col>
            <Col>
              {uploading && <DataLoading />}
            </Col>
          </Row>
        </Container>
      </Col>
    </>
  );

  return (
    <>
      {alert}
      <Container>
        <Row>
          {uploadForm}
          {imagePreview}
        </Row>
      </Container>
    </>
  )
};

export default Submission;
