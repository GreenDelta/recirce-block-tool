import React from "react";
import { Link } from "react-router-dom";

export const ProcessOverview = () => {

  // TODO: fetch process list from server

  return (
    <>
      <nav>
        <ul>
          <li><strong>Waste treatment processes</strong></li>
        </ul>
        <ul>
          <li><Link to="/ui/processes/edit">Create a new process</Link></li>
        </ul>
      </nav>
      <ProcessTable />
    </>
  );
};

const ProcessTable = () => {

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Process</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
  );
};
