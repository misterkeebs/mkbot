import React, { useState } from 'react';
import {
  Container, Row, Col, Button,
  Form, FormGroup, Label, Input,
} from 'reactstrap';

import DataLoading from './DataLoading';

const getMakers = async () => {
  const response = await fetch(`/api/makers?order=name`);
  return response.json();
};

class SubmissionEditor {
  constructor(props) {
    const { submission } = props;
    this.props = props;
    this.state = {
      loading: true,
      submission
    };
  }

  render() {
    <Form>
      <FormGroup>
        <Label for="maker">Maker</Label>
        <Input type="select" name="maker" id="maker" value={maker} disabled={uploading} onChange={update('set')}>
          {makers.map((m, i) => <option key={i}>{m.name}</option>)}
        </Input>
      </FormGroup>
      {maker && maker === 'New maker...' &&
        <FormGroup>
          <Label for="newMaker">Maker</Label>
          <Input
            type="text" name="newMaker" id="newMaker" value={newMaker} disabled={uploading}
            onChange={e => setNewMaker(e.target.value)}
          />
        </FormGroup>
      }
      <FormGroup>
        <Label for="sculpt">Sculpt</Label>
        <Input
          type="text" name="sculpt" id="sculpt" value={sculpt} disabled={uploading}
          onChange={e => setSculpt(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label for="colorway">Colorway</Label>
        <Input
          type="text" name="colorway" id="colorway" value={colorway} disabled={uploading}
          onChange={e => setColorway(e.target.value)}
        />
      </FormGroup>
    </Form>
  }
}

const SubmissionEditor = props => {
  const { submission, loading, uploading } = props;
  const [makers, setMakers] = useState([]);
  const [maker, setMaker] = useState(null);
  const [newMaker, setNewMaker] = useState(null);
  const [sculpt, setSculpt] = useState(null);
  const [colorway, setColorway] = useState(null);
  const [makersLoading, setMakersLoading] = useState(true);

  useState(() => {
    getMakers().then(makers => {
      makers.unshift({});
      makers.push({ maker_id: 'new', name: 'New maker...' });
      setMakers(makers);
      const makerTerm = submission && submission.maker && submission.maker.toLowerCase();
      const maker = submission.maker && makers
        .filter(m => !!m.name)
        .find(m => m.name.toLowerCase().indexOf(makerTerm) > -1);
      if (maker) {
        setMaker(maker.name || '');
      } else {
        setMaker('New maker...');
        setNewMaker(submission.maker);
      }
      setSculpt(submission.sculpt);
      setColorway(submission.colorway);
      setMakersLoading(false);
    });
  }, []);

  if (loading) return;

  if (makersLoading) return <DataLoading />;

  const update(fiel)

  return (
  );
}

export default SubmissionEditor;
