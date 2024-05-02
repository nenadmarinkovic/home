interface EmailTemplateProps {
  name: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ name, email, message }) => (
  <div>
    <span>{name}</span>
    <br />
    <span>{email}</span>
    <br />
    <span>{message}</span>
  </div>
);

export default EmailTemplate;
