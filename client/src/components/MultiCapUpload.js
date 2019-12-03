import React, { useState } from 'react';
import {
  Table, Container, Row, Col, Button,
  FormGroup, Label, Input,
} from 'reactstrap';

import { useAuth0 } from '../react-auth0-spa';
import Alert from "../components/Alert";
import DataLoading from '../components/DataLoading';
import ArtisanList from '../components/ArtisanList';
import getUser from '../actions/getUser';
import SubmissionEditor from './SubmissionEditor';

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
  const [dupeChecked, setDupeChecked] = useState(false);
  const [similars, setSimilars] = useState(null);

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

  const submit = async (dupeChecked=false) => {
    console.log('dupeChecked', dupeChecked);
    if (!dupeChecked) {
      return await checkDupes();
    }

    return await upload();
  };

  const findSimilars = async p => {
    const res = await fetch(`/api/artisans/similar?term=${encodeURI(`${p.sculpt} ${p.colorway}`)}`);
    const matches = await res.json();
    if (!matches.length) {
      return null;
    }
    return matches;
  };

  const checkDupes = async () => {
    console.log(' *** checkDupes');
    setUploading(true);

    const matches = [];
    for (let i = 0; i < previews.length; i++) {
      const p = previews[i];
      setProcessing(i);
      const match = await findSimilars(p);
      console.log('match', i, match);
      matches.push(match);
    };

    setProcessing(null);
    setDupeChecked(true);
    setUploading(false);

    console.log('matches', matches.find(m => !!m));
    if (!matches.find(m => !!m)) {
      console.log('submitting');
      await submit(true);
    } else {
      setSimilars(matches);
    }
  }

  const upload = async () => {
    setUploading(true);

    for (let i = 0; i < previews.length; i++) {
      const p = previews[i];
      setProcessing(i);
      p.image = images[i];
      p.wantsCredit = wantsCredit;
      p.author = author;
      props.onUpload && await props.onUpload(p);
      console.log(i, 'done', images);
    };

    setProcessing(null);
    setUploading(false);
    setPreviews(null);
    setImages(null);
    setMessage(`Thanks for your submissions! We'll notify you when it gets processed.`)
  };

  const content = previews && previews.map((p, i) => {
    const similar = similars && similars[i];
    console.log(i, similar);
    const content = similar
      ? <ArtisanList artisans={similar} />
      : (processing === i
          ? <DataLoading />
          : <SubmissionEditor submission={p} disabled={uploading} />);

    return (
      <tr>
        <td>
          <img src={p.image} alt="Preview" />
        </td>
        <td width="100%">
          {content}
        </td>
      </tr>
    );
  });

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
              {content}
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
          <Button color="primary" onClick={_ => submit(false)}>
            Submit
          </Button>
        </Col>
      </Row>
    </>
  );

  console.log('similars', similars);

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
