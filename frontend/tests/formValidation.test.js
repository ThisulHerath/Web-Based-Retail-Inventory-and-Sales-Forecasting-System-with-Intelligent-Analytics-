import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldMessage } from '../src/utils/formValidation.js';

const field = (options = {}) => ({ value: '', type: 'text', required: false, willValidate: true, validity: {}, getAttribute: name => options[name] ?? null, ...options });

test('required names reject spaces while optional descriptions allow an empty value', () => {
    assert.match(fieldMessage(field({ required: true, value: '   ' }), 'Name'), /required/);
    assert.equal(fieldMessage(field()), '');
    assert.equal(fieldMessage(field({ required: true, value: 'Fresh produce' })), '');
});
test('disabled controls do not prevent submitting', () => {
    assert.equal(fieldMessage(field({ disabled: true, required: true, validity: { valueMissing: true } })), '');
});
test('both local and international Sri Lankan phone formats accept separators', () => {
    for (const value of ['077 123 4567', '+94 77 123 4567', '94771234567', '(077) 123-4567']) assert.equal(fieldMessage(field({ type: 'tel', value })), '', value);
    for (const value of ['123', '07712345678', '0001234567', '+1 202 555 0123']) assert.match(fieldMessage(field({ type: 'tel', value })), /Sri Lankan/, value);
});
test('email errors describe the required format', () => {
    assert.match(fieldMessage(field({ type: 'email', value: 'invalid', validity: { typeMismatch: true } })), /name@example.com/);
});
test('stock quantities report their actual limits and reject fractions', () => {
    assert.match(fieldMessage(field({ value: '-1', min: '1', validity: { rangeUnderflow: true } }), 'Quantity'), /at least 1/);
    assert.match(fieldMessage(field({ value: '11', max: '10', validity: { rangeOverflow: true } }), 'Quantity'), /10 or less/);
    assert.match(fieldMessage(field({ value: '1.5', step: '1', validity: { stepMismatch: true } })), /whole number/);
});
test('numeric bad input is caught even when the browser exposes an empty value', () => {
    assert.match(fieldMessage(field({ type: 'number', value: '', validity: { badInput: true } })), /valid number/);
});
test('custom validation messages are preserved', () => {
    assert.equal(fieldMessage(field({ value: 'test', validity: { customError: true }, validationMessage: 'Choose another SKU.' })), 'Choose another SKU.');
});
