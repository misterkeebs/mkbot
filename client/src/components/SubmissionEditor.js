import React from 'react';
import {
  Form, FormGroup, Label, Input,
} from 'reactstrap';
import _ from 'lodash';

import DataLoading from './DataLoading';

const getMakers = async () => {
  const response = await fetch(`/api/makers?order=name`);
  return response.json();
};

export default class SubmissionEditor extends React.Component {
  constructor(props) {
    super(props);
    const { submission } = props;
    this.props = props;
    this.state = {
      submission: { maker: '', newMaker: '', sculpt: '', colorway: '' },
      loading: true,
      makers: [],
    };

    getMakers().then(makers => {
      makers.unshift({});
      makers.push({ maker_id: 'new', name: 'New maker...' });

      const makerTerm = submission && submission.maker && submission.maker.toLowerCase();
      const maker = submission.maker && makers
        .filter(m => !!m.name)
        .find(m => m.name.toLowerCase().indexOf(makerTerm) > -1);
      if (maker) {
        submission.maker = maker.name || '';
      } else {
        submission.newMaker = submission.maker;
        submission.maker = 'New maker...';
      }
      const loading = false;
      this.setState({ submission, makers, loading });
    });
  }

  update(field) {
    return e => {
      const { value } = e.target;
      const submission = _.clone(this.state.submission);
      submission[field] = value;
      this.setState({ submission });
      this.props.onUpdate && this.props.onUpdate(submission);
    };
  }

  render() {
    const { submission, makers, loading } = this.state;

    if (loading) {
      return <DataLoading />;
    }

    return (
      <Form>
        <FormGroup>
          <Label for="maker">Maker</Label>
          <Input
            type="select"
            id="maker"
            name="maker"
            value={submission.maker}
            disabled={loading}
            onChange={this.update('maker').bind(this)}
          >
            {makers.map((m, i) => <option key={i}>{m.name}</option>)}
          </Input>
        </FormGroup>
        {submission.maker && submission.maker === 'New maker...' &&
          <FormGroup>
            <Label for="newMaker">Maker</Label>
            <Input
              type="text"
              id="newMaker"
              name="newMaker"
              value={submission.newMaker}
              disabled={loading}
              onChange={this.update('newMaker').bind(this)}
            />
          </FormGroup>
        }
        <FormGroup>
          <Label for="sculpt">Sculpt</Label>
          <Input
            type="text"
            id="sculpt"
            name="sculpt"
            value={submission.sculpt}
            disabled={loading}
            onChange={this.update('sculpt').bind(this)}
          />
        </FormGroup>
        <FormGroup>
          <Label for="colorway">Colorway</Label>
          <Input
            type="text"
            id="colorway"
            name="colorway"
            value={submission.colorway}
            disabled={loading}
            onChange={this.update('colorway').bind(this)}
          />
        </FormGroup>
      </Form>
    )
  }
}
