import React, { useState, useRef, useEffect, use } from 'react';
import styled from 'styled-components';
import { TracerStream, TracerStreamExtended } from '@/models/tracer-stream';
import { FaTimes } from 'react-icons/fa';
import { fileManagementApiProxy } from '@/proxies/file-management.proxy';
import { orderManagementApiProxy } from '@/proxies/order-management.proxy';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { Organization } from '@/models/organization';
import LoadingOverlay from '../loading-overlay.component';
import { ObjectId } from 'bson';
import BaseModal from '../_base/base-modal.component';

interface TracerStreamModalProps {
  originalTracerStream: TracerStreamExtended | null;
  onClose: () => void;
  onSave: (tracerStream: TracerStreamExtended) => void;
  mode: 'edit' | 'add';
  isOpen: boolean;
}

const owner = userAuthenticationService.getOrganization();

const TracerStreamModal: React.FC<TracerStreamModalProps> = ({
  originalTracerStream,
  onClose,
  onSave,
  isOpen = false,
  mode,
}) => {
  const userOwner = userAuthenticationService.getOrganization();
  if (!userOwner) {
    throw new Error('User organization is not set.');
  }
  const [tracerStream, setTracerStream] = useState<TracerStreamExtended>(
    originalTracerStream || {
      id: new ObjectId().toString(),
      friendlyName: '',
      quantity: 1,
      product: '',
      name: '',
      description: '',
      notes: [],
      sections: [],
      ownerRef: userOwner.id,
      tracerStreamReference: '',
    },
  );
  const [templates, setTemplates] = useState<TracerStream[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'add') {
      setLoading(true);
      const fetchTemplates = async () => {
        try {
          const templates =
            await orderManagementApiProxy.getAllTraceabilities();
          setTemplates(templates);
        } catch (error) {
          console.error('Error fetching tracer stream templates:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTemplates();
    }
  }, [mode]);

  const handleInputChange = (
    property: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setTracerStream((prevStream) => ({
      ...prevStream,
      [property]: event.target.value,
    }));
  };

  const handleTracerStreamChange = (id: string) => {
    const newTracerStream = templates.find((template) => template.id === id);
    if (!newTracerStream) return;

    setTracerStream((prevStream) => ({
      ...prevStream,
      sections: newTracerStream.sections,
      description: newTracerStream.description,
      name: newTracerStream.name,
      tracerStreamReference: newTracerStream.id as string,
      id: new ObjectId().toString(),
    }));
  };

  const handleSave = async () => {
    try {
      onSave(tracerStream);
    } catch (error) {
      console.error('Error saving tracer stream:', error);
    }
  };

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(
      !!tracerStream.friendlyName &&
        !!tracerStream.quantity &&
        !!tracerStream.product,
    );
  });

  return (
    <BaseModal
      isOpen={isOpen}
      loading={loading}
      onClose={onClose}
      canSave={isFormValid}
      onSave={() => onSave(tracerStream)}
      title={mode === 'add' ? 'Add Tracer Stream' : 'Edit Tracer Stream'}
    >
      <LoadingOverlay show={loading} />
      <ModalBody>
        {mode === 'add' && (
          <>
            <label>Tracer Stream Template</label>
            <select
              value={tracerStream.tracerStreamReference}
              onChange={(e) => handleTracerStreamChange(e.target.value)}
              className="tracer-stream-template"
            >
              <option value="">Select Template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </>
        )}
        <label>Friendly Name</label>
        <input
          type="text"
          value={tracerStream.friendlyName}
          onChange={(e) => handleInputChange('friendlyName', e)}
          placeholder="Friendly Name"
          className="friendly-name"
        />
        <label>Quantity</label>
        <input
          type="number"
          value={tracerStream.quantity}
          onChange={(e) => handleInputChange('quantity', e)}
          placeholder="Quantity"
          className="quantity"
        />
        <label>Product</label>
        <input
          type="text"
          value={tracerStream.product}
          onChange={(e) => handleInputChange('product', e)}
          placeholder="Product"
          className="product"
        />
      </ModalBody>
    </BaseModal>
  );
};

export default TracerStreamModal;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 0;
  overflow: hidden;
  transition: width 0.3s;
  z-index: 1000;

  &.open {
    width: 40%;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ModalContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  z-index: 1001;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px 0 0 8px;
`;

const ModalHeader = styled.div`
  background: #2d3748;
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;

  .section-name {
    flex: 1;
    font-size: 17px;
    margin-right: 10px;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    color: #2d3748;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;

  .tracer-stream-template,
  .friendly-name,
  .quantity,
  .product {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
    color: #4a5568;
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  background: #2d3748;
  text-align: right;
  border-bottom-left-radius: 8px;

  }
`;

const Button = styled.button`
  background: rgb(15 118 110);
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
  margin-right: 16px;

  &:hover {
    background: rgb(13 148 136);
  }

  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;
const ButtonClose = styled.button`
  background: rgb(107 114 128);
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;

  &:hover {
    background: #4b5563;
  }

  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;
