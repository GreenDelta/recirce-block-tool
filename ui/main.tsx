import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  createBrowserRouter,
  Link,
  Outlet,
  useNavigate,
  RouterProvider }
from "react-router-dom";
import { HomePage } from "./home";
import { LoginPage } from "./login";
import { ProductsOverview } from "./products/overview";
import { ProductEditor } from "./products/editor";
import { MaterialsPage } from "./materials";
import { User } from "./model";
import * as api from "./api";
import { ScenarioOverview } from "./scenarios/overview";
import { ScenarioEditor } from "./scenarios/editor";
import { AnalysesOverview } from "./analyses/overview";
import { AnalysisEditor } from "./analyses/editor";
import { ResultView } from "./results/view";

const ErrorPage = () => {
  return (
    <>
      <div>
        <p>
          <strong>Oops!</strong>
        </p>
        <p>
          We can't seem to find the page you're looking for.
        </p>
        <Link to="/">Back to home page</Link>
      </div>
    </>
  );
};

const Root = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    api.getCurrentUser().then(setUser);
  }, [])

  const onLogout = () => {
    api.postLogout().then(() => setUser(null));
    navigate("/");
  };
  return <>
    <MainMenu user={user} onLogout={onLogout} />
    <Outlet context={[user, setUser]} />
  </>;
}

const MainMenu = (props: { user: User | null, onLogout: () => void }) => {

  if (!props.user) {
    return (
      <nav style={{ marginBottom: 30 }}>
        <ul>
          <li><Link to="/"><img src="/logo.png"></img></Link></li>
        </ul>
        <ul>
          <li><Link to="/ui/login">Login</Link></li>
        </ul>
      </nav>
    );
  }

  return (
    <nav style={{ marginBottom: 30 }}>
      <ul>
        <li><Link to="/"><img src="/logo.png"></img></Link></li>
        <li></li>
        <li><Link to="/ui/analyses">Analysis</Link></li>
        <li><Link to="/ui/scenarios">Scenarios</Link></li>
        <li><Link to="/ui/products">Products</Link></li>
        <li><Link to="/ui/materials">Materials</Link></li>
      </ul>
      <ul>
        <li>
          <a onClick={props.onLogout}>Logout</a>
        </li>
      </ul>
    </nav>
  );
};

function main() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <HomePage />,
          index: true,
        },
        {
          path: "/ui/analyses",
          element: <AnalysesOverview />,
        },
        {
          path: "/ui/analyses/edit/:id?",
          element: <AnalysisEditor />,
        },
        {
          path: "/ui/results/:id",
          element: <ResultView />,
        },
        {
          path: "/ui/scenarios",
          element: <ScenarioOverview />,
        },
        {
          path: "/ui/scenarios/edit/:id?",
          element: <ScenarioEditor />,
        },
        {
          path: "/ui/products",
          element: <ProductsOverview />
        },
        {
          path: "/ui/products/edit/:id?",
          element: <ProductEditor />
        },
        {
          path: "/ui/materials",
          element: <MaterialsPage />,
        },
        {
          path: "/ui/login",
          element: <LoginPage />
        }
      ]
    },
  ]);
  const provider = <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>;
  ReactDOM.render(provider, document.getElementById("app"));
}
main();
