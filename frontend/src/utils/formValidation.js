// Keep business rules in each page; share native constraints and readable feedback.
export function fieldMessage(field, label = 'This field') {
    if (field.disabled || !field.willValidate) return '';
    const value = field.value;
    const validity = field.validity;
    if (validity.valueMissing || (field.required && typeof value === 'string' && !value.trim())) return `${label} is required.`;
    if (validity.badInput) return 'Enter a valid number.';
    if (!value) return '';
    if (field.type === 'tel' && !/^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/.test(value.replace(/[\s\-()]/g, ''))) return 'Enter a Sri Lankan phone number, such as 077 123 4567 or +94 77 123 4567.';
    if (validity.typeMismatch) return field.type === 'email' ? 'Enter a valid email address, such as name@example.com.' : `Enter a valid ${label.toLowerCase()}.`;
    if (validity.rangeUnderflow) return `${label} must be at least ${field.min}.`;
    if (validity.rangeOverflow) return `${label} must be ${field.max} or less.`;
    if (validity.stepMismatch) return field.step === '1' || !field.getAttribute('step') ? 'Enter a whole number.' : `Use increments of ${field.step}.`;
    if (validity.tooShort) return `Use at least ${field.minLength} characters.`;
    if (validity.tooLong) return `Use no more than ${field.maxLength} characters.`;
    if (validity.patternMismatch) return field.title || `Check the format of ${label.toLowerCase()}.`;
    if (validity.customError) return field.validationMessage;
    return '';
}
