import { ChangeEventHandler } from 'react';

export enum InputComponentType {
  // checkbox = 'checkbox',
  // email = 'email',
  text = 'text',
  textArea = 'textArea',
}

export interface InputComponentProps {
  inputName: string;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type?: InputComponentType;
  value?: string;
}

const InputComponent: React.FC<InputComponentProps> = ({
  inputName,
  label,
  onChange,
  type = InputComponentType.text,
  value,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={inputName}>
        <span className={'flex text-xl pb-4 font-bold'}>{label}</span>
        {type === InputComponentType.textArea ? (
          <textarea
            id={inputName}
            name={inputName}
            rows={3}
            className="w-full h-24 p-2"
            onChange={onChange}
            value={value}
          />
        ) : (
          <input
            id={inputName}
            name={inputName}
            type={type}
            className="w-full h-24 p-2"
            onChange={onChange}
            value={value}
          />
        )}
      </label>
    </div>
  );
};

export default InputComponent;
