import React, {Component} from 'react';
import {Modal, Button, Form, Row, Col, InputGroup, Tab, Tabs} from "react-bootstrap";
import {taskDescriptions} from "../../../constants";

class SubwfModal extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleSave = this.handleSave.bind(this);

        this.state = {
            show: true,
            inputs: {},
            customParam: ""
        };
    }

    componentDidMount() {
        this.setState({
            inputs: this.props.inputs.inputs,
        })
    }

    handleClose() {
        this.setState({show: false});
        this.props.modalHandler()
    }

    handleSave(e) {
        this.setState({show: false});
        this.props.saveInputs(this.state.inputs, this.props.inputs.id);
        this.props.modalHandler()
    }

    handeCustomParam(e) {
        e.preventDefault();
        e.stopPropagation();

        let inputs = {...this.state.inputs};
        let param = this.state.customParam;

        let inputParameters = inputs.inputParameters;
        inputs = {
            ...inputs,
            inputParameters: {
                ...inputParameters,
                [param]: "${workflow.input." + param + "}"
            }
        };

        this.setState({
            inputs: inputs,
            customParam: ""
        });
    }

    handleInput(e, item, entry, i) {
        let inputs = {...this.state.inputs};

        if (item[0] === "inputParameters") {
            let inputParameters = inputs.inputParameters;
            let value = e.target.value;

            if (entry[0] === "template") {
                try {
                    value = JSON.parse(e.target.value)
                } catch (e) {
                    console.log(e);
                }
            }

            inputs = {
                ...inputs,
                inputParameters: {
                    ...inputParameters,
                    [entry[0]]: value
                }
            };
        } else if (item[0] === "subWorkflowParam") {
            let subWorkflowParam = inputs.subWorkflowParam;
            inputs = {
                ...inputs,
                subWorkflowParam: {
                    ...subWorkflowParam,
                    [entry[0]]: e.target.value
                }
            };
        } else if (item[0] === "decisionCases") {
            let decisionCases = {...inputs.decisionCases};
            let keyNames = Object.keys(decisionCases);
            let trueCase = decisionCases[keyNames[1]] || [];
            let falseCase = decisionCases[keyNames[0]] || [];

            if (i === 0) {
                decisionCases = {
                    [e.target.value]: falseCase,
                    [keyNames[1]]: trueCase
                }
            } else {
                decisionCases = {
                    [keyNames[0]]: falseCase,
                    [e.target.value]: trueCase
                }
            }
            inputs.decisionCases = decisionCases;
        } else {
            inputs = {
                ...inputs,
                [entry[0]]: e.target.value
            }
        }

        this.setState({
            inputs: inputs
        });
    }

    render() {

        let notGeneral = ["type", "subWorkflowParam", "joinOn", "forkTasks", "inputParameters"];
        let textFieldParams = [];

        return (
            <Modal size="lg" show={this.state.show} onHide={this.handleClose}>
                <Modal.Header>
                    <Modal.Title>Edit task inputs</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{padding: "30px"}}>
                    <Tabs style={{marginBottom: "20px"}}>
                        <Tab eventKey={1} title="General">
                            <Form onKeyPress={this.handleSave}>
                                <Row>
                                    {Object.entries(this.state.inputs).map((item, i) => {
                                        if (!notGeneral.includes(item[0]) && item[0] !== "decisionCases") {
                                            return (
                                                <Col sm={6} key={`col2-${i}`}>
                                                    <Form.Group>
                                                        <Form.Label>{item[0]}</Form.Label>
                                                        <Form.Control
                                                            type="input"
                                                            onChange={(e) => this.handleInput(e, item, item)}
                                                            value={item[1]}/>
                                                        <Form.Text className="text-muted">
                                                            {taskDescriptions[item[0]]}
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            )
                                        } else if (item[0] === "decisionCases") {
                                            return Object.entries(item[1]).map((entry, i) => {
                                                return (
                                                    <Col sm={6} key={`col1-${i}`}>
                                                        <Form.Group>
                                                            <Form.Label>decision case #{i}</Form.Label>
                                                            <Form.Control
                                                                type="input"
                                                                onChange={(e) => this.handleInput(e, item, entry, i)}
                                                                value={entry[0]}/>
                                                        </Form.Group>
                                                    </Col>
                                                )
                                            })
                                        }
                                        return null;
                                    })}
                                </Row>
                            </Form>
                        </Tab>
                        <Tab eventKey={2} title="Input parameters">
                            <Row>
                                <Form onSubmit={this.handeCustomParam.bind(this)}>
                                    <InputGroup style={{padding: "10px 215px 10px"}}>
                                        <Form.Control value={this.state.customParam}
                                                      onChange={(e) => this.setState({customParam: e.target.value})}
                                                      placeholder="Add new parameter name"/>
                                        <InputGroup.Append>
                                            <Button type="submit" variant="outline-primary">Add</Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form>
                            </Row>
                            <hr className="hr-text" data-content="Existing input parameters"/>
                            <Form>
                                <Row>
                                    {Object.entries(this.state.inputs).map(item => {
                                        if (item[0] === "inputParameters") {
                                            return Object.entries(item[1]).map((entry, i) => {
                                                if (entry[0].includes("template") || entry[0].includes("uri")) {
                                                    let value = entry[1];

                                                    if (entry[0].includes("template")) {
                                                        if (typeof entry[1] === 'object') {
                                                            value = JSON.stringify(entry[1], null, 5);
                                                        }
                                                    }

                                                    textFieldParams.push(
                                                        <Col sm={12} key={`col1-${i}`}>
                                                            <Form.Group>
                                                                <Form.Label>{entry[0]}</Form.Label>
                                                                <InputGroup size="sm" style={{
                                                                    minHeight: entry[0] === "template" ? "200px" : "60px"
                                                                }}>
                                                                    <Form.Control
                                                                        as="textarea"
                                                                        type="input"
                                                                        onChange={(e) => this.handleInput(e, item, entry)}
                                                                        value={value}/>
                                                                </InputGroup>
                                                            </Form.Group>
                                                        </Col>
                                                    )
                                                } else {
                                                    return (
                                                        <Col sm={6} key={`col1-${i}`}>
                                                            <Form.Group>
                                                                <Form.Label>{entry[0]}</Form.Label>
                                                                <Form.Control
                                                                    type="input"
                                                                    onChange={(e) => this.handleInput(e, item, entry)}
                                                                    value={entry[1]}/>
                                                            </Form.Group>
                                                        </Col>
                                                    )
                                                }
                                            })
                                        }
                                        return null;
                                    })}
                                </Row>
                                <Row>
                                    {textFieldParams}
                                </Row>
                            </Form>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleSave}>Save</Button>
                    <Button variant="secondary" onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default SubwfModal;
