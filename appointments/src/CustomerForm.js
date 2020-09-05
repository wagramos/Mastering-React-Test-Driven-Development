import React, { useState } from 'react';
import { required, match, list, hasError, anyErrors, validateMany } from '../src/formValidation';

export const CustomerForm = ({
  firstName,
  lastName,
  phoneNumber,
  onSave
}) => {
  const [customer, setCustomer] = useState({
    firstName,
    lastName,
    phoneNumber
  });
  const [error, setError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = ({ target }) =>
    setCustomer(customer => ({
      ...customer,
      [target.name]: target.value
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationResult = validateMany(validators, customer);
    if (!anyErrors(validationResult)) {
      const result = await window.fetch('/customers', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      if (result.ok) {
        const customerWithId = await result.json();
        setError(false);
        onSave(customerWithId);
      }
      else {
        setError(true);
      }
    }
    else {
      setValidationErrors(validationResult);
    }
  }

  const validators = {
    firstName: required('First name is required'),
    lastName: required('Last name is required'),
    phoneNumber: list(
      required('Phone number is required'),
      match(/^[0-9+()\-]*$/, 'Only numbers, spaces and these symbols are allowed: ()+-'))
  };

  const handleBlur = ({ target }) => {
    const result = validateMany(validators, {
      [target.name]: target.value
    });
    setValidationErrors({ ...validationErrors, ...result });
  };

  const renderError = fieldName => {
    if (hasError(validationErrors, fieldName)) {
      return (
        <span className="error">{validationErrors[fieldName]}</span>
      );
    }
  };

  return (
    <form id="customer" onSubmit={handleSubmit}>
      <label htmlFor="firstName">First name</label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        value={firstName}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderError('firstName')}
      <label htmlFor="lastName">Last name</label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        value={lastName}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderError('lastName')}
      <label htmlFor="phoneNumber">Phone number</label>
      <input
        type="text"
        name="phoneNumber"
        id="phoneNumber"
        value={phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderError('phoneNumber')}

      <input type="submit" value="Add" />
      {error ? <Error /> : null}
    </form>
  );
};

CustomerForm.defaultProps = {
  onSave: () => { }
}

const Error = () => (
  <div className="error">An error ocurred during save</div>
);