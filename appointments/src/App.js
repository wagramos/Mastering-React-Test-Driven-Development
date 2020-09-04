import React, { useState, useCallback } from 'react';
import { AppointmentsDayViewLoader } from './AppointmentsDayViewLoader';
import { CustomerForm } from './CustomerForm';
import { AppointmentFormLoader } from '../src/AppointmentFormLoader';

export const App = () => {
  const [view, setView] = useState('dayView');
  const [customer, setCustomer] = useState();

  const transitionToAddCustomer = useCallback(
    () => {
      setView('addCustomer');
    },
    []);

  const transitionToAddAppointment = useCallback(customer => {
    setCustomer(customer);
    setView('AddAppointment');
  }, []);

  const transitionToDayView = useCallback(() => setView('dayView'), []);

  if (view === 'addCustomer') {
    return <CustomerForm onSave={transitionToAddAppointment} />;
  }

  if (view === 'AddAppointment') {
    return <AppointmentFormLoader customer={customer} onSave={transitionToDayView} />;
  }

  return (
    <React.Fragment>
      <div className="button-bar">
        <button type="button" id="addCustomer" onClick={transitionToAddCustomer}>
          Add customer and appointment
        </button>
      </div>
      <AppointmentsDayViewLoader />
    </React.Fragment>)
};