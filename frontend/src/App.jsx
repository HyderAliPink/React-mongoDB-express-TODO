import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/todos";

  useEffect(function () {
    fetchTodos();
  }, []);

  function fetchTodos() {
    fetch(API_URL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        setTodos(data);
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  }

  function addTodo(e) {
    e.preventDefault();
    if (input.trim() === "") return;

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (newTodo) {
        setTodos([newTodo, ...todos]);
        setInput("");
        toast.success("Task added successfully!");
      })
      .catch(function (error) {
        console.error("Error:", error);
        toast.error("Failed to add task");
      });
  }

  function deleteTodo(id) {
    fetch(API_URL + "/" + id, {
      method: "DELETE",
    })
      .then(function () {
        setTodos(todos.filter(function (todo) {
          return todo._id !== id;
        }));
        toast.success("Task deleted!");
      })
      .catch(function (error) {
        console.error("Error:", error);
        toast.error("Failed to delete task");
      });
  }

  function toggleComplete(id) {
    const todo = todos.find(function (todo) {
      return todo._id === id;
    });

    fetch(API_URL + "/" + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: !todo.completed }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (updatedTodo) {
        setTodos(todos.map(function (todo) {
          return todo._id === id ? updatedTodo : todo;
        }));
        if (updatedTodo.completed) {
          toast.success("Task completed!");
        } else {
          toast("Task marked as incomplete");
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
        toast.error("Failed to update task");
      });
  }

  function startEdit(id, text) {
    setEditId(id);
    setEditText(text);
  }

  function saveEdit(id) {
    if (editText.trim() === "") return;

    fetch(API_URL + "/" + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: editText }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (updatedTodo) {
        setTodos(todos.map(function (todo) {
          return todo._id === id ? updatedTodo : todo;
        }));
        setEditId(null);
        setEditText("");
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  }

  function cancelEdit() {
    setEditId(null);
    setEditText("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo App</h1>
          <p className="text-gray-600">Keep track of your daily tasks</p>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="add tasks and never actually complete them"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Add
            </button>
          </div>
        </form>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-400 text-lg">
                No tasks.
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 animate-slideIn"
              >
                {editId === todo._id ? (
                  // Edit mode
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(todo._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  // Display mode
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo._id)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span
                      className={`flex-1 text-lg transition-all ${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => startEdit(todo._id, todo.text)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {todos.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            <p>
              {todos.filter((todo) => !todo.completed).length} of {todos.length}{" "}
              tasks remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
