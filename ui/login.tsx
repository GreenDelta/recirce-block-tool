import * as React from "react";
import { MainMenu } from "./menu";


export const LoginPage = () => {

  return <>
    <MainMenu />

    <article>
      <form>
        <div className="grid">
          <div />
          <label>
            User
            <input type="text" required ></input>
          </label>
          <div />
        </div>
        <div className="grid">
          <div />
          <label>
            Password
            <input type="password" required ></input>
          </label>
          <div />
        </div>
        <div className="grid">
          <div />
          <button type="submit">Login</button>
          <div />
        </div>
      </form>
    </article>
  </>

}
