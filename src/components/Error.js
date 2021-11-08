import React from 'react'

const Error = ({message}) => {
    return (
        <span className="text-danger mt-3 d-block fw-bold">{ message }</span>
    )
}

export default Error
