import React from 'react';
import PropTypes from 'prop-types';
import {Carousel, FormControl, FormGroup, Modal} from 'react-bootstrap';

import Snapshot from './Snapshot';
import Vision from './Vision';

import './Sequence.css';

class Sequence extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            index: 0,
            direction: null
        };
    }

    render() {
        const handleHide = () => {
            this.setState({modal: false});
        };
        const handleSelect = (index, e) => {
            this.setState({index: index, direction: e.direction});
        };
        return (
            <div className="Sequence">
                <ul className="Sequence-snapshots list-inline">
                    {this
                        .props
                        .snapshots
                        .map((snapshot, index) => {
                            const d = new Date(snapshot.date);
                            const src = snapshot.matrix
                                ? "data:image/jpeg;base64," + snapshot.matrix
                                : false;
                            const handleClick = () => {
                                this.setState({modal: true, index: index});
                            };
                            return (
                                <li className="Sequence-snapshot" key={index * 2} onClick={handleClick}>
                                    <Snapshot width={64} height={64} date={d} image={snapshot.image} roi={snapshot.roi}/> {src && <img src={src} alt={d}/>}
                                </li>
                            );
                        })}
                </ul>
                <Modal show={this.state.modal} onHide={handleHide}>
                    <Carousel activeIndex={this.state.index} direction={this.state.direction} onSelect={handleSelect}>
                        {this
                            .props
                            .snapshots
                            .map((snapshot, index) => {
                                const d = new Date(snapshot.date);
                                return (
                                    <Carousel.Item key={index * 2 + 1}>
                                        <Vision detections={[snapshot]} width={480} height={360}>
                                            <img alt={d} src={snapshot.image} width={480} height={360}/>
                                        </Vision>
                                        <Carousel.Caption>
                                            <time>
                                                {d.toLocaleString()}
                                            </time>
                                        </Carousel.Caption>
                                    </Carousel.Item>
                                );
                            })}
                    </Carousel>
                    <Modal.Body>
                        <form>
                            <FormGroup bsSize="large">
                                <FormControl type="text" placeholder="Key Holder"/>
                            </FormGroup>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

Sequence.propTypes = {
    snapshots: PropTypes.array
};

export default Sequence;