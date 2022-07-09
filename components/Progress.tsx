import {useState, useEffect} from "react";
import {Container, ProgressBar} from "react-bootstrap";
import styles from "@/styles/Progress.module.css";

interface Props {
  now: number;
  processing: boolean;
}

export default function Progress(props: Props) {
  const [startedAt, setStartedAt] = useState(Date.now());
  const {now, processing} = props;

  const elapsed = Date.now() - startedAt;
  const remaining = Math.floor(((elapsed * 100) / now - elapsed) / 1000);
  const message = processing ? `${now}%(残り${remaining}秒)` : `${now}%`;

  useEffect(() => {
    if (now < 100) {
      document.title = `${message} Paisley Park`;
    } else {
      document.title = "Paisley Park";
    }
  }, [now, message]);

  if (now >= 100) {
    return <></>;
  }

  let component;
  if (processing) {
    component = <ProgressBar now={now} label={message} animated />;
  } else {
    component = <ProgressBar now={now} label={message} variant="danger" />;
  }

  return (
    <div className={styles.container}>
      <Container>{component}</Container>
    </div>
  );
}
