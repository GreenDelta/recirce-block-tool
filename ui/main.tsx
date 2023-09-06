import * as React from "react";
import * as ReactDOM from "react-dom";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { HomePage } from "./home";
import { MainMenu } from "./menu";
import { LoginPage } from "./login";
import { ProductEditor, ProductsOverview } from "./products";

const ErrorPage = () => {
  return <div>
    <h1>Oops!</h1>
    <p>
      We can't seem to find the page you're looking for.
    </p>
  </div>;
};

const Article = ({ header }: { header: string }) => {
  return <>
    <MainMenu />
    <article>
      <header>{header}</header>
      No content yet...
    </article>
  </>
}

function main() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/analyses",
      element: <Article header="Analyses" />
    },
    {
      path: "/products",
      element: <ProductsOverview />
    },
    {
      path: "/products/create",
      element: <ProductEditor />
    },
    {
      path: "/processes",
      element: <Article header="Processes" />
    },
    {
      path: "/emission-factors",
      element: <Article header="Emission factors" />
    },
    {
      path: "/login",
      element: <LoginPage />
    }
  ]);
  const provider = <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>;
  ReactDOM.render(provider, document.getElementById("app"));
}
main();
