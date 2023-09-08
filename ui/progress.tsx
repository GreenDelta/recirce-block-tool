import * as React from "react";
import { MainMenu } from "./menu";

export const ProgressPage = (props: {message?: string}) => {

  const message = props.message
    ? props.message
    : "Loading...";

  return (
    <>
      <MainMenu disabled />
      <article>
        <p>{message}</p>
        <progress />
      </article>
    </>
  );
};
