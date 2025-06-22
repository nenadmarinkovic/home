'use client';
import { useState } from 'react';
import { EmailProps } from '@/types/types';

import styles from '../styles/components/Form.module.css';

const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (formData: EmailProps) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setError('');
      } else {
        setSuccess(false);
        setError('Message sending failed! Please try again later.');
      }
    } catch (error) {
      setSuccess(false);
      setError(
        'Message sending failed! Please check your internet connection and try again.'
      );
      console.error('Error submitting form:', error);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ name, email, message });
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label}>
        <span className={styles.labelName}>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className={styles.label}>
        <span className={styles.labelName}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className={styles.label}>
        <span className={styles.labelName}>Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>
      <div className={styles.sendWrap}>
        {success && (
          <div className={styles.sendMessage}>
            <strong>Message successfully sent! </strong>
            <span>I will get back to you as soon as possible.</span>
          </div>
        )}
        {!success && error && (
          <p className={styles.sendMassage}>{error}</p>
        )}
        <button className={styles.submit} type="submit">
          Send
        </button>
      </div>
    </form>
  );
};

export default Form;
