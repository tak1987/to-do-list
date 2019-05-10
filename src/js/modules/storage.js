export const retrieveFromStorage = () => {
    return JSON.parse(localStorage.getItem('todos'));
}

export const updateStorage = (todos) => {
    localStorage.clear();
    localStorage.setItem('todos', JSON.stringify(todos));
}
