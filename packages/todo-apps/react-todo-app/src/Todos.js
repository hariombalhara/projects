import React, { useEffect } from "react";
import Todo from "./Todo";

export default function Todos({ todos, setTodos }) {
  function removeItem(e) {
    const key = +e.currentTarget.getAttribute("todo-key");
    setTodos(function (todos) {
      return todos.filter(function (todo) {
        return todo.key !== key;
      });
    });
  }

  return todos.map((todo) => (
    <Todo key={todo.key} text={todo.text}>
      {/* Can't use key as it has a special meaning */}
      <button todo-key={todo.key} onClick={removeItem}>
        <img src="/minus.png"></img>
      </button>
    </Todo>
  ));
}