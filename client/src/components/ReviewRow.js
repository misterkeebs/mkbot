import React, { useState } from 'react';
import {
  ButtonGroup, Button
} from 'reactstrap';
import _ from 'lodash';

import DataLoading from '../components/DataLoading';
import SubmissionEditor from './SubmissionEditor';

const ReviewRow = props => {
  const { onApprove, onReject, onUpdate } = props;
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submission, setSubmission] = useState(props.submission);

  const executeAction = async (actionFn) => {
    setBusy(true);
    await actionFn();
    setBusy(false);
  };

  const update = (sub) => {
    const newSub = _.clone(submission);
    newSub.newMaker = sub.newMaker;
    newSub.maker = sub.maker;
    newSub.sculpt = sub.sculpt;
    newSub.colorway = sub.colorway;
    setSubmission(newSub);
  };

  const handleUpdate = async (sub) => {
    console.log(' *** handleUpdate', sub);
    await onUpdate(sub);
    setEditing(false);
  };

  return (
      <tr key={submission.submission_id}>
        <td width="120px"><img src={submission.image} alt="preview" width="100px" /></td>
        {editing && <td colSpan="3">
          <SubmissionEditor submission={submission} onUpdate={sub => update(sub)} />
        </td>}
        {editing && <td align="right">
          {busy
          ? <DataLoading />
          : <ButtonGroup>
            <Button color="primary" onClick={_ => executeAction(() => handleUpdate(submission))}>Save</Button>
            <Button color="primary" onClick={_ => executeAction(() => setEditing(false))}>Cancel</Button>
          </ButtonGroup>}
        </td>}
        {!editing && <td style={{ cursor: 'pointer' }} onClick={_ => setEditing(true)}>
          <b>Maker:</b> {submission.maker}<br/>
          <b>Sculpt:</b> {submission.sculpt}<br/>
          <b>Colorway:</b> {submission.colorway}<br/>
        </td>}
        {!editing && <td>
          {submission.nickname || submission.user}
        </td>}
        {!editing && <td>
          {submission.created_at}
        </td>}
        {!editing && <td align="right">
          {busy
          ? <DataLoading />
          : <ButtonGroup>
            <Button color="primary" onClick={_ => executeAction(() => onApprove(submission))}>Approve</Button>
            <Button color="primary" onClick={_ => executeAction(() => onReject(submission))}>Reject</Button>
          </ButtonGroup>}
        </td>}
      </tr>
    );
};

export default ReviewRow;
