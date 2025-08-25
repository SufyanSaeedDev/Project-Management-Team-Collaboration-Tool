import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getWorkspaces, clearCurrentWorkspace } from '../workspaces/workspacesSlice';
import { FolderKanban, Plus } from 'lucide-react';
import CreateWorkspaceModal from './components/CreateWorkspaceModal';

const WorkspacesPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { workspaces, isLoading } = useAppSelector((state) => state.workspaces);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        dispatch(getWorkspaces());
        return () => {
            dispatch(clearCurrentWorkspace());
        };
    }, [dispatch]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your team workspaces and projects
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Workspace
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                </div>
            ) : workspaces.length === 0 ? (
                <div className="text-center py-12">
                    <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No workspaces</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new workspace
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-6 btn-primary"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Workspace
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map((workspace) => (
                        <div
                            key={workspace.id}
                            onClick={() => navigate(`/workspaces/${workspace.id}`)}
                            className="card-base cursor-pointer hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="h-12 w-12 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                                    <FolderKanban className="h-6 w-6" />
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${workspace.memberRole === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : workspace.memberRole === 'member'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}
                                >
                                    {workspace.memberRole}
                                </span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                {workspace.name}
                            </h3>
                            {workspace.description && (
                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                    {workspace.description}
                                </p>
                            )}
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <span>Slug: {workspace.slug}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateWorkspaceModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
};

export default WorkspacesPage;
