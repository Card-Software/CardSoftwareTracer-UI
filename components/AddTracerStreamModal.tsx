import React from 'react';
import styled from 'styled-components';

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  width: 500px; /* Adjust width as needed */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  background: #2d3748;
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;

  h1 {
    font-size: 20px;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #fff;
    font-size: 20px;
  }
`;

const ModalBody = styled.div`
  padding: 20px;

  label {
    margin-bottom: 10px;
    color: #4a5568;
    display: block;
  }

  input[type='text'],
  input[type='number'],
  select {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background-color: #edf2f7;
    color: #2d3748;
  }

  textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background-color: #edf2f7;
    color: #2d3748;
    resize: vertical;
  }

  button {
    background: #3182ce;
    border: none;
    color: #fff;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
    margin-top: 10px;

    &:hover {
      background: #2b6cb0;
    }
  }
`;

const AddTracerStreamModal = ({
  onClose,
  onSubmit,
  newTracerStreamId,
  setNewTracerStreamId,
  newTracerStreamProduct,
  setNewTracerStreamProduct,
  newTracerStreamName,
  setNewTracerStreamName,
  newTracerStreamQuantity,
  setNewTracerStreamQuantity,
}) => {
  return (
    <ModalContainer>
      <ModalContent>
        <ModalHeader>
          <h1>Add New Tracer Stream</h1>
          <button onClick={onClose} className="close-button">
            &times;
          </button>
        </ModalHeader>
        <ModalBody>
          <div className="mb-4 flex gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Select Traceability Stream
              </label>
              <select
                value={newTracerStreamId}
                onChange={(e) => setNewTracerStreamId(e.target.value)}
              >
                <option value="" disabled>
                  Select a traceability stream
                </option>
                {/* Populate options from allTracerStreams */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Product
              </label>
              <input
                type="text"
                value={newTracerStreamProduct}
                onChange={(e) => setNewTracerStreamProduct(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={newTracerStreamName}
                onChange={(e) => setNewTracerStreamName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                value={newTracerStreamQuantity}
                onChange={(e) =>
                  setNewTracerStreamQuantity(Number(e.target.value))
                }
              />
            </div>
            <button
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={onSubmit}
            >
              Add Tracer Stream
            </button>
          </div>
          <button onClick={onClose}>Close Modal</button>
        </ModalBody>
      </ModalContent>
    </ModalContainer>
  );
};

export default AddTracerStreamModal;
