import React, { Component } from "react";

import { Row, Col, Table } from "reactstrap";

import contentData from "../utils/contentData";

class Content extends Component {
  render() {
    const data = contentData.map(c => (
      <tr>
        <td><code>{c.command}</code></td>
        <td>{c.description}</td>
      </tr>
    ));

    return (
      <div className="next-steps my-5">
        <h2 className="my-5 text-center">Features</h2>
        <Row className="d-flex justify-content-between">
          <Col>
            <Table>
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {data}
              </tbody>
            </Table>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Content;
