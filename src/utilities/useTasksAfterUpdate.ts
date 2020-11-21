import React from 'react'

export default function useTasksAfterUpdate(initTasks: any[], deps: any[]) {
  const tasks = React.useRef(initTasks)

  const addTask = React.useCallback((newTask: any) => {
    tasks.current = [...tasks.current, newTask]
  }, [])

  React.useEffect(() => {
    const availableTasks = tasks.current
    if (availableTasks.length) {
      for (const task of availableTasks) {
        task()
      }
      tasks.current = []
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return [addTask]
}
