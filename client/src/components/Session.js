import React from 'react';
import PropTypes from 'prop-types';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import Sequence from './Sequence';

class Session extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            date: new Date(props.date),
            sequences: props.sequences || []
        };
    }

    componentDidMount() {
        this.handleFrame = (event) => {
            this.setState({
                date: new Date(event.data.date),
                sequences: event.data.sequences
            });
        };
        if (this.props.event) {
            document.addEventListener(this.props.event, this.handleFrame);
        }
    }

    componentWillUnmount() {
        if (this.props.event) {
            document.removeEventListener(this.props.event, this.handleFrame);
        }
    }

    render() {
        return (
            <div className="Session">
                <time className="Session-date text-muted">
                    {this
                        .state
                        .date
                        .toLocaleString()}
                </time>
                <ListGroup className="Session-sequences">
                    {this
                        .state
                        .sequences
                        .map(this.renderSequence)}
                </ListGroup>
            </div>
        );
    }

    renderSequence(sequence, index) {
        return (
            <ListGroupItem className="Session-sequence" key={index}>
                <Sequence date={sequence.date} snapshots={sequence.snapshots}/>
            </ListGroupItem>
        );
    }
}

Session.propTypes = {
    date: PropTypes.instanceOf(Date),
    event: PropTypes.string,
    sequences: PropTypes.array
};

export default Session;