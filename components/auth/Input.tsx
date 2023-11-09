import React, { useState } from "react";
import clsx from "clsx";
import { AiFillEye } from "react-icons/ai";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  register,
  required,
  errors,
  type = "text",
  disabled,
  placeholder
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="
          block 
          text-sm 
          font-medium 
          leading-6 
          text-gray-900
        "
      >
        {label} {required&&"*"}
      </label>

      <div className="mt-2">
        <div className="relative">
          <input
            id={id}
            type={passwordVisible ? "text" : type} // Show plain text if passwordVisible is true
            autoComplete={id}
            disabled={disabled}
            placeholder={placeholder}
            {...register(id, { required })}
            className={clsx(
              `
              form-input
              block 
              bg-white
              w-full 
              rounded-md 
              border-0 
              py-1.5 
              pl-5
              text-gray-900 
              shadow-sm 
              ring-1 
              ring-inset 
              ring-gray-300 
              placeholder:text-gray-400 
              focus:ring-2 
              focus:ring-inset 
              focus:ring-sky-600 
              sm:text-sm 
              sm:leading-6`,
              errors[id] && "focus:ring-rose-500",
              disabled && "opacity-50 cursor-default"
            )}
          />
          {type === "password" && (
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              <AiFillEye className={passwordVisible ? "text-sky-600" : "text-gray-400"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Input;
