import React from 'react';
import { createContainer, withEvent } from './domManipulators';
import { CustomerForm } from '../src/CustomerForm';
import { fetchResponseError, fetchResponseOk, requestBodyOf } from "./spyHelpers";

import 'whatwg-fetch';

describe('CustomerForm', () => {
  let render, form, field, labelFor, element, change, submit, blur;

  const validCustomer = {
    firstName: 'first',
    lastName: 'last',
    phoneNumber: '123456789'
  };

  beforeEach(() => {
    ({ render, form, field, labelFor, element, change, submit, blur } = createContainer());
    jest.spyOn(window, 'fetch')
      .mockReturnValue(fetchResponseOk({}));
  });

  afterEach(() => {
    window.fetch.mockRestore();

  });

  it('renders a form', () => {
    render(<CustomerForm {...validCustomer} />);
    expect(form('customer')).not.toBeNull();
  });

  it('has a submit button', () => {
    render(<CustomerForm {...validCustomer} />);
    const submitButton = element(
      'input[type="submit"]'
    );
    expect(submitButton).not.toBeNull();
  });


  it('calls fetch with the right properties when submitting data', async () => {
    render(< CustomerForm {...validCustomer} />);

    await submit(form('customer'));

    expect(window.fetch).toHaveBeenCalledWith(
      '/customers',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      }));
  });

  it('notifies onSave when form is submitted', async () => {
    const customer = { id: 123 };
    window.fetch.mockReturnValue(fetchResponseOk(customer));
    const saveSpy = jest.fn();
    render(<CustomerForm {...validCustomer} onSave={saveSpy} />);
    await submit(form('customer'));
    expect(saveSpy).toHaveBeenCalledWith(customer);
  });

  it('does not notify onSave if the POST request returns an error', async () => {
    window.fetch.mockReturnValue(fetchResponseError());
    const saveSpy = jest.fn();
    render(<CustomerForm {...validCustomer} onSave={saveSpy} />);
    await submit(form('customer'));
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('prevents the default action when submitting the form', async () => {
    const preventDefaultSpy = jest.fn();
    render(<CustomerForm {...validCustomer} />);
    await submit(form('customer'), {
      preventDefault: preventDefaultSpy
    });
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('renders error message when fetch call fails', async () => {
    window.fetch.mockReturnValue(Promise.resolve({ ok: false }));

    render(<CustomerForm {...validCustomer} />);
    await submit(form('customer'));

    const errorElement = element('.error');
    expect(errorElement).not.toBeNull();
    expect(errorElement.textContent).toMatch('error ocurred');
  });

  it('clears error state when resubmit was successful', async () => {
    window.fetch.mockReturnValue(Promise.resolve({ ok: false }));

    render(<CustomerForm {...validCustomer} />);
    await submit(form('customer'));

    const errorElement = element('.error');
    expect(errorElement).not.toBeNull();
    expect(errorElement.textContent).toMatch('error ocurred');

    window.fetch.mockReturnValue(fetchResponseOk({}));

    await submit(form('customer'));

    expect(element('.error')).toBeNull();
  });

  const expectToBeInputFieldOfTypeText = formElement => {
    expect(formElement).not.toBeNull();
    expect(formElement.tagName).toEqual('INPUT');
    expect(formElement.type).toEqual('text');
  };

  const itRendersAsATextBox = fieldName =>
    it('renders as a text box', () => {
      render(<CustomerForm {...validCustomer} />);
      expectToBeInputFieldOfTypeText(field('customer', fieldName));
    });

  const itIncludesTheExistingValue = fieldName =>
    it('includes the existing value', () => {
      render(<CustomerForm  {...validCustomer}{...{ [fieldName]: 'value' }} />);
      expect(field('customer', fieldName).value).toEqual('value');
    });

  const itRendersALabel = (fieldName, text) =>
    it('renders a label', () => {
      render(<CustomerForm {...validCustomer} />);
      expect(labelFor(fieldName)).not.toBeNull();
      expect(labelFor(fieldName).textContent).toEqual(text);
    });

  const itAssignsAnIdThatMatchesTheLabelId = fieldName =>
    it('assigns an id that matches the label id', () => {
      render(<CustomerForm {...validCustomer} />);
      expect(field('customer', fieldName).id).toEqual(fieldName);
    });

  const itSubmitsExistingValue = (fieldName, value) =>
    it('saves existing value when submitted', async () => {
      render(<CustomerForm {...validCustomer} {...{ [fieldName]: value }} />);

      await submit(form('customer'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: value
      });
    });

  const itSubmitsNewValue = (fieldName, newValue) =>
    it('saves new value when submitted', async () => {
      render(<CustomerForm {...validCustomer} {...{ [fieldName]: 'existingValue' }} />);

      await change(field('customer', fieldName), withEvent(fieldName, newValue));

      await submit(form('customer'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: newValue
      });
    });

  const itValidatesFieldWithValue = (fieldName, value, errorDescription) => {
    it(`displays error after blur when ${fieldName} field is '${value}'`, () => {
      render(<CustomerForm {...validCustomer} />);
      blur(field('customer', fieldName), withEvent(fieldName, value));

      expect(element('.error')).not.toBeNull();
      expect(element('.error').textContent).toMatch(errorDescription);
    });
  };

  describe('first name field', () => {
    itRendersAsATextBox('firstName');
    itIncludesTheExistingValue('firstName');
    itRendersALabel('firstName', 'First name');
    itAssignsAnIdThatMatchesTheLabelId('firstName');
    itSubmitsExistingValue('firstName', 'value');
    itSubmitsNewValue('firstName', 'newValue');
  });

  describe('last name field', () => {
    itRendersAsATextBox('lastName');
    itIncludesTheExistingValue('lastName');
    itRendersALabel('lastName', 'Last name');
    itAssignsAnIdThatMatchesTheLabelId('lastName');
    itSubmitsExistingValue('lastName', 'value');
    itSubmitsNewValue('lastName', 'newValue');
  });

  describe('phone number field', () => {
    itRendersAsATextBox('phoneNumber');
    itIncludesTheExistingValue('phoneNumber');
    itRendersALabel('phoneNumber', 'Phone number');
    itAssignsAnIdThatMatchesTheLabelId('phoneNumber');
    itSubmitsExistingValue('phoneNumber', '12345');
    itSubmitsNewValue('phoneNumber', '67890');
  });


  itValidatesFieldWithValue('firstName', '', 'First name is required');
  itValidatesFieldWithValue('lastName', '', 'Last name is required');
  itValidatesFieldWithValue('phoneNumber', '', 'Phone number is required');
  itValidatesFieldWithValue('phoneNumber', 'invalid', 'Only numbers, spaces and these symbols are allowed: ()+-');

  it('accepts standard phone number characters when validating', () => {
    render(<CustomerForm {...validCustomer} />);
    blur(element("[name='phoneNumber']"), withEvent('phoneNumber', '0123456789()+-'));
    expect(element('.error')).toBeNull();

  });

  it('does not submit the form when there are validation errors', async () => {
    render(<CustomerForm />);

    await submit(form('customer'));

    expect(window.fetch).not.toBeCalled();
  });
  it('renders validation errors after submission fails', async () => {
    render(<CustomerForm />);

    await submit(form('customer'));

    expect(window.fetch).not.toBeCalled();
    expect(element('.error')).not.toBeNull();
  });
});
