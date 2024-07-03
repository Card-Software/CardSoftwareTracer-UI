import Layout from '@/app/layout';
import TracerButton from '@/components/TracerButton';
import React, { useEffect, useState } from 'react';
import '../../styles/traceabilityStream.css';
import '../../styles/dashboard.css';
import { HiPlus } from 'react-icons/hi';
import dynamic from 'next/dynamic';
import { FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import { orderManagementApiProxy } from '@/proxies/OrderManagement.proxy';
import { Section } from '@/models/Section';
import { TracerStream } from '@/models/TracerStream';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { Organization } from '@/models/Organization';
import { userAuthorizationService } from '@/services/UserAuthorization.service';
import SectionModal from '@/components/SectionModal';
import LoadingOverlay from '@/components/LoadingOverlay'; // Ensure the path is correct

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
  const [originalTracerStream, setOriginalTracerStream] =
    useState<TracerStream | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentProcess, setCurrentProcess] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracerStream, setTracerStream] = useState<TracerStream>({
    name: '',
    description: '',
    notes: [],
    owner: userAuthorizationService.organization,
    sections: [],
  });

  const handleTracerStreamChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setTracerStream({
      ...tracerStream,
      [e.target.name]: e.target.value,
    });
  };

  const organization: Organization = userAuthorizationService.organization;

  const isEditing = !!query.id;

  useEffect(() => {
    if (isEditing && query.id) {
      fetchTraceability(query.id as string);
    }
  }, [isEditing, query]);

  const fetchTraceability = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await orderManagementApiProxy.getTraceability(id);
      setOriginalTracerStream(data);
      setTracerStream(data as TracerStream);
    } catch (error) {
      setError('Failed to fetch traceability details.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tracerStream.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((item, index) => {
      item.position = index + 1;
    });

    setTracerStream({ ...tracerStream, sections: items });
  };

  const deleteProcess = (id: string) => {
    if (confirm('Are you sure you want to delete this stage?')) {
      const filteredProcesses = tracerStream.sections.filter(
        (process) => process.sectionId !== id,
      );
      const updatedProcesses = filteredProcesses.map((process, index) => ({
        ...process,
        position: index + 1,
      }));

      setTracerStream({ ...tracerStream, sections: updatedProcesses });
    }
  };

  const handleAddSection = () => {
    openModal('Add New Section', {
      sectionId: uuidv4(),
      sectionName: '',
      sectionDescription: '',
      position: tracerStream.sections.length + 1,
      notes: [],
      files: [],
      fileNameOnExport: '',
      isRequired: false,
      owner: organization,
    });
  };

  const openModal = (title: string, section: Section) => {
    setModalTitle(title);
    setCurrentProcess(section);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProcess(null);
  };

  const saveSection = (data: Section) => {
    const updatedSections =
      modalTitle === 'Add New Section'
        ? [...tracerStream.sections, data]
        : tracerStream.sections.map((section) =>
            section.sectionId === data.sectionId ? data : section,
          );

    setTracerStream({ ...tracerStream, sections: updatedSections });
    closeModal();
  };

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (isEditing && query.id) {
        // Update existing traceability
        console.log('tracerStream', tracerStream);
        const result = await orderManagementApiProxy.updateTraceability(
          originalTracerStream?.name || '',
          tracerStream,
        );
        if (result) {
          alert('Traceability stream updated successfully!');
        }
      } else {
        // Create new traceability
        const result =
          await orderManagementApiProxy.createTraceability(tracerStream);
        if (result) {
          alert('Traceability stream created successfully!');
        }
      }
      router.push('/TraceabilityStream');
    } catch (error) {
      setError('Failed to save traceability stream.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
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
        <label htmlFor="name" className="block">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={tracerStream.name}
          onChange={handleTracerStreamChange}
          className="mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      <div className="my-4">
        <label htmlFor="description" className="block">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={tracerStream.description}
          onChange={handleTracerStreamChange}
          className="mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      <div className="mb-4">
        <TracerButton
          name="Add New Section"
          icon={<HiPlus />}
          onClick={handleAddSection}
        />
        <p>
          Traceability stream starts from top to bottom. E.g., Position 1 is the
          first stage, and position n is the last stage.
        </p>
      </div>

      <div>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {tracerStream.sections.map((section, index) => (
                  <Draggable
                    key={section.sectionId}
                    draggableId={section.sectionId}
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
                          <p className="font-bold">{section.sectionName}</p>
                          <p className="text-sm text-gray-600">
                            {section.sectionDescription}
                          </p>
                          <p className="text-sm text-gray-500">
                            Position: {section.position}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal('Edit Section', section)}
                            className="rounded-md bg-teal-800 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProcess(section.sectionId)}
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

      {isModalOpen && (
        <SectionModal
          onClose={closeModal}
          onSave={saveSection}
          originalSection={currentProcess as Section}
          mode={'sectionCreation'}
        />
      )}

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
            className="ml-3 rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </footer>
    </Layout>
  );
};

export default Details;
