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

const Details = () => {
  const initialProcesses = [
    {
      id: '1',
      name: 'Section 1',
      description:
        'This is like a longer description for the section but iwant to see how far it actually goes beofre it ellipseis',
      position: 1,
      subSections: [],
    },
    {
      id: '2',
      name: 'Section 2',
      description: '',
      position: 2,
      subSections: [],
    },
    {
      id: '3',
      name: 'Section 3',
      description: '',
      position: 3,
      subSections: [],
    },
  ];

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

  const [processes, setProcesses] = useState(initialProcesses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentProcess, setCurrentProcess] = useState(null);
  const [paramValue, setParamValue] = useState('');
  const isEditing = query.id ? true : false;
  const searchParams = useSearchParams();

  useEffect(() => {
    //console.log(query);
    //console.log(searchParams);
    if (query) {
      console.log(query);
      if (Array.isArray(query.id)) {
        //console.log(query.id);
      }
    }
  }, [query]);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(processes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions based on new index
    items.forEach((item, index) => {
      item.position = index + 1;
    });

    setProcesses(items);
  };

  const deleteProcess = (id) => {
    if (confirm('Are you sure you want to delete this stage?')) {
      setProcesses((prev) => {
        // Remove the process with the specified id
        const filteredProcesses = prev.filter((process) => process.id !== id);

        // Update the position of the remaining processes
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
      id: String(processes.length + 1),
      name: '',
      description: '',
      position: processes.length + 1,
      subSections: [],
    });
  };

  const openModal = (title, process) => {
    setModalTitle(title);
    setCurrentProcess(process);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProcess(null);
  };

  const saveProcess = (data) => {
    if (modalTitle === 'Add New Stage') {
      setProcesses((prev) => [...prev, { ...currentProcess, ...data }]);
    } else {
      setProcesses((prev) =>
        prev.map((process) =>
          process.id === currentProcess.id ? { ...process, ...data } : process,
        ),
      );
    }
    closeModal();
  };

  return (
    <Layout>
      <div>
        <a
          href="/TraceabilityStream"
          className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
        >
          Traceability Stream
        </a>
        <span className="text-sm text-gray-500"> &gt; Details</span>
      </div>

      <div className="me-8 text-xl">
        <h1>
          {isEditing ? 'Edit Traceability Stream' : 'Add Traceability Stream'}
        </h1>
      </div>
      <div className="my-4">
        <label className="block">Name</label>
        <input
          type="text"
          className="mt-1 block rounded-md border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                        style={{
                          ...provided.draggableProps.style,
                          marginBottom: '10px',
                          backgroundColor: '#f4f4f4',
                          padding: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <p>Section Name: {process.name}</p>
                          <p className="max-len overflow-hidden text-ellipsis whitespace-nowrap ">
                            Description: {process.description}
                          </p>
                          <p>Position: {process.position}</p>
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

      <footer className="stream-footer space-between flex bg-gray-200">
        <div>
          <button
            className='hover:bg-blue-600" rounded-md bg-blue-500 px-4 py-2 text-white'
            onClick={router.back}
          >
            Cancel
          </button>
        </div>
        <div>
          {' '}
          <button className='hover:bg-blue-600" ml-3 rounded-md bg-blue-500 px-4 py-2 text-white'>
            Save
          </button>
        </div>
      </footer>
    </Layout>
  );
};

const Modal = ({ isOpen, onClose, onSave, title, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ name, description });
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
