import React from "react";
import { RouterProvider } from "react-router-dom";
import { FirebaseProvider } from "./context/FirebaseContext";
import { ClientsProvider } from "./context/ClientsContext";
import { router } from "./router";

export default function App() {
  return (
    <FirebaseProvider>
      <ClientsProvider>
        <RouterProvider router={router} />
      </ClientsProvider>
    </FirebaseProvider>
  );
}
