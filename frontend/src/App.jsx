import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes"; // Import the router from your routes file

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
