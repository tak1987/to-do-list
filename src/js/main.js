import * as storage from './modules/storage';
import * as idFactory from './modules/idFactory';
import $ from 'jquery';
import '../css/main.css';

const model = {
    displayMode: all,
    todos: []
}


const controller = {
    init: () => {
        controller.retrieveFromStorage();
        view.init();
        filterView.init();
    },
    retrieveFromStorage: () => {
        const retrievedTodos = storage.retrieveFromStorage();
        if (retrievedTodos) {
            model.todos = retrievedTodos;
        }
        view.render();
    },
    addTodo: (value) => {
        model.todos.push({
            todoText: value,
            completed: false,
            id: idFactory.generate(controller.getTodos()),
        });
        view.render();
    },
    getTodos: () => {
        return model.todos;
    },
    getTodosLength: () => {
        return model.todos.length;
    },
    getFilteredTodos: (displayMode) => {
        return $.grep(model.todos, (todo) => {
            if (displayMode == 'completed') {
               return todo.completed == true;
            } else if (displayMode == 'active') {
                return todo.completed == false;
            } else {
                return todo;
            }
        });
    },
    getNumberOfCompletedTodos: () => {
        let i = 0;
        $.each(model.todos, function (todo) {
            if (this.completed == true) {
                i++;
            } 
        });
        return i;
    },
    getNumberOfActiveTodos: () => {
        let i = 0;
        $.each(model.todos, function (todo) {
            if (this.completed == false) {
                i++;
            } 
        });
        return i;
    },
    getIndexOfTargetTodo: (e) => {
        const targetTodoId = $(e.target.closest('li')).attr('id'),
              todos = controller.getTodos();
        let i = controller.getTodos().length;

        while(i--) {
            if (todos[i].id === targetTodoId) {
                return i;
            }
        }
    },
    deleteTodo: (e) => {
        const targetTodoIndex = controller.getIndexOfTargetTodo(e);
        const todos = controller.getTodos();      
        todos.splice(targetTodoIndex, 1);

        view.render();
    },
    updateToggleAllBtnStyle: () => {
        const todoLength = controller.getTodosLength();
        const numberOfCompletedItems = controller.getNumberOfCompletedTodos();

        if (todoLength > 0 && todoLength === numberOfCompletedItems) {
            $('#toggle-all-button').addClass('all-completed');
        } else {
            $('#toggle-all-button').removeClass('all-completed');
        }
    },
    updateTodos: (newTodos) => {
        model.todos = newTodos;
    },
    deleteCompletedTodos: () => {
        const todos = controller.getTodos();
        const newTodos = $.map(todos, (todo) => {
            if (todo.completed === false) {
                return todo;
            }
        });
        controller.updateTodos(newTodos);
        view.render();
    },
    toggleTodo: (e) => {
        const targetTodoIndex = controller.getIndexOfTargetTodo(e);
        const todos = controller.getTodos();

        todos[targetTodoIndex].completed = !todos[targetTodoIndex].completed;            
        view.render();
    },
    toggleAllTodos: () => {
        const numberOfCompletedItems = controller.getNumberOfCompletedTodos();
        if (model.todos.length === numberOfCompletedItems) {
            $.each(model.todos, (i, todo) => {
                todo.completed = false;
            });
        } else {
            $.each(model.todos, (i, todo) => {
                todo.completed = true; 
            });
        }
        view.render();
    },
    changeDisplayMode: (displayMode) => {
        model.displayMode = displayMode;
        view.render();
    },
    getDisplayMode: () => {
        return model.displayMode
    },
    toggleClearCompletedBtn: () => {
        filterView.toggleClearCompletedBtn();
    },
    toggleFilterContainer: () => {
        filterView.toggleFilterContainer();
    },
    displayNumberOfActiveTodos: () => {
        filterView.numberOfActiveTodos();
    },
    updateStorage: () => {
        const todos = controller.getTodos();
        storage.updateStorage(todos);
    }
}

