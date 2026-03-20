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
        <section className="relative overflow-hidden py-24 md:py-28 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2200"
                    alt="Fresh vegetables"
                    className="w-full h-full object-cover blur-[8px] scale-110"
                />
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(10, 45, 12, 0.85)' }}
                />
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-[680px] mx-auto w-full relative z-10">
                <div className="mb-12 text-center">
                    <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-[#155c27] border border-[#1f7a37] flex items-center justify-center shadow-md">
                        <MessageSquare className="w-6 h-6 text-[#f5d800]" />
                    </div>
                    <h1 className="text-[42px] leading-tight font-bold text-[var(--color-text-primary)]">{t('feedback.title')}</h1>
                    <p className="mt-5 text-[var(--color-text-secondary)] opacity-80">
                        {t('feedback.subtitle')}
                    </p>
                </div>

                <div className="bg-[#155c27] rounded-2xl p-10 border border-[#1f7a37] shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
                    {customer ? (
                        submitted ? (
                            <div className="text-center py-6">
                                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#f5d800]/15 border border-[#f5d800]/40 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-[#f5d800]" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">{t('feedback.success_title')}</h2>
                                <p className="mt-3 text-[#d5f2df]">{t('feedback.success_sub')}</p>
                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="mt-5 inline-flex text-[#f5d800] font-semibold hover:underline"
                                >
                                    {t('common.submit_another')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-white text-[15px] font-semibold mb-2">
                                        {t('feedback.your_rating')} <span className="text-[#f5d800]">*</span>
                                    </label>
                                    <div className="w-full min-h-[44px] px-4 py-3 rounded-lg bg-[#052715] border border-[#2f9b52]">
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
                                                        <Star className={`w-6 h-6 ${selected ? 'text-[#f5d800] fill-[#f5d800]' : 'text-[#2f9b52]'}`} />
                                                    </button>
                                                );
                                            })}
                                            <span className="ml-3 text-[#d5f2df] text-sm font-medium">
                                                {form.rating} star{form.rating > 1 ? 's' : ''} - {RATING_LABELS[form.rating]}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-white text-[15px] font-semibold mb-2">
                                        {t('feedback.your_feedback')} <span className="text-[#f5d800]">*</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            rows={6}
                                            maxLength={500}
                                            required
                                            placeholder={t('feedback.placeholder')}
                                            value={form.comment}
                                            onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                                            className="w-full min-h-[160px] px-4 py-3 rounded-lg bg-[#052715] border border-[#2f9b52] text-white placeholder:text-[#b7d8c2] outline-none focus:ring-2 focus:ring-[#f5d800] resize-y"
                                        />
                                        <p className="mt-2 text-right text-xs text-[#d5f2df]">{form.comment.length} / 500</p>
                                    </div>
                                </div>

                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex min-w-[200px] h-12 items-center justify-center gap-2 bg-[#f5d800] text-[#155c27] px-5 rounded-lg font-semibold hover:bg-[#e6c700] hover:scale-[1.02] transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <span>{submitting ? `${t('feedback.submit')}...` : t('feedback.submit')}</span>
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        )
                    ) : (
                        <div className="space-y-4 text-center py-4">
                            <div className="mx-auto w-14 h-14 rounded-full bg-[#f5d800]/15 border border-[#f5d800]/40 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-[#f5d800]" />
                            </div>
                            <p className="text-[#d5f2df]">{t('feedback_extra.login_or_register')}</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center bg-[#f5d800] text-[#155c27] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#e6c700] transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center border border-[#f5d800] text-[#f5d800] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#f5d800]/10 transition-colors"
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
