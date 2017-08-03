import React from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, FormControl, Media} from 'react-bootstrap';

import Canvas from './Canvas'

import './Label.css';

class Label extends React.Component {

    shouldComponentUpdate({name, date}) {
        return name !== this.props.name || date > this.props.date;
    }

    render() {
        const date = new Date(this.props.date);
        const onNameChange = ({target}) => this
            .props
            .onNameChange({id: this.props.id, name: target.value});
        const onNameFocus = this.props.onNameFocus
            ? () => this
                .props
                .onNameFocus(this.props.id)
            : null;
        return <Media className="Label">
            <Media.Left>
                <Canvas
                    ref="image"
                    className="Label-image"
                    base64={this.props.image}
                    type="jpeg"
                    width={64}
                    height={64}/>
            </Media.Left>
            <Media.Body>
                <Form>
                    <FormGroup controlId="labelName" bsSize="large">
                        <time ref="date" className="Label-date" dateTime={date}>
                            {date.toLocaleString()}
                        </time>
                        <FormControl
                            ref="name"
                            className="Label-name"
                            type="text"
                            value={this.props.name}
                            placeholder={`Label #${this.props.id}`}
                            onChange={onNameChange}
                            onFocus={onNameFocus}
                            onBlur={this.props.onNameBlur}/>
                    </FormGroup>
                </Form>
            </Media.Body>
        </Media>;
    }
}
Label.propTypes = {
    id: PropTypes.number.isRequired,
    date: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    onNameChange: PropTypes.func.isRequired,
    onNameBlur: PropTypes.func,
    onNameFocus: PropTypes.func
};

export default Label;