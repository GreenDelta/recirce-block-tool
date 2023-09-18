import * as React from "react";

export const ProgressPage = (props: {message?: string}) => {

  const message = props.message
    ? props.message
    : "Loading...";

  return (
    <>
      <article>
        <p>{message}</p>
        <progress />
      </article>
    </>
  );
};
