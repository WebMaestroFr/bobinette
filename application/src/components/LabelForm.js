import React from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    Form,
    FormGroup,
    FormControl,
    Glyphicon,
    InputGroup
} from 'react-bootstrap';

class LabelForm extends React.Component {

    /* shouldComponentUpdate({access, name, showTrain, validationState}) {
        return access !== this.props.access || name !== this.props.name || showTrain !== this.props.showTrain || validationState !== this.props.validationState;
    } */

    render() {
        const trainButton = this.props.showTrain
            ? <InputGroup.Button>
                    <Button bsSize="large" bsStyle={this.props.validationState} onClick={this.props.onTrain}>
                        <Glyphicon glyph="refresh"/>&nbsp;Train
                    </Button>
                </InputGroup.Button>
            : null;
        return <Form className="LabelForm">
            <FormGroup bsSize="large" controlId="labelName" validationState={this.props.validationState}>
                <InputGroup>
                    <InputGroup.Addon>
                        <input
                            aria-label="Access"
                            checked={this.props.access}
                            onChange={this.props.onAccessChange}
                            type="checkbox"/>
                    </InputGroup.Addon>
                    <FormControl
                        className="Label-name"
                        onChange={this.props.onNameChange}
                        type="text"
                        value={this.props.name}/> {trainButton}
                </InputGroup>
            </FormGroup>
        </Form>;
    }
}

LabelForm.propTypes = {
    access: PropTypes.bool,
    name: PropTypes.string,
    onAccessChange: PropTypes.func,
    onNameChange: PropTypes.func,
    onTrain: PropTypes.func,
    showTrain: PropTypes.bool,
    validationState: PropTypes.string
};

export default LabelForm;