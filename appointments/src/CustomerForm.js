import React, { useState } from 'react';

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

  const handleChange = ({ target }) =>
    setCustomer(customer => ({
      ...customer,
      [target.name]: target.value
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <form id="customer" onSubmit={handleSubmit}>
      <label htmlFor="firstName">First name</label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        value={firstName}
        onChange={handleChange}
      />

      <label htmlFor="lastName">Last name</label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        value={lastName}
        onChange={handleChange}
      />

      <label htmlFor="phoneNumber">Phone number</label>
      <input
        type="text"
        name="phoneNumber"
        id="phoneNumber"
        value={phoneNumber}
        onChange={handleChange}
      />

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