import React, { useState } from 'react';
import { Plus, MoreHorizontal, Calendar, User } from 'lucide-react';
import { Task } from '../board/boardSlice';
import { PRIORITY_COLORS, formatRelativeTime, isDueSoon, isOverdue } from '../../utils';

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="card-base p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
        >
            {task.coverImageUrl && (
                <img
                    src={task.coverImageUrl}
                    alt="Cover"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                />
            )}

            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>

            {task.taskLabels && task.taskLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {task.taskLabels.map(({ label }) => (
                        <span
                            key={label.id}
                            className="px-2 py-0.5 text-xs font-medium rounded-full"
                            style={{ backgroundColor: label.color + '20', color: label.color }}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
                {task.assignees && task.assignees.length > 0 && (
                    <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{task.assignees.length}</span>
                    </div>
                )}

                {task.dueDate && (
                    <div
                        className={`flex items-center ${isOverdue(task.dueDate) ? 'text-red-600' : isDueSoon(task.dueDate) ? 'text-orange-600' : ''
                            }`}
                    >
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatRelativeTime(task.dueDate)}</span>
                    </div>
                )}
            </div>

            {task.priority && task.priority !== 'none' && (
                <div className="mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
