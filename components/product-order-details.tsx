import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type ElementType = 'input' | 'span' | 'datePicker' | 'select' | 'textarea';

interface Option {
  value: string | undefined;
  label: string;
}

interface ProductOrderDetailsProps {
  field: string;
  label: string;
  elementType: ElementType;
  value?: string | Date | number | undefined;
  onChangeHandler: (value: string | Date, field: string) => void;
  classNameInput?: string;
  showErrorMessage?: boolean;
  validationMessage?: string;
  onBlurHandler?: (value: string | Date, field: string) => void;
  options?: Option[];
}

const ProductOrderDetails: React.FC<ProductOrderDetailsProps> = ({
  field,
  label,
  elementType,
  value,
  onChangeHandler,
  classNameInput,
  onBlurHandler,
  options,
}) => {
  const handleValueChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    onChangeHandler(event.target.value, event.target.name);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      onChangeHandler(date, field);
    }
  };

  const handleInputBlur = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    if (onBlurHandler) {
      onBlurHandler(event.target.value, field);
    }
  };

  return (
    <div className="form-box">
      <label
        htmlFor={field}
        className="mb-2 block text-sm font-bold text-gray-700"
      >
        {label}
      </label>
      {elementType === 'input' && (
        <input
          id={field}
          name={field}
          type="text"
          value={value as string}
          onChange={handleValueChange}
          onBlur={handleInputBlur}
          className={classNameInput}
        />
      )}
      {elementType === 'span' && (
        <span className={classNameInput}>{value as string}</span>
      )}
      {elementType === 'datePicker' && (
        <DatePicker
          selected={value as Date}
          onChange={handleDateChange}
          className={classNameInput}
        />
      )}
      {elementType === 'select' && options && (
        <select
          value={value as string}
          onChange={handleValueChange}
          className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 "
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {elementType === 'textarea' && (
        <textarea
          id={field}
          name={field}
          value={value as string}
          onChange={handleValueChange}
          onBlur={handleInputBlur}
          className={classNameInput}
        />
      )}
    </div>
  );
};

export default ProductOrderDetails;
