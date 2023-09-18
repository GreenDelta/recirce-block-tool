import React, { useState } from "react";
import { redirect } from "react-router-dom";
import { HomePage } from "./home";
import { MainMenu } from "./menu";
import { AppState } from "./model";
import * as api from "./api";

export const LoginPage = (props: { state: AppState }) => {

  if (props.state.user) {
    return <HomePage />;
  }

  const [inProgress, setInProgress] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);

  const onLogin = async () => {
    setInProgress(true);
    try {
      const u = await api.postLogin({ user, password });
      console.log(u);
      redirect("/ui/home");
    } catch (err: unknown) {
      console.log(err);
      setError(err);
    }
  };


  return <>
    <MainMenu />

    <article>
      <form>
        <div className="grid">
          <div />
          <label>
            User
            <input
              type="text"
              required
              disabled={inProgress}
              value={user}
              onChange={e => setUser(e.target.value)}></input>
          </label>
          <div />
        </div>
        <div className="grid">
          <div />
          <label>
            Password
            <input
              type="password"
              required
              disabled={inProgress}
              value={password}
              onChange={e => setPassword(e.target.value)}></input>
          </label>
          <div />
        </div>
        <div className="grid">
          <div />
          <button type="button" onClick={() => onLogin()}>Login</button>
          <div />
        </div>
      </form>
    </article>
  </>;
}


