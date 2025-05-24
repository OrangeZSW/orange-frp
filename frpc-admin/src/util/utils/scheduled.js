const scheduledTasks = () => {
    const tasks = [];

    const add = (task, time) => {
        tasks.push({task, time, running: false});
        setInterval(() => {
            if (!tasks.running) {
                tasks.running = true;
                task();
                tasks.running = false;
            }
        }, time);
    };

    const clear = () => {
        tasks.forEach((task) => {
            clearInterval(task.intervalId);
        });
    };

    return {add, clear};
};

export default scheduledTasks;