
const scheduledTasks = () => {
    const tasks = [];

    const add = (task, time) => {
        tasks.push({ task, time ,running:  false});
    };

    const start = () => {
        for (const { task, time ,running} of tasks) {
            if (!running){
                setInterval(task,time);
            }
        }
    };

    return { add, start };
};

export default scheduledTasks;