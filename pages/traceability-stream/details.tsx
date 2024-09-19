import Layout from '@/app/layout';
import TracerButton from '@/components/tracer-button.component';
import React, { useEffect, useState } from 'react';
import '@/styles/traceability-stream.css';
import '../../styles/dashboard.css';
import { HiPlus } from 'react-icons/hi';
import dynamic from 'next/dynamic';
import { FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { orderManagementApiProxy } from '@/proxies/order-management.proxy';
import { Section } from '@/models/section';
import { TracerStream } from '@/models/tracer-stream';
import Link from 'next/link';
import { Organization } from '@/models/organization';
import SectionModal from '@/components/modals/section-modal.component';
import LoadingOverlay from '@/components/loading-overlay.component'; // Ensure the path is correct
import { userAuthenticationService } from '@/services/user-authentication.service';
import withAuth from '@/hoc/auth';
import { User } from '@/models/user';
import { ObjectId } from 'bson';

const Details = () => {
  // #region States
  const router = useRouter();
  const { query } = router;
  const [originalTracerStream, setOriginalTracerStream] =
    useState<TracerStream | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentProcess, setCurrentProcess] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tracerStream, setTracerStream] = useState<TracerStream>({
    name: '',
    description: '',
    notes: [],
    ownerRef: userAuthenticationService.getOrganization()?.id || '',
    sections: [],
  });

  const organization: Organization =
    userAuthenticationService.getOrganization() as Organization;
  const user: User = userAuthenticationService.getUser() as User;
  const IsAdmin = user.role.includes('Admin');
  const isEditing = !!query.id;
  // #endregion

  // #region Use Effects
  useEffect(() => {
    if (isEditing && query.id) {
      fetchTraceability(query.id as string);
    }
  }, [isEditing, query]);
  // #endregion

  // #region controller functions
  const handleTracerStreamChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setTracerStream({
      ...tracerStream,
      [e.target.name]: e.target.value,
    });
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

  const nextSection = () => {
    const currentIndex = tracerStream.sections.findIndex(
      (section) => section.sectionId === currentProcess?.sectionId,
    );
    const nextIndex = currentIndex + 1;
    if (nextIndex < tracerStream.sections.length) {
      openModal('Edit Section', tracerStream.sections[nextIndex]);
    }
  };

  const previousSection = () => {
    const currentIndex = tracerStream.sections.findIndex(
      (section) => section.sectionId === currentProcess?.sectionId,
    );
    const previousIndex = currentIndex - 1;
    if (previousIndex >= 0) {
      openModal('Edit Section', tracerStream.sections[previousIndex]);
    }
  };

  const handleAddSection = () => {
    openModal('Add New Section', {
      sectionId: new ObjectId().toString(),
      sectionName: '',
      sectionDescription: '',
      position: tracerStream.sections.length + 1,
      notes: [],
      files: [],
      fileNameOnExport: null,
      isRequired: true,
      ownerRef: organization.id,
      teamLabels: [],
      assignedUser: null,
    });
  };

  const openModal = (title: string, section: Section) => {
    setModalTitle(title);
    section.fileNameOnExport =
      section.fileNameOnExport !== '' ? section.fileNameOnExport : null;
    section.assignedUser = section.assignedUser || null;
    setCurrentProcess(section);
    setIsModalOpen(true);
    setScrollPosition(window.scrollY); // Save the scroll position
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProcess(null);
    window.scrollTo(0, scrollPosition);
  };

  const saveSection = (
    data: Section,
    move: 'Right' | 'Left' | null | undefined,
  ) => {
    const updatedSections =
      modalTitle === 'Add New Section'
        ? [...tracerStream.sections, data]
        : tracerStream.sections.map((section) =>
            section.sectionId === data.sectionId ? data : section,
          );

    setTracerStream({ ...tracerStream, sections: updatedSections });
    if (move === 'Right') {
      nextSection();
    } else if (move === 'Left') {
      previousSection();
    } else {
      closeModal();
    }
  };

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (isEditing && query.id) {
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

  //#endregion
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

  //# region Drag and Drop function
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

  //#endregion

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

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="mb-20">
        <div>
          <Link
            href="/traceability-stream"
            className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
          >
            Traceability Stream
          </Link>
          <span className="text-sm text-gray-500"> &gt; Details</span>
        </div>
        <div className="tool-bar">
          <div className="tool-bar-title">
            <h1>
              {isEditing
                ? 'Edit Traceability Stream'
                : 'Add Traceability Stream'}
            </h1>
          </div>
          <div className="tool-bar-buttons">
            {IsAdmin && (
              <TracerButton
                name="Section"
                icon={<HiPlus />}
                onClick={handleAddSection}
              />
            )}
          </div>
        </div>

        <div
          className="my-2 w-full border-b-4"
          style={{ borderColor: 'var(--primary-color)' }}
        ></div>

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
            className="input-custom"
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
            className="input-custom"
          />
        </div>

        <div className="mb-4">
          <p>
            Traceability stream starts from top to bottom. E.g., Position 1 is
            the first stage, and position n is the last stage.
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
                          className={`mb-4 grid grid-cols-5 items-center gap-4 rounded-lg p-4 ${
                            section.isRequired
                              ? 'border border-gray-300 bg-gray-100'
                              : 'border border-gray-300 bg-white'
                          }`}
                        >
                          {/* Section Name */}
                          <div>
                            <p className="font-bold text-gray-700">
                              Section Name:
                            </p>
                            <p className="font-bold">{section.sectionName}</p>
                          </div>

                          {/* Section Description */}
                          <div>
                            <p className="font-bold text-gray-700">
                              Description:
                            </p>
                            <p className="text-sm text-gray-600">
                              {section.sectionDescription}
                            </p>
                          </div>

                          {/* Section Position */}
                          <div>
                            <p className="font-bold text-gray-700">Position:</p>
                            <p className="text-sm text-gray-500">
                              {section.position}
                            </p>
                          </div>

                          {/* Section Labels */}
                          <div className="">
                            <p className="font-bold text-gray-700">Labels:</p>
                            {section.teamLabels.length > 0 ? (
                              <div className="flex space-x-2">
                                {section.teamLabels.map((label) => (
                                  <div
                                    key={label.id}
                                    className="rounded-2xl bg-gray-100 p-1 px-4 text-sm text-blue-500"
                                  >
                                    <span className="py-1 text-sm text-blue-500">
                                      {label.labelName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No labels</p>
                            )}
                          </div>

                          {/* Edit/Delete buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openModal('Edit Section', section)}
                              className="rounded-md border border-blue-500 bg-white px-4 py-2 text-blue-500 shadow-none hover:bg-blue-500 hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProcess(section.sectionId)}
                              className="square text-red-500 hover:text-red-700"
                            >
                              <FaTrash className="h-5 w-5 fill-black" />
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

        <SectionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          productOrderId=""
          onSave={(section, move) => saveSection(section, move)}
          initialSection={currentProcess as Section}
          mode={'sectionCreation'}
          totalSections={tracerStream.sections.length}
        />
      </div>

      <footer
        className="stream-footer flex justify-between bg-gray-200 p-4"
        style={{ backgroundColor: 'var(--primary-color)' }}
      >
        <div>
          <button
            className="rounded-md border border-white bg-none px-4 py-2 text-white hover:bg-gray-600"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          {IsAdmin && (
            <button
              onClick={handleSave}
              className="ml-3 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </footer>
    </Layout>
  );
};

export default withAuth(Details);
