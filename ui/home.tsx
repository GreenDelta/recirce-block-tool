import * as React from "react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return <>
    <p>
      <strong>Welcome to the ReCircE Block Tool</strong>
    </p>
    <p>
      The Recirce Block Tool was developed in the Recirce project. It's
      designed to help you make informed decisions when it comes to waste
      treatment options for complex products, such as smartphones. With this
      tool, you can assess and compare the impact on both the amount of
      recycled materials and the carbon footprint of waste treatment options.

      To use the tool, you will need a user account. Currently, it is not possible
      to register for an account within the tool. Please send us an email, and we
      will register a user for you. Once you have logged in, you can use the
      tool in the following way:
    </p>

    <ul>
      <li>
        <strong><Link to="/ui/products">Product definition: </Link></strong>
        Start by defining a product as a set of components. Each component can
        contain other components or material parts. These materials can, in
        turn, contain other materials, creating a hierarchical structure.
        <img src="/images/product.png" />
      </li>
      <li>
        <strong><Link to="/ui/processes">Waste treatment modelling: </Link></strong>

        For your product, define a waste treatment process as a series of waste
        treatment steps. In each step, you can specify the fractions of
        components and materials that are handled. Each step can, in a recursive
        fashion, contain further steps for handling the components and materials
        from the previous step. For each component and material handled in a
        step, you define whether it's disposed of, sent to recycling, or passed
        through to the next step in the treatment process.

        The waste treatment steps are linked process data sets that contain
        emission factors. This data is used for calculating the environmental
        impact of the waste treatment options.

        Using the product composition and the waste treatment paths resulting
        from the waste treatment steps, the tool performs calculations. It
        determines the amount of recycled materials and the carbon footprint
        associated with your waste treatment choices.
      </li>
      <li>
        <strong><Link to="/ui/analyses">Analysis: </Link></strong>
        Finally, these waste treatment options can be compared in an analysis,
        considering the recycling of materials and their carbon footprint.
      </li>
    </ul>
  </>;
};
