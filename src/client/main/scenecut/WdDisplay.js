import React from 'react';

export default function WdDisplay(props) {
    return (
        <>
            <span className="WdDisplay">
                {props.token}
            </span>
            {props.isSpace &&
                <span>&nbsp;</span>
            }
            <div className="TokenInfo">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <table className="StrtInfo">
                                    <tbody>
                                        <tr>
                                            <td>
                                                blank
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <table className="StrtToken">
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan={42}>
                                                                blank
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <span>
                                                                    blank
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td className="Indicator">
                                <br></br>
                                blank <br></br>
                                blank
                            </td>
                            <td className="CmtContainer">
                                <div className="Cmt">blank</div>
                                <div className="Cmt">blank</div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={42}>
                                <div className="TrstInfoContainer">
                                    <table className="TrstInfo">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    본문
                                                </td>
                                                <td>
                                                    blank
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    직역
                                                </td>
                                                <td>
                                                    공백
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    의역
                                                </td>
                                                <td colSpan={42}>
                                                    공백
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}