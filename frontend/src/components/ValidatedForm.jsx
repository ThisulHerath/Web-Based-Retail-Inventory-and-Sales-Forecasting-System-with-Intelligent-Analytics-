import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import { fieldMessage } from '../utils/formValidation';

function fieldLabel(field) {
    const label = field.labels?.[0] || field.closest('div')?.querySelector('label');
    return (field.getAttribute('aria-label') || label?.textContent || field.name || field.placeholder || 'This field').replace(/\*/g, '').trim();
}

function feedbackContainer(field) {
    const registered = field.closest('[data-field]');
    if (registered) return registered;
    const parent = field.parentElement;
    if (parent?.classList.contains('relative') && parent.parentElement?.querySelector(':scope > label')) return parent.parentElement;
    return parent;
}

// A normal form with accessible, persistent feedback. Existing submit handlers
// still own server errors, password policy, stock limits and cross-field rules.
export default function ValidatedForm({ children, onSubmit, onBlur, onInput, noValidate: _noValidate, ...props }) {
    const ref = useRef(null);
    const prefix = useId();
    const [errors, setErrors] = useState([]);
    const attempted = useRef(false);
    const pending = useRef(false);
    const ids = useRef(new WeakMap());
    const sequence = useRef(0);
    useEffect(() => {
        const form = ref.current;
        const connectLabels = () => {
            form.querySelectorAll('input, select, textarea').forEach((field, index) => {
                if (field.labels?.length) return;
                let group = field.parentElement;
                let label;
                while (group && group !== form) {
                    label = group.querySelector('label');
                    if (label) break;
                    group = group.parentElement;
                }
                if (label && !label.htmlFor && !label.querySelector('input, select, textarea')) {
                    if (!field.id) field.id = `${prefix}-field-${index}`;
                    label.htmlFor = field.id;
                }
            });
        };
        connectLabels();
        const observer = new MutationObserver(connectLabels);
        observer.observe(form, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [prefix]);
    const identify = (field) => {
        if (!ids.current.has(field)) ids.current.set(field, `${prefix}-error-${sequence.current++}`);
        return ids.current.get(field);
    };
    const validate = (field) => {
        if (!field.matches?.('input, select, textarea')) return null;
        const message = fieldMessage(field, fieldLabel(field));
        return message ? { field, message, id: identify(field) } : null;
    };
    useEffect(() => {
        errors.forEach(({ field, id }) => {
            field.setAttribute('aria-invalid', 'true');
            const descriptions = new Set((field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
            descriptions.add(id);
            field.setAttribute('aria-describedby', [...descriptions].join(' '));
        });
        return () => errors.forEach(({ field, id }) => {
            field.removeAttribute('aria-invalid');
            const descriptions = (field.getAttribute('aria-describedby') || '').split(' ').filter(value => value && value !== id);
            if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
            else field.removeAttribute('aria-describedby');
        });
    }, [errors]);
    const updateField = (field, force = false) => {
        if (!field.matches?.('input, select, textarea')) return;
        setErrors(previous => {
            if (!force && !attempted.current && !previous.some(error => error.field === field)) return previous;
            const next = validate(field);
            return [...previous.filter(error => error.field !== field && error.field.isConnected), ...(next ? [next] : [])];
        });
    };
    const submit = async (event) => {
        event.preventDefault();
        if (pending.current) return;
        attempted.current = true;
        const next = Array.from(ref.current.elements).map(validate).filter(Boolean);
        setErrors(next);
        if (next.length) {
            next[0].field.focus();
            next[0].field.scrollIntoView({ block: 'center', behavior: 'auto' });
            return;
        }
        pending.current = true;
        try { await onSubmit?.(event); } finally { pending.current = false; }
    };
    return (
        <form {...props} ref={ref} noValidate onSubmit={submit}
            onBlur={(event) => { updateField(event.target, true); onBlur?.(event); }}
            onInput={(event) => { updateField(event.target); onInput?.(event); }}
            onChange={(event) => updateField(event.target)}>
            {errors.length > 0 && <div role="alert" className="validation-summary">
                <AlertCircle size={20} aria-hidden="true" />
                <span>Please check {errors.length === 1 ? 'the highlighted field' : `the ${errors.length} highlighted fields`} before continuing.</span>
            </div>}
            {children}
            {errors.filter(({ field }) => field.isConnected && field.parentElement).map(({ field, message, id }) => createPortal(
                <p id={id} className="field-feedback">{message}</p>, feedbackContainer(field), id
            ))}
        </form>
    );
}
