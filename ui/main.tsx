import * as React from "react";
import * as ReactDOM from "react-dom";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { HomePage } from "./home";
import { MainMenu } from "./menu";
import { LoginPage } from "./login";
import { ProductsOverview } from "./products";
import { ProductEditor } from "./product-editor";

const ErrorPage = () => {
  return (
    <>
      <MainMenu />
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
      path: "/ui/analyses",
      element: <Article header="Analyses" />
    },
    {
      path: "/ui/products",
      element: <ProductsOverview />
    },
    {
      path: "/ui/products/create",
      element: <ProductEditor />
    },
    {
      path: "/ui/processes",
      element: <Article header="Processes" />
    },
    {
      path: "/ui/emission-factors",
      element: <Article header="Emission factors" />
    },
    {
      path: "/ui/login",
      element: <LoginPage />
    }
  ]);
  const provider = <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>;
  ReactDOM.render(provider, document.getElementById("app"));
}
main();
