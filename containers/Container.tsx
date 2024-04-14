import styles from '../styles/containers/Container.module.css';

function Container({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={styles.container}>{children}</div>;
}

export default Container;
