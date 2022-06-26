import {Container, ProgressBar} from "react-bootstrap";
import styles from "../styles/Progress.module.css";

interface Props {
  now: number;
}

export default function Progress(props: Props) {
  const {now} = props;

  if (now >= 100) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <Container>
        <ProgressBar now={now} label={`${now}%`} animated />
      </Container>
    </div>
  );
}
