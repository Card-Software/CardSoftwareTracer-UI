import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { SiblingProductOrder } from '@/models/sibling-product-order';
import * as Yup from 'yup';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const siblingProductOrderSchema = Yup.object().shape({
  internalPo: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : value,
    ),
  referenceNumber: Yup.string().required('Reference Number is required'),
  quantity: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : value,
    ),
  lot: Yup.string().required('Lot is required'),
  mill: Yup.string().required('Mill is required'),
});

const validationSchema = Yup.object().shape({
  siblingProductOrders: Yup.array().of(siblingProductOrderSchema),
});

interface sibPosProps {
  initialSiblingProductOrders: SiblingProductOrder[];
  onSave: (siblingProductOrders: SiblingProductOrder[]) => void;
  onClose: () => void;
}

const SiblingProductOrderModal: React.FC<sibPosProps> = ({
  initialSiblingProductOrders,
  onSave,
  onClose,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      siblingProductOrders: initialSiblingProductOrders,
    },
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'siblingProductOrders',
  });

  const onSubmit = (data: any) => {
    onSave(data.siblingProductOrders);
  };

  return (
    <ModalWrapper className="open">
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>
          <h1>Sibling Product Orders</h1>
          <button onClick={onClose} className="close-button">
            <FaTimes size={24} />
          </button>
        </ModalHeader>
        <ModalBody>
          <form>
            {fields.map((item, index) => (
              <PillWrapper key={item.id}>
                <RemoveButton onClick={() => remove(index)}>
                  Remove
                </RemoveButton>

                <InputWrapper>
                  <StyledLabel>Internal PO</StyledLabel>
                  <Controller
                    name={`siblingProductOrders.${index}.internalPo` as const}
                    control={control}
                    render={({ field }) => (
                      <StyledInput
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                  <ErrorMessage>
                    {errors.siblingProductOrders?.[index]?.internalPo
                      ?.message ?? ''}
                  </ErrorMessage>
                </InputWrapper>

                <InputWrapper>
                  <StyledLabel>Quantity</StyledLabel>
                  <Controller
                    name={`siblingProductOrders.${index}.quantity` as const}
                    control={control}
                    render={({ field }) => (
                      <StyledInput
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                  <ErrorMessage>
                    {errors.siblingProductOrders?.[index]?.quantity?.message ??
                      ''}
                  </ErrorMessage>
                </InputWrapper>

                <InputWrapper>
                  <StyledLabel>Lot</StyledLabel>
                  <Controller
                    name={`siblingProductOrders.${index}.lot` as const}
                    control={control}
                    render={({ field }) => (
                      <StyledInput type="text" {...field} />
                    )}
                  />
                  <ErrorMessage>
                    {errors.siblingProductOrders?.[index]?.lot?.message ?? ''}
                  </ErrorMessage>
                </InputWrapper>
                <InputWrapper>
                  <StyledLabel>Mill</StyledLabel>
                  <Controller
                    name={`siblingProductOrders.${index}.mill` as const}
                    control={control}
                    render={({ field }) => (
                      <StyledInput type="text" {...field} />
                    )}
                  />
                  <ErrorMessage>
                    {errors.siblingProductOrders?.[index]?.mill?.message ?? ''}
                  </ErrorMessage>
                </InputWrapper>
                <InputWrapper>
                  <StyledLabel>Reference Number</StyledLabel>
                  <Controller
                    name={
                      `siblingProductOrders.${index}.referenceNumber` as const
                    }
                    control={control}
                    render={({ field }) => (
                      <StyledInput type="text" {...field} />
                    )}
                  />
                  <ErrorMessage>
                    {errors.siblingProductOrders?.[index]?.referenceNumber
                      ?.message ?? ''}
                  </ErrorMessage>
                </InputWrapper>
              </PillWrapper>
            ))}
            <Button
              type="button"
              onClick={() =>
                append({
                  internalPo: 0,
                  referenceNumber: '',
                  quantity: 0,
                  lot: '',
                  mill: '',
                })
              }
              disabled={!isValid}
            >
              +
            </Button>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            style={{ marginRight: '1rem' }}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid}
          >
            Save
          </Button>
          <CancelButton onClick={onClose}>Close</CancelButton>
        </ModalFooter>
      </ModalContent>
    </ModalWrapper>
  );
};

export default SiblingProductOrderModal;

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
`;

const ModalBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  padding: 20px;
  background: #2d3748;
  text-align: right;
  border-bottom-left-radius: 8px;
`;

const Button = styled.button`
  background: rgb(15 118 110);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;

  &:hover {
    background: rgb(13 148 136);
  }

  &:disabled {
    background: #b0b0b0;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #6b7280; /* bg-gray-500 */
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #4b5563; /* hover:bg-gray-600 */
  }
`;

const PillWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  background-color: #f7fafc; /* Tailwind bg-gray-100 */
  border: 1px solid #cbd5e0; /* Tailwind border-gray-300 */
  border-radius: 0.5rem; /* Tailwind rounded-lg */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Tailwind shadow-md */
  position: relative;
  margin-bottom: 1rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  grid-column: span 1; /* Each input occupies one column by default */
`;

const StyledLabel = styled.label`
  color: #4a5568; /* Tailwind text-gray-700 */
  font-weight: 500;
`;

const StyledInput = styled.input`
  margin-top: 0.25rem;
  padding: 0.5rem;
  border: 1px solid #cbd5e0; /* Tailwind border-gray-300 */
  border-radius: 0.375rem; /* Tailwind rounded */
  &:focus {
    outline: none;
    border-color: #63b3ed; /* Tailwind focus:border-blue-400 */
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5); /* Tailwind focus:ring */
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #f56565; /* Tailwind text-red-500 */
  cursor: pointer;
  &:hover {
    color: #c53030; /* Tailwind hover:text-red-700 */
  }
`;

const ErrorMessage = styled.p`
  color: #e53e3e; /* Tailwind text-red-500 */
  font-size: 0.875rem; /* Tailwind text-sm */
  margin-top: 0.25rem;
`;
