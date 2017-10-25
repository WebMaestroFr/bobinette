import React from 'react';
import PropTypes from 'prop-types';

import LabelDetection from './LabelDetection';
import LabelForm from './LabelForm';
import LabelHomonymList from './LabelHomonymList';

import './Label.css';

class Label extends React.Component {

    constructor(props) {
        super(props);
        const {access, name} = props;
        this.state = {
            access,
            name
        };
        this.onAccessChange = this
            .onAccessChange
            .bind(this);
        this.onNameChange = this
            .onNameChange
            .bind(this);
        this.onTrain = this
            .onTrain
            .bind(this);
    }

    onAccessChange({target}) {
        const state = Object.assign({
            ...this.state
        }, {access: target.checked});
        this.setState(state);
        return this
            .props
            .onChange(this.props.id, state);
    }

    onNameChange({target}) {
        const state = Object.assign({
            ...this.state
        }, {name: target.value});
        this.setState(state);
        return this
            .props
            .onChange(this.props.id, state);
    }

    onTrain(event) {
        event.preventDefault();
        return this
            .props
            .onTrain(this.props.id);
    }

    componentWillReceiveProps({access, name}) {
        this.setState({access, name});
    }

    shouldComponentUpdate({
        detection,
        homonyms,
        validationState
    }, {access, name}) {
        return access !== this.state.access || name !== this.state.name || detection.snapshot_date !== this.props.detection.snapshot_date || homonyms.length !== this.props.homonyms.length || validationState !== this.props.validationState;
    }

    render() {
        return <LabelDetection {...this.props.detection}>
            <LabelForm
                access={this.state.access}
                name={this.state.name}
                onAccessChange={this.onAccessChange}
                onNameChange={this.onNameChange}
                onTrain={this.onTrain}
                showTrain={this.props.homonyms.length > 0}
                validationState={this.props.validationState}/>
            <LabelHomonymList homonyms={this.props.homonyms} validationState={this.props.validationState}/>
        </LabelDetection>;
    }
}

Label.propTypes = {
    access: PropTypes.bool,
    detection: PropTypes.shape(LabelDetection.propTypes),
    homonyms: PropTypes.array,
    id: PropTypes.number,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onTrain: PropTypes.func,
    validationState: PropTypes.string
};

export default Label;