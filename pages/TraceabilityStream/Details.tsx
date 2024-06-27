import Layout from '@/app/layout';
import TracerButton from '@/components/TracerButton';
import React, { useEffect, useState } from 'react';
import '../../styles/traceabilityStream.css';
import '../../styles/dashboard.css';
import { HiPlus } from 'react-icons/hi';
import dynamic from 'next/dynamic';
import { FaTrash, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import { traceabilityApiProxyService } from '@/proxies/TraceabilityApi.proxy';
import { Section } from '@/models/Section';
import { TracerStream } from '@/models/TracerStream';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

interface SectionWithId extends Section {
  id: string;
}

const Details = () => {
  const DragDropContext = dynamic(
    () => import('react-beautiful-dnd').then((mod) => mod.DragDropContext),
    {
      ssr: false,
    },
  );

  const Droppable = dynamic(
    () => import('react-beautiful-dnd').then((mod) => mod.Droppable),
    {
      ssr: false,
    },
  );

  const Draggable = dynamic(
    () => import('react-beautiful-dnd').then((mod) => mod.Draggable),
    {
      ssr: false,
    },
  );

  const router = useRouter();
  const { query } = router;
  const searchParams = useSearchParams();

  const [processes, setProcesses] = useState<SectionWithId[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentProcess, setCurrentProcess] = useState<SectionWithId | null>(
    null,
  );
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!query.id;

  useEffect(() => {
    if (isEditing && query.id) {
      fetchTraceability(query.id as string);
    }
  }, [isEditing, query]);

  const fetchTraceability = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await traceabilityApiProxyService.getTraceability(id);
      setName(data.name || '');
      setProcesses(
        data.sections.map((section: Section) => ({
          ...section,
          id: uuidv4(),
        })) || [],
      );
    } catch (error) {
      setError('Failed to fetch traceability details.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(processes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((item, index) => {
      item.position = index + 1;
    });

    setProcesses(items);
  };

  const deleteProcess = (id: string) => {
    if (confirm('Are you sure you want to delete this stage?')) {
      setProcesses((prev) => {
        const filteredProcesses = prev.filter((process) => process.id !== id);
        const updatedProcesses = filteredProcesses.map((process, index) => ({
          ...process,
          position: index + 1,
        }));
        return updatedProcesses;
      });
    }
  };

  const handleAddProcess = () => {
    openModal('Add New Stage', {
      id: uuidv4(),
      sectionName: '',
      sectionDescription: '',
      position: processes.length + 1,
      files: [],
      notes: '',
    });
  };

  const openModal = (title: string, process: SectionWithId) => {
    setModalTitle(title);
    setCurrentProcess(process);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProcess(null);
  };

  const saveProcess = (data: Partial<SectionWithId>) => {
    if (modalTitle === 'Add New Stage') {
      setProcesses((prev) => [
        ...prev,
        { ...currentProcess, ...data } as SectionWithId,
      ]);
    } else {
      setProcesses((prev) =>
        prev.map((process) =>
          process.id === currentProcess?.id ? { ...process, ...data } : process,
        ),
      );
    }
    closeModal();
  };

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);
    const newTraceability: TracerStream = {
      name,
      sections: processes,
    };

    try {
      if (isEditing) {
        // Update existing traceability
        await traceabilityApiProxyService.createTraceability(newTraceability);
        alert('Traceability stream updated successfully!');
      } else {
        // Create new traceability
        await traceabilityApiProxyService.createTraceability(newTraceability);
        alert('Traceability stream created successfully!');
        router.push('/TraceabilityStream');
      }
    } catch (error) {
      setError('Failed to save traceability stream.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <Link
          href="/TraceabilityStream"
          className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
        >
          Traceability Stream
        </Link>
        <span className="text-sm text-gray-500"> &gt; Details</span>
      </div>

      <div className="me-8 text-xl">
        <h1>
          {isEditing ? 'Edit Traceability Stream' : 'Add Traceability Stream'}
        </h1>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="my-4">
        <label className="block">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      <div className="mb-4">
        <TracerButton
          name="Add New Stage"
          icon={<HiPlus />}
          onClick={handleAddProcess}
        />
        <p>
          Traceability stream starts from top to bottom. E.g., Position 1 is the
          first stage, and position n is the last stage.
        </p>
      </div>

      <div>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="processes">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {processes.map((process, index) => (
                  <Draggable
                    key={process.id}
                    draggableId={process.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mb-4 flex justify-between rounded-lg bg-gray-200 p-4"
                      >
                        <div>
                          <p className="font-bold">{process.sectionName}</p>
                          <p className="text-sm text-gray-600">
                            {process.sectionDescription}
                          </p>
                          <p className="text-sm text-gray-500">
                            Position: {process.position}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal('Edit Stage', process)}
                            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProcess(process.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveProcess}
        title={modalTitle}
        initialData={currentProcess}
      />

      <footer className="stream-footer flex justify-between bg-gray-200 p-4">
        <div>
          <button
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="ml-3 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </footer>
    </Layout>
  );
};

const Modal = ({
  isOpen,
  onClose,
  onSave,
  title,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { sectionName: string; sectionDescription: string }) => void;
  title: string;
  initialData: SectionWithId | null;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.sectionName || '');
      setDescription(initialData.sectionDescription || '');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ sectionName: name, sectionDescription: description });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="w-1/3 rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Position</label>
          <input
            type="text"
            value={initialData?.position}
            readOnly
            className="w-full rounded-md border bg-gray-100 px-3 py-2"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Details;
