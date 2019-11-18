import React, { useState } from 'react';
import {
  Container, Row, Col, Button,
  Form, FormGroup, Label, Input,
} from 'reactstrap';
import axios from 'axios';

import { useAuth0 } from '../react-auth0-spa';
import Alert from "../components/Alert";
import DataLoading from '../components/DataLoading';

const getMakers = async () => {
  const response = await fetch(`/api/makers?order=name`);
  return response.json();
};

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
  const [message, setMessage] = useState(null);

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

  if (loading) return <DataLoading />

  const submit = async () => {
    setUploading(true);
    const token = await getTokenSilently();
    const formData = new FormData();
    formData.append('maker', newMaker || maker);
    formData.append('sculpt', sculpt);
    formData.append('colorway', colorway);
    formData.append('image', image);
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

  const alert = message && <Alert message={message} />
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
            <Input type="select" name="maker" id="maker" disabled={uploading} onChange={e => setMaker(e.target.value)}>
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
            <Input
              type="text" name="sculpt" id="sculpt" disabled={uploading}
              onChange={e => setSculpt(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="colorway">Colorway</Label>
            <Input
              type="text" name="colorway" id="colorway" disabled={uploading}
              onChange={e => setColorWay(e.target.value)}
            />
          </FormGroup>
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
