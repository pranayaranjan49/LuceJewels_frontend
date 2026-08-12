import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiStar, HiOutlineCamera, HiOutlineX } from 'react-icons/hi';
import { submitFeedback } from '../../api/endpoints';

const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 5;

export default function FeedbackForm({ orderId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [notReceived, setNotReceived] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const tooBig = files.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      toast.error(`"${tooBig.name}" is over ${MAX_SIZE_MB}MB — please choose a smaller photo`);
      return;
    }
    if (photos.length + files.length > MAX_PHOTOS) {
      toast.error(`You can attach up to ${MAX_PHOTOS} photos`);
      return;
    }
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating && !notReceived) {
      return toast.error('Please rate your delivery, or let us know if you didn\'t receive it');
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (rating) fd.append('rating', rating);
      fd.append('comment', comment);
      fd.append('notReceived', notReceived);
      photos.forEach((p) => fd.append('photos', p));

      await submitFeedback(orderId, fd);
      toast.success('Thanks for your feedback!');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="card-surface p-6"
    >
      <h3 className="font-display text-xl text-ink-primary">How was your delivery?</h3>

      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          >
            <HiStar
              size={28}
              className={(hoverRating || rating) >= n ? 'text-gold-400' : 'text-surface-strong/40'}
            />
          </button>
        ))}
      </div>

      <textarea
        placeholder="Tell us more (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="input-field mt-4"
      />

      <label className="mt-4 flex items-center gap-2 text-sm text-ink-secondary">
        <input
          type="checkbox"
          checked={notReceived}
          onChange={(e) => setNotReceived(e.target.checked)}
          className="accent-gold-400"
        />
        I did not actually receive this order
      </label>

      <div className="mt-4">
        <label className="eyebrow mb-2 flex items-center gap-1.5">
          <HiOutlineCamera size={15} /> Attach photos (optional, up to {MAX_PHOTOS}, max {MAX_SIZE_MB}MB each)
        </label>
        <input type="file" accept="image/*" multiple onChange={handleFiles} className="text-sm text-ink-secondary" />
        {photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <img src={URL.createObjectURL(p)} alt="" className="h-16 w-16 rounded-xs object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-strong text-ink-primary"
                >
                  <HiOutlineX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
        {submitting ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </motion.form>
  );
}
