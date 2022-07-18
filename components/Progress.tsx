import {useEffect} from "react";
import {Container, ProgressBar} from "react-bootstrap";
import useRemainingTime from "@/hooks/RemainingTime";
import styles from "@/styles/Progress.module.css";

interface Props {
  now: number;
  processing: boolean;
}

export default function Progress(props: Props) {
  const {now, processing} = props;
  const remaining = useRemainingTime(now);
  const message = processing ? `${now}%(残り${remaining}秒)` : `${now}%`;

  const show = 0 < now && now < 100;

  useEffect(() => {
    if (show) {
      document.title = `${message} Paisley Park`;
    } else {
      document.title = "Paisley Park";
    }
  }, [show, message]);

  if (!show) {
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
