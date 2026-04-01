import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GripVertical, 
  Plus, 
  MoreHorizontal, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Layout,
  Zap
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Task, TaskBoardData } from '../types';

const INITIAL_DATA: TaskBoardData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Refine System Design answers', priority: 'High', category: 'Technical' },
    'task-2': { id: 'task-2', content: 'Practice STAR method for behavioral questions', priority: 'Medium', category: 'Behavioral' },
    'task-3': { id: 'task-3', content: 'Update resume with latest project metrics', priority: 'High', category: 'Resume' },
    'task-4': { id: 'task-4', content: 'Research company culture and values', priority: 'Low', category: 'Research' },
    'task-5': { id: 'task-5', content: 'Complete Security Audit for portfolio project', priority: 'Medium', category: 'Security' },
    'task-6': { id: 'task-6', content: 'Review data structures and algorithms', priority: 'High', category: 'Technical' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2', 'task-5'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-3', 'task-6'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Completed',
      taskIds: ['task-4'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

export const TaskBoard: React.FC = () => {
  const [data, setData] = useState<TaskBoardData>(INITIAL_DATA);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (!start || !finish) return;

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      };

      setData(newState);
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    setData(newState);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (columnId: string) => {
    switch (columnId) {
      case 'column-1': return <Clock size={16} className="text-blue-400" />;
      case 'column-2': return <Zap size={16} className="text-amber-400" />;
      case 'column-3': return <CheckCircle2 size={16} className="text-emerald-400" />;
      default: return <Layout size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Layout size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Preparation Roadmap</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Elite Task Management</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus size={16} /> Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            if (!column) return null;
            const tasks = column.taskIds
              .map((taskId) => data.tasks[taskId])
              .filter((task): task is Task => !!task);

            return (
              <div key={column.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(column.id)}
                    <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">
                      {column.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-white/40 border border-white/10">
                      {tasks.length}
                    </span>
                  </div>
                  <button className="text-white/20 hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col gap-3 min-h-[200px] p-2 rounded-2xl transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-white/[0.03]' : 'bg-transparent'
                      }`}
                    >
                      <AnimatePresence>
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="outline-none"
                              >
                                <motion.div
                                  layout
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className={`group relative p-4 rounded-xl border transition-all duration-200 ${
                                    snapshot.isDragging 
                                      ? 'bg-white/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-50 scale-[1.02]' 
                                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="mt-1 text-white/10 group-hover:text-white/30 transition-colors cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical size={16} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <p className="text-sm text-white/80 leading-relaxed font-medium">
                                        {task.content}
                                      </p>
                                      <div className="flex items-center gap-3">
                                        <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                                          {task.priority}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-mono">
                                          <Tag size={10} />
                                          {task.category}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
