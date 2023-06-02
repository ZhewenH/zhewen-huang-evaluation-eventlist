const API = (function () {
    const API_URL = "http://localhost:3000/todos";
  
    const getTodos = async () => {
      const res = await fetch(`${API_URL}`);
      return await res.json();
    };
  
    const postTodo = async (newTodo) => {
      const res = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(newTodo),
      });
      return await res.json();
    };
  
    const deleteTodo = async (id) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      return await res.json();
    };

    const editTodo = async (id, updateTodo) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(updateTodo),
              completed: false,
      });
      return await res.json();
      };
  
    return {
      getTodos,
      postTodo,
      deleteTodo,
      editTodo,
    };
  })();
  
  class TodoModel {
    #todos = [];
    constructor() {}
    getTodos() {
      return this.#todos;
    }
    async fetchTodos() {
      this.#todos = await API.getTodos();
    }
    async addTodo(newTodo) {
      const todo = await API.postTodo(newTodo);
      this.#todos.push(todo);
      return todo;
    }
  
    async removeTodo(id) {
      const removedId = await API.deleteTodo(id);
      this.#todos = this.#todos.filter((todo) => todo.id !== id);
      return removedId;
    }

    // async editTodo(id, newTodo) {
    //   const todo = await API.postTodo(newTodo);
    //   const editId = await API.editTodo(id, todo);
    //   this.#todos = this.#todos.filter((todo) => todo.id !== editId);
    //   this.#todos.push(todo);
    //   return editId;
    // }

    async editTodo(id, newTodo) {
      const editedTodo = await API.editTodo(id, newTodo);
      const index = this.#todos.findIndex((todo) => todo.id === id);
      if (index !== -1) {
        this.#todos[index] = editedTodo;
      }
      return editedTodo.id;
    }
    
  }
  
  class TodoView {
    constructor() {
      this.form = document.querySelector(".todo-app__form");
      this.sortBtn = document.querySelector(".todo-app__sort-btn");
      this.input = document.getElementById("todo-app__input");
      this.todolist = document.querySelector(".todolist");
    }
  
    initRenderTodos(todos) {
      this.todolist.innerHTML = "";
      todos.forEach((todo) => {
        this.appendTodo(todo);
      });
    }
  
    removeTodo(id) {
      const element = document.getElementById(`todo-${id}`);
      element.remove();
    }

    editTodo(id, todo) {
      const existingElement = document.getElementById(`todo-${id}`);
      const editedElement = this.createTodoElem(todo);
      existingElement.replaceWith(editedElement);
    }
  
    appendTodo(todo) {
      const todoElem = this.createTodoElem(todo);
      this.todolist.append(todoElem);
    }
  
    createTodoElem(todo) {
      const todoElem = document.createElement("div");
      todoElem.classList.add("todo");
      todoElem.setAttribute("id", `todo-${todo.id}`);
  
      const title = document.createElement("div");
      title.classList.add("title");
      title.textContent = todo.title;

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("todo__delete-btn");
      deleteBtn.setAttribute("remove-id", todo.id);
      deleteBtn.textContent = "DELETE";

      const editForm = document.createElement("form");
      editForm.classList.add("todo__edit-form");

      const editBtn = document.createElement("button");
      editBtn.classList.add("todo__edit-btn");
      editBtn.setAttribute("edit-id", todo.id);
      editBtn.textContent = "EDIT";

      const editInput = document.createElement("input");
      editInput.classList.add("todo__edit-input");
      editInput.setAttribute("id", `edit-${todo.id}`);

      editForm.append(editInput, editBtn);

      todoElem.append(title, deleteBtn, editForm);
      return todoElem;
    }
  }
  
  class TodoController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
      this.init();
    }
  
    async init() {
      this.setUpEvents();
      await this.model.fetchTodos();
      this.view.initRenderTodos(this.model.getTodos());
    }
  
    setUpEvents() {
      this.setUpAddEvent();
      this.setUpDeleteEvent();
      this.setUpEditEvent();
      this.setUpSortEvent();
    }
  
    setUpAddEvent() {
      this.view.form.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = this.view.input.value;
        this.model
          .addTodo({
            title,
            completed: false,
          })
          .then((todo) => {
            this.view.appendTodo(todo);
          });
      });
    }
  
    setUpDeleteEvent() {
      this.view.todolist.addEventListener("click", (e) => {
        const isDeleteBtn = e.target.classList.contains("todo__delete-btn");
        if (isDeleteBtn) {
          const removeId = e.target.getAttribute("remove-id");
          this.model.removeTodo(removeId).then(() => {
            this.view.removeTodo(removeId);
          });
        }
      });
    }

    setUpEditEvent() {
      this.view.todolist.addEventListener("click", (e) => {
        const isEditBtn = e.target.classList.contains("todo__edit-btn");
        if (isEditBtn) {
          const editId = e.target.getAttribute("edit-id");
          const editInput = document.getElementById(`edit-${editId}`);
          const title = editInput.value;
          this.model.editTodo(editId, { title }).then((todo) => {
            this.view.editTodo(editId, todo);
          });
        }
      });
    }
    
    setUpSortEvent() {
      this.view.sortBtn.addEventListener("click", () => {
        const todos = this.model.getTodos();
        const sortedTodos = todos.slice().sort((a, b) => {
          const titleA = a.title.toUpperCase();
          const titleB = b.title.toUpperCase();
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
        this.view.initRenderTodos(sortedTodos);
      })
    }
  }
  
  const model = new TodoModel();
  const view = new TodoView();
  const controller = new TodoController(model, view);