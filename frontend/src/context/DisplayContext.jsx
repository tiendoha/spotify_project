import React, { createContext, useState, useContext } from "react";

export const DisplayContext = createContext();

export const DisplayProvider = ({ children }) => {
  const [view, setView] = useState("display"); // "display" hoặc "messages"

  return (
    <DisplayContext.Provider value={{ view, setView }}>
      {children}
    </DisplayContext.Provider>
  );
};