import React, { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';
import { Column } from '../board/boardSlice';
import TaskCard from './TaskCard';

interface BoardColumnProps {
    column: Column;
    onTaskClick: (taskId: string) => void;
    onAddTask: (columnId: string) => void;
    onDeleteColumn: (columnId: string) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
    column,
    onTaskClick,
    onAddTask,
    onDeleteColumn,
}) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{column.name}</h3>
                    <span className="text-xs text-gray-500">({column.tasks.length})</span>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 hover:bg-gray-200 rounded"
                    >
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <button
                                onClick={() => {
                                    // Edit column
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteColumn(column.id);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                            >
                                <TaskCard
                                    task={task}
                                    onClick={() => onTaskClick(task.id)}
                                />
                            </div>
                        )}
                    </Draggable>
                ))}
            </div>

            <button
                onClick={() => onAddTask(column.id)}
                className="w-full mt-3 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
            </button>
        </div>
    );
};

export default BoardColumn;
