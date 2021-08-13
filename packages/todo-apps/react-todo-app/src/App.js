import "./App.css";
import Todos from "./Todos";
import React from "react";
import {Router, Route, Link} from "react-router-dom"
import { useState } from "react";

const initialColor = 'white'
const ThemeContext = React.createContext()

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  let onKeyUp = (e) => {
    if (e.key === "Enter") {
      const text = e.target.value;

      setTodos([
        ...todos,
        {
          text: text,
          key: todos.length,
        },
      ]);
      setInput("");
    }
  };

  function onChange(e) {
    setInput(e.target.value);
  }

  class Input extends React.Component {
    render() {
      return <input {...this.props} style={{background:this.context.color}}></input>
    }
  }

  Input.contextType = ThemeContext;
  const [theme, setTheme] = useState({
    color: initialColor
  });

  function toggleTheme() {
    if(theme.color==="white") {
      setTheme({
        color: 'black'
      })
    } else {
      setTheme({
        color: 'white'
      })
    }
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div className="max-w-full pt-4 text-lg">
        <div className="max-w-screen-sm mx-auto p-5 rounded" style={{boxShadow:'1px 1px 10px'}}>
          <h1>
              <Input
                type="text"
                onKeyUp={onKeyUp}
                value={input}
                onChange={onChange}
                placeholder="What needs to be done ?"
                className="w-full border-gray-500 border-b-1 text-3xl p-2 bg-gray-50"
              ></Input>
              <button style={{float:'right'}} onClick={toggleTheme}>Toggle Theme</button>
          </h1>
          <section>{<Todos todos={todos} setTodos={setTodos}></Todos>}</section>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
