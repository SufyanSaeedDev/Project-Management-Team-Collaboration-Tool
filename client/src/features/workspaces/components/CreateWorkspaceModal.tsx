import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../hooks';
import { createWorkspace } from '../workspaces/workspacesSlice';
import { X } from 'lucide-react';

const createWorkspaceSchema = z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters'),
    description: z.string().optional(),
});

type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateWorkspaceForm>({
        resolver: zodResolver(createWorkspaceSchema),
    });

    const onSubmit = async (data: CreateWorkspaceForm) => {
        setIsSubmitting(true);
        const result = await dispatch(createWorkspace(data));
        setIsSubmitting(false);

        if (createWorkspace.fulfilled.match(result)) {
            navigate(`/workspaces/${result.payload.id}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Create New Workspace</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Workspace Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                {...register('name')}
                                className="input-base"
                                placeholder="e.g., Acme Inc"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description (optional)
                            </label>
                            <textarea
                                id="description"
                                {...register('description')}
                                className="input-base"
                                rows={3}
                                placeholder="Describe your workspace..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Workspace'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
