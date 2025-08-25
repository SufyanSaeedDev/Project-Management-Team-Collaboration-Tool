import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../lib/axios';
import { Plus, ArrowLeft } from 'lucide-react';

interface ClientPortalBoard {
    id: string;
    name: string;
    description?: string;
    columns: Array<{
        id: string;
        name: string;
        tasks: Array<{
            id: string;
            title: string;
            description?: string;
            priority: string;
            position: number;
        }>;
    }>;
}

const ClientPortalPage: React.FC = () => {
    const { clientToken } = useParams<{ clientToken: string }>();
    const [board, setBoard] = useState<ClientPortalBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                if (!clientToken) throw new Error('No client token provided');

                // Use public axios client without auth
                const response = await axios.get(`/portal/${clientToken}`);
                setBoard(response.data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load board');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoard();
    }, [clientToken]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow p-6 max-w-md">
                    <h1 className="text-lg font-bold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow p-6 max-w-md">
                    <p className="text-gray-600">Board not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-full mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
                            {board.description && (
                                <p className="text-sm text-gray-500 mt-1">{board.description}</p>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">This is a read-only view. You can view and comment on tasks.</p>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-4">
                    {board.columns.map((column) => (
                        <div key={column.id} className="flex-shrink-0 w-80 bg-white rounded-lg shadow p-4">
                            <h2 className="font-semibold text-gray-900 mb-4">{column.name}</h2>
                            <div className="space-y-3">
                                {column.tasks.map((task) => (
                                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                                        <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                                        {task.description && (
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                                        )}
                                        {task.priority && task.priority !== 'none' && (
                                            <div className="mt-2">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {column.tasks.length === 0 && (
                                    <p className="text-xs text-gray-500 text-center py-4">No tasks</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientPortalPage;
