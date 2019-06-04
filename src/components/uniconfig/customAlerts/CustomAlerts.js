import React, { Component } from 'react';
import {Alert} from "react-bootstrap";


class CustomAlerts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true
        }
    }

    render() {
        const handleDismiss = () => this.props.alertHandler();

        function showAlert(alertType) {
            switch (alertType.type) {
                case 'commit200':
                    return (
                        <Alert variant="success">
                            Commit to network was successful.
                        </Alert>
                    );
                case 'commit500':
                    return (
                        <Alert variant="success">
                            Commit to network failed.
                        </Alert>
                    );
                case 'snapCreated':
                    return (
                        <Alert variant="success">
                            New snapshot was created.
                        </Alert>
                    );
                case 'dryrun': {
                    return (
                        <Alert onClick={handleDismiss} variant={alertType.overallStatus === "complete" ? "success" : "danger" }>
                            <b>DRY-RUN {alertType.overallStatus.toUpperCase()}:&nbsp;&nbsp;</b>
                            {alertType.overallStatus === "fail" ?
                                alertType.errorMessage
                                :
                                alertType.nodeStatus ?
                                "Node-status: " + alertType.nodeStatus
                                    : null
                            }&nbsp;&nbsp;&nbsp;&nbsp;
                            <i className="fas fa-times clickable" onClick={handleDismiss}/>
                        </Alert>
                    );
                }
                case 'sync': {
                    return (
                        <Alert onClick={handleDismiss} variant={alertType.status !== "error" ? "success" : "danger" }>
                            <b>SYNC-FROM-NETWORK :&nbsp;&nbsp;</b>
                            {alertType.nodeId ? alertType.nodeId + " " + alertType.status : alertType.status}
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <i className="fas fa-times clickable" onClick={handleDismiss}/>
                        </Alert>
                    );
                }
                default:
                    return null;
            }

        }

        return (
            this.state.show ? showAlert(this.props.alertType) : null
        );
    }

}

export default CustomAlerts;