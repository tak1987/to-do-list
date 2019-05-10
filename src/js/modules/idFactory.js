let draftId = '';

// ５桁のIDを生成
export const generate = (todoItems) => {
    draftId = '';

    for (let i = 0; i <= 5; i++) {
        draftId += Math.floor(Math.random() * 10);
    }
    if (!todoItems) {
        return draftId;
    } else {
        return verify(draftId, todoItems);
    }
}

// 作成したIDが重複していないか確認
const verify = (draftId, todoItems) => {
    todoItems.forEach((todoItem) => {
        if (todoItem.id === draftId) {
            generate(todoItems);
        }
    });
    return draftId;
}