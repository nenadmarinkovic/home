'use client';
import { useState } from 'react';
import { EmailProps } from '@/types/types';

import styles from '../styles/components/Form.module.css';

const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

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
        alert('Your email message has been sent successfully');
      } else {
        alert('Message sending failed');
      }
    } catch (error) {
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
      <button className={styles.submit} type="submit">
        Send
      </button>
    </form>
  );
};

export default Form;
