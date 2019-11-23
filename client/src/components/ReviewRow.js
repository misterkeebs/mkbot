import React, { useState } from 'react';
import {
  InputGroup, Input, ButtonGroup, Button
} from 'reactstrap';

import DataLoading from '../components/DataLoading';
import SubmissionEditor from './SubmissionEditor';

const ReviewRow = props => {
  const { submission, onApprove, onReject, onUpdate } = props;
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const executeAction = async (actionFn) => {
    console.log('submission', submission);
    setBusy(true);
    await actionFn();
    setBusy(false);
  };

  return (
      <tr key={submission.submission_id}>
        <td width="120px"><img src={submission.image} alt="preview" width="100px" /></td>
        {editing && <td colSpan="3">
          <SubmissionEditor submission={submission} />
        </td>}
        {editing && <td align="right">
          {busy
          ? <DataLoading />
          : <ButtonGroup>
            <Button color="primary" onClick={_ => executeAction(() => onUpdate(submission))}>Save</Button>
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