// input-container, todo-container を管理
const view = {
    init: () => {
        $('#todoInput').keydown((e) => view.add(e));
        $('.todo-items')
            .click((e) => {
                if (e.target.className === 'delete-button') {
                    view.delete(e);
                } else if (e.target.className === 'toggle-button') {
                    view.toggle(e);
                }
            })
            .dblclick((e) => view.reviseInput(e));

        $('#toggle-all-button').click((e) => view.toggleAll());
    },
    reviseInput: (e) => {
        const todos = controller.getTodos();
        const $reviseInput = $(e.target.closest('li')).addClass('editing').find('.revise-input');
        let targetTodoIndex = controller.getIndexOfTargetTodo(e);

        $reviseInput.focus();
        $reviseInput.val(todos[targetTodoIndex].todoText)

        $reviseInput.keydown((e) => {
            if (e.which === 13　&& $reviseInput.val()) {               
                todos[targetTodoIndex].todoText = $reviseInput.val();
                $(e.target.closest('li')).removeClass('editing');
                view.render();
            } 
        });
        $(window).click((event) => {
            if (event.target.className !== "revise-input") {
                $(e.target.closest('li')).removeClass('editing');
            } 
        });
    },
    add: (e) => {
        if (e.which === 13 && !$('#todoInput').val() == '') {
            const value = $('#todoInput').val();
            controller.addTodo(value);
            $('#todoInput').val('');
        }
    },
    render: () => {
        const displayMode = controller.getDisplayMode();
        const filteredTodos = controller.getFilteredTodos(displayMode);

        $('.todo-container .todo-items').html('');
        $.each(filteredTodos, (index, todo) => {
            $('.todo-container .todo-items').append(`
                <li class="todo-item ${todo.completed === false ? '' : 'completed'}" id="${todo.id}">
                    <div class="viewport">
                        <label>${todo.todoText}</label>
                        <input class="toggle-button" type="checkbox">
                        <div class='delete-button'></div>
                    </div>
                    <input class="revise-input" autofocus>
                </li>
            `);
        });
        controller.updateToggleAllBtnStyle();
        controller.toggleClearCompletedBtn();
        controller.toggleFilterContainer();
        controller.displayNumberOfActiveTodos();
        controller.updateStorage();
    },
    delete: (e) => {
        controller.deleteTodo(e);
    },
    toggle: (e) => {
        controller.toggleTodo(e);
    },
    toggleAll: () => {
        controller.toggleAllTodos();
    }
}

// filter-container を管理
const filterView = {
    init: () => {
        filterView.toggleFilterContainer();
        filterView.numberOfActiveTodos();
        $('.buttons').click((e) => filterView.changeDisplayMode(e));
        $('#clear-completed-button').click(() => filterView.clearCompletedTodos());
    },
    toggleFilterContainer: () => {
        const todoLength = controller.getTodos().length;
        if (todoLength > 0) {
            $('.filter-container').show();
        } else {
            $('.filter-container').hide();
        }
    },
    numberOfActiveTodos: () => {
        const numberOfActiveTodos = controller.getNumberOfActiveTodos();
        if (numberOfActiveTodos === 1) {
            $('.active-todo-counter').html(`${numberOfActiveTodos} item left`);
        } else if (numberOfActiveTodos > 1 || numberOfActiveTodos === 0) {
            $('.active-todo-counter').html(`${numberOfActiveTodos} items left`);
        }
    },
    toggleClearCompletedBtn: () => {
        const numberOfCompletedItems = controller.getNumberOfCompletedTodos();
        if (numberOfCompletedItems > 0) {
            $('#clear-completed-button').show();
        } else {
            $('#clear-completed-button').hide();
        }
    },
    clearCompletedTodos: () => {
        controller.deleteCompletedTodos();
    },
    changeDisplayMode: (e) => {
        const displayMode = $(e.target.closest('li')).attr('id');
        controller.changeDisplayMode(displayMode);
        filterView.changeSelectedBtn(displayMode);
    },
    changeSelectedBtn: (selectedBtnId) => {
        $('.filter-container .button').removeClass('selected');
        $(`#${selectedBtnId}`).addClass('selected');
    }
}

controller.init();