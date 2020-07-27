import React from 'react'

function useTasksAfterUpdate(initTasks: any[], deps: any[]) {
  const tasks = React.useRef(initTasks)

  const addTask = (newTask: any) => {
    tasks.current = [...tasks.current, newTask]
  }

  React.useEffect(() => {
    const availableTasks = tasks.current
    if (availableTasks.length) {
      for (const task of availableTasks) {
        task()
      }
      tasks.current = []
    }
  }, deps)

  return [addTask]
}

export default useTasksAfterUpdate
