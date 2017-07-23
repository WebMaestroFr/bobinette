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
        const onChange = ({target}) => this
            .props
            .onChange({id: this.props.id, name: target.value});
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
                <Form className="Label-name">
                    <FormGroup controlId="labelName" bsSize="large">
                        <time ref="date" className="Label-date" dateTime={date}>
                            {date.toLocaleString()}
                        </time>
                        <FormControl
                            ref="name"
                            type="text"
                            value={this.props.name}
                            placeholder={`Label #${this.props.id}`}
                            onChange={onChange}/>
                    </FormGroup>
                </Form>
            </Media.Body>
        </Media>;
    }
}

Label.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

Label.defaultProps = {
    id: null,
    name: null,
    date: 0,
    image: null
};

class LabelList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: []
        }
        this.updateItems = this
            .updateItems
            .bind(this);
    }

    updateItems(labels, detections) {
        const toLatest = (a, b) => a.date > b.date
            ? a
            : b;
        const toItem = ({id}) => {
            const byLabel = ({label}) => label === id;
            const {date, image} = detections
                .filter(byLabel)
                .reduce(toLatest, {
                    date: 0,
                    image: null
                });
            return {id, date, image};
        };
        this.setState({
            items: labels.map(toItem)
        });
    }

    componentDidMount() {
        this.updateItems(this.props.labels, this.props.detections);
    }

    componentWillReceiveProps({labels, detections}) {
        if (labels.length !== this.props.labels.length || detections.length !== this.props.detections.length) {
            this.updateItems(labels, detections);
        }
    }

    render() {
        const byDate = (a, b) => b.props.date - a.props.date;
        const renderItem = (item) => {
            const byId = ({id}) => id === item.id;
            const label = this
                .props
                .labels
                .find(byId);
            return <Label
                key={item.id}
                className="LabelList-item"
                {...item}
                name={label.name}
                onChange={this.props.onChange}/>;
        }
        return <div className="LabelList">{this
                .state
                .items
                .map(renderItem)
                .sort(byDate)}</div>;
    }
}

LabelList.propTypes = {
    labels: PropTypes.array.isRequired,
    detections: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
};

LabelList.defaultProps = {
    labels: [],
    detections: []
};

export default LabelList;