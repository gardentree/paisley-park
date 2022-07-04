import {useState, useEffect} from "react";
import {Container, ProgressBar} from "react-bootstrap";
import styles from "../styles/Progress.module.css";

interface Props {
  now: number;
}

export default function Progress(props: Props) {
  const [startedAt, setStartedAt] = useState(Date.now());
  const {now} = props;

  const elapsed = Date.now() - startedAt;
  const remaining = Math.floor(((elapsed * 100) / now - elapsed) / 1000);
  const message = `${now}%(残り${remaining}秒)`;

  useEffect(() => {
    if (now < 100) {
      document.title = `${message} Paisley Park`;
    } else {
      document.title = "Paisley Park";
    }
  }, [now]);

  if (now >= 100) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <Container>
        <ProgressBar now={now} label={message} animated />
      </Container>
    </div>
  );
}
