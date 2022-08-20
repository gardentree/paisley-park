import {Button, Form} from "react-bootstrap";

interface Props {
  config: FilteringOption;
  setConfig(config: FilteringOption): void;
}

export default function FilteringOptionForm(props: Props) {
  const {config, setConfig} = props;

  const handler: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    setConfig({
      heatMaximum: form.heatMaximum.value,
      passingLine: form.passingLine.value,
    });
  };

  return (
    <Form onSubmit={handler}>
      <Form.Group className="mb-3">
        <Form.Label>Heat Maximum</Form.Label>
        <Form.Control name="heatMaximum" type="number" defaultValue={config.heatMaximum} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Passign Line</Form.Label>
        <Form.Control name="passingLine" type="number" defaultValue={config.passingLine} />
      </Form.Group>
      <Button type="submit">変更</Button>
    </Form>
  );
}
