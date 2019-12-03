import React, { useState } from 'react';
import {
  Table, Container, Row, Col, Button,
  FormGroup, Label, Input,
} from 'reactstrap';

import { useAuth0 } from '../react-auth0-spa';
import DataLoading from '../components/DataLoading';
import Alert from "../components/Alert";
import getUser from '../actions/getUser';
import SubmissionEditor from './SubmissionEditor';
import axios from 'axios';

const MultiCapUpload = props => {
  const { getTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(null);
  const [previews, setPreviews] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [wantsCredit, setWantsCredit] = useState(true);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState(null);
  const [processing, setProcessing] = useState(null);

  useState(() => {
    setLoading(true);
    getUser(getTokenSilently).then(user => {
      setAuthor(user.nickname || (user.email && user.email.split('@')[0]));
      setLoading(false);
    });
  }, []);

  if (loading) return <DataLoading />;
  const alert = message && <Alert color="success" message={message} />

  const extractInfo = fileName => {
    const parts = fileName.split('.')[0].split('-');
    console.log('parts', parts);
    if (parts.length < 2) {
      return {};
    }
    if (parts.length < 3) {
      return { sculpt: parts[0], colorway: parts[1] };
    }
    return { maker: parts[0], sculpt: parts[1], colorway: parts[2] };
  };

  const imageHandler = async (e) => {
    const { files } = e.target;
    const previews = [];
    const images = [];

    setLoading(true);
    console.log('files', files);
    Array.from(files).forEach(file => {
      const reader = new FileReader();

      reader.onloadend = async () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          const previewData = Array.from(files).map((f, i) => {
            const data = extractInfo(f.name);
            data.image = previews[i];
            return data;
          });
          setImages(images);
          setPreviews(previewData);
          setLoading(false);
        }
      };

      reader.readAsDataURL(file);
      images.push(file);
    });
  };

  const formEl = (
    <Row>
      <Col>
        <FormGroup className="mkb-files">
          <Label for="image">
            To start the submission process, select or drag the
            artisan images to the box below:
          </Label>
          <Input type="file" name="file" id="image" onChange={imageHandler} multiple />
        </FormGroup>
      </Col>
    </Row>
  );

  const submit = async () => {
    setUploading(true);
    const token = await getTokenSilently();

    for (let i = 0; i < previews.length; i++) {
      const p = previews[i];
      setProcessing(i);
      const formData = new FormData();
      formData.append('maker', p.newMaker || p.maker);
      formData.append('sculpt', p.sculpt);
      formData.append('colorway', p.colorway);
      formData.append('image', images[i]);
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
    };

    setProcessing(null);
    setUploading(false);
    setImages(null);
    setMessage(`Thanks for your submissions! We'll notify you when it gets processed.`)
  };

  const previewEl = previews && (
    <>
      <Row>
        <Col>
          <Table className="mkb-multi-image">
            <thead>
              <tr>
                <th>Image</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {previews.map((p, i) => (
                <tr>
                  <td>
                    <img src={p.image} alt="Preview" />
                  </td>
                  <td width="100%">
                    {processing === i
                      ? <DataLoading />
                      : <SubmissionEditor submission={p} disabled={uploading} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
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
        </Col>
      </Row>
      <Row>
        <Col>
          <Button color="primary" onClick={submit}>
            Submit
          </Button>
        </Col>
      </Row>
    </>
  );

  console.log('images', images);
  console.log('previews', previews);

  return (
    <>
      {alert}
      <Container>
        {previews ? previewEl : formEl}
      </Container>
    </>
  );
};

export default MultiCapUpload;
