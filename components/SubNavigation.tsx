import {ReactNode} from "react";
import {Offcanvas} from "react-bootstrap";

interface Props {
  show: boolean;
  setShow(show: boolean): void;
  children: ReactNode;
}

export default function SubNavigation(props: Props) {
  const {show, setShow, children} = props;

  const handleClose = () => setShow(false);

  return (
    <Offcanvas placement="end" show={show} onHide={handleClose}>
      <Offcanvas.Body>{children}</Offcanvas.Body>
    </Offcanvas>
  );
}
