import ValidatedForm from '../../components/ValidatedForm';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Send, MessageSquare, CheckCircle2, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCustomer } from '../../context/CustomerContext';
import { submitFeedback } from '../../services/feedbackService';
import Toast from '../../components/Toast';

const RATING_LABELS = {
    5: 'Excellent',
    4: 'Very Good',
    3: 'Good',
    2: 'Fair',
    1: 'Poor',
};

const Feedback = () => {
    const { t } = useTranslation();
    const { customer } = useCustomer();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({
        rating: 5,
        comment: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customer) {
            setToast({ message: t('feedback_extra.login_required'), type: 'error' });
            return;
        }

        try {
            setSubmitting(true);
            await submitFeedback({
                rating: Number(form.rating),
                comment: form.comment.trim(),
            });
            setForm({ rating: 5, comment: '' });
            setSubmitted(true);
            setToast({ message: t('feedback_extra.submitted_pending'), type: 'success' });
        } catch (error) {
            setToast({ message: error.response?.data?.message || t('feedback_extra.submit_failed'), type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="feedback-page relative overflow-hidden py-24 md:py-28 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center">
            <div className="hero-mesh" aria-hidden="true" />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-[680px] mx-auto w-full relative z-10">
                <div className="mb-12 text-center">
                    <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-[#18243b] border border-[#3b4d70] flex items-center justify-center shadow-md">
                        <MessageSquare className="w-6 h-6 text-[#c4b5fd]" />
                    </div>
                    <h1 className="text-[42px] leading-tight font-bold text-white">{t('feedback.title')}</h1>
                    <p className="mt-5 text-green-100">
                        {t('feedback.subtitle')}
                    </p>
                </div>

                <div className="feedback-panel bg-[#18243b] rounded-2xl p-10 border border-[#3b4d70] shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
                    {customer ? (
                        submitted ? (
                            <div className="text-center py-6">
                                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#c4b5fd]/15 border border-[#c4b5fd]/40 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-[#c4b5fd]" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">{t('feedback.success_title')}</h2>
                                <p className="mt-3 text-[#d5def1]">{t('feedback.success_sub')}</p>
                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="mt-5 inline-flex text-[#c4b5fd] font-semibold hover:underline"
                                >
                                    {t('common.submit_another')}
                                </button>
                            </div>
                        ) : (
                            <ValidatedForm onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-white text-[15px] font-semibold mb-2">
                                        {t('feedback.your_rating')} <span className="text-[#c4b5fd]">*</span>
                                    </label>
                                    <div className="w-full min-h-[44px] px-4 py-3 rounded-lg bg-[#141f35] border border-[#52648b]">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, index) => {
                                                const value = index + 1;
                                                const selected = value <= form.rating;
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setForm((prev) => ({ ...prev, rating: value }))}
                                                        className="p-1 rounded transition-transform duration-200 hover:scale-110"
                                                        aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                                                    >
                                                        <Star className={`w-6 h-6 ${selected ? 'text-[#c4b5fd] fill-[#c4b5fd]' : 'text-[#52648b]'}`} />
                                                    </button>
                                                );
                                            })}
                                            <span className="ml-3 text-[#d5def1] text-sm font-medium">
                                                {form.rating} star{form.rating > 1 ? 's' : ''} - {RATING_LABELS[form.rating]}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-white text-[15px] font-semibold mb-2">
                                        {t('feedback.your_feedback')} <span className="text-[#c4b5fd]">*</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            rows={6}
                                            maxLength={500}
                                            required
                                            placeholder={t('feedback.placeholder')}
                                            value={form.comment}
                                            onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                                            className="w-full min-h-[160px] px-4 py-3 rounded-lg bg-[#141f35] border border-[#52648b] text-white placeholder:text-[#b7c4de] outline-none focus:ring-2 focus:ring-[#c4b5fd] resize-y"
                                        />
                                        <p className="mt-2 text-right text-xs text-[#d5def1]">{form.comment.length} / 500</p>
                                    </div>
                                </div>

                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex min-w-[200px] h-12 items-center justify-center gap-2 bg-[#c4b5fd] text-[#18243b] px-5 rounded-lg font-semibold hover:bg-[#ad97f5] hover:scale-[1.02] transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <span>{submitting ? `${t('feedback.submit')}...` : t('feedback.submit')}</span>
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </ValidatedForm>
                        )
                    ) : (
                        <div className="space-y-4 text-center py-4">
                            <div className="mx-auto w-14 h-14 rounded-full bg-[#c4b5fd]/15 border border-[#c4b5fd]/40 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-[#c4b5fd]" />
                            </div>
                            <p className="text-[#d5def1]">{t('feedback_extra.login_or_register')}</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center bg-[#c4b5fd] text-[#18243b] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#ad97f5] transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center border border-[#c4b5fd] text-[#c4b5fd] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#c4b5fd]/10 transition-colors"
                                >
                                    {t('common.register')}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Feedback;
