import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useAppDispatch, useAppSelector, useSocketBoard } from '../../hooks';
import { getBoardColumns, createColumn, deleteColumn, moveTask, updateTaskOptimistic } from '../board/boardSlice';
import { getProjectById } from '../projects/projectsSlice';
import BoardColumn from './components/BoardColumn';
import TaskDetailModal from '../tasks/components/TaskDetailModal';
import { Plus, ArrowLeft } from 'lucide-react';

const ProjectBoardPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { columns, isLoading } = useAppSelector((state) => state.board);
    const { currentProject } = useAppSelector((state) => state.projects);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Set up Socket.io listeners for real-time board updates
    useSocketBoard(projectId);

    useEffect(() => {
        if (projectId) {
            dispatch(getBoardColumns(projectId));
            dispatch(getProjectById(projectId));
        }
    }, [dispatch, projectId]);

    const handleAddTask = (columnId: string) => {
        // TODO: Open task creation modal
        console.log('Add task to column:', columnId);
    };

    const handleDeleteColumn = async (columnId: string) => {
        if (confirm('Are you sure you want to delete this column?')) {
            await dispatch(deleteColumn(columnId));
            if (projectId) {
                dispatch(getBoardColumns(projectId));
            }
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // If dropped outside or in same position, do nothing
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        // Optimistic update to UI
        dispatch(updateTaskOptimistic({
            taskId: draggableId,
            sourceColumnId: source.droppableId,
            destColumnId: destination.droppableId,
            newIndex: destination.index,
        }));

        // Send to backend
        try {
            await dispatch(moveTask({
                taskId: draggableId,
                destColumnId: destination.droppableId,
                position: destination.index,
            }));
        } catch (error) {
            // On error, refresh the board
            if (projectId) {
                dispatch(getBoardColumns(projectId));
            }
        }
    };

    const handleCreateColumn = async () => {
        if (newColumnName.trim() && projectId) {
            await dispatch(createColumn({ projectId, name: newColumnName }));
            setNewColumnName('');
            setShowAddColumn(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/workspaces')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {currentProject?.name || 'Project Board'}
                        </h1>
                        {currentProject?.description && (
                            <p className="text-sm text-gray-500 mt-1">{currentProject.description}</p>
                        )}
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-4 h-full pb-4">
                        {columns.map((column) => (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-shrink-0 w-80 ${snapshot.isDraggingOver ? 'bg-primary-50 rounded-lg' : ''}`}
                                    >
                                        <BoardColumn
                                            column={column}
                                            onTaskClick={(taskId) => setSelectedTaskId(taskId)}
                                            onAddTask={handleAddTask}
                                            onDeleteColumn={handleDeleteColumn}
                                        />
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}

                        <div className="flex-shrink-0 w-80">
                            {showAddColumn ? (
                                <div className="bg-gray-100 rounded-lg p-3">
                                    <input
                                        type="text"
                                        value={newColumnName}
                                        onChange={(e) => setNewColumnName(e.target.value)}
                                        placeholder="Enter column name..."
                                        className="input-base mb-2"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateColumn();
                                            if (e.key === 'Escape') setShowAddColumn(false);
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleCreateColumn} className="btn-primary text-sm">
                                            Add Column
                                        </button>
                                        <button
                                            onClick={() => setShowAddColumn(false)}
                                            className="btn-secondary text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAddColumn(true)}
                                    className="w-full h-full min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add Column
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </DragDropContext>

            {/* Task Detail Modal */}
            <TaskDetailModal
                taskId={selectedTaskId || ''}
                isOpen={!!selectedTaskId}
                onClose={() => setSelectedTaskId(null)}
            />
        </div>
    );
};

export default ProjectBoardPage;
