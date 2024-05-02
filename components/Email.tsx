import styles from '../styles/components/Email.module.css';

interface EmailProps {
  name: string;
  email: string;
  message: string;
}

export const Email: React.FC<Readonly<EmailProps>> = ({
  name,
  email,
  message,
}) => (
  <div className={styles.email}>
    <div>Hi, Nenad!</div>
    <div>{name} sent you a message:</div>
    <div>{message}</div>
    <div>You can answer by sending a message to {email}.</div>
  </div>
);

export default Email;
