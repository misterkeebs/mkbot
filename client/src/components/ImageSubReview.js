import React, { useState } from 'react';
import {
  Table, Button, ButtonGroup,
} from 'reactstrap';
import Sugar from 'sugar';
import _ from 'lodash';

import { useAuth0 } from "../react-auth0-spa";

const performAction = async (getTokenSilently, action, submission_id) => {
  const token = await getTokenSilently();
  const response = await fetch(`/api/images/${submission_id}/${action}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

const ImageSubReview = props => {
  const { getTokenSilently } = useAuth0();
  const [submissions, setSubmissions] = useState(props.submissions);

  const process = async (action, s) => {
    await performAction(getTokenSilently, action, s.image_id);
    const newSubmissions = _.clone(submissions);
    const pos = newSubmissions.indexOf(s);
    newSubmissions.splice(pos, 1);
    setSubmissions(newSubmissions);
    props.onUpdate && props.onUpdate(newSubmissions);
  };

  const approve = async s => process('approve', s);
  const reject = async s => process('reject', s);

  const items = submissions.map(sub => {
    return <tr key={sub.image_id}>
      <td width="120px"><img src={sub.image} alt="preview" width="100px" /></td>
      <td>
        <b>Maker:</b> {sub.maker}<br/>
        <b>Sculpt:</b> {sub.sculpt}<br/>
        <b>Colorway:</b> {sub.colorway}<br/>
      </td>
      <td>
        {sub.submitted_by || 'Anonymous'}
      </td>
      <td>
        {Sugar.Date.relative(new Date(sub.created_at))}
      </td>
      <td align="right">
        <ButtonGroup>
          <Button color="primary" onClick={_ => approve(sub)}>Approve</Button>
          <Button color="primary" onClick={_ => reject(sub)}>Reject</Button>
        </ButtonGroup>
      </td>
    </tr>
  });

  return (
    <Table>
      <tbody>
        {items}
      </tbody>
    </Table>
  );
}

export default ImageSubReview;
