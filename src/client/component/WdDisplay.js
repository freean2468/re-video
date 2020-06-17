import React, { Component } from 'react';

export default class WdDisplay extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <>
                <span className="WdDisplay">
                    {this.props.token}
                </span>
                {this.props.isSpace &&
                    <span>&nbsp;</span>
                }
            </>
        );
    }
}