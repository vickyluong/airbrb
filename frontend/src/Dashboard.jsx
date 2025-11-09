import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

function Dashboard(props) {

    const navigate = useNavigate();

    useEffect(() => {
        if (!props.token) {
            navigate('/login');
        }
    }, [props.token, navigate]);

    return (
        <>
        Dashboard!!
        </>
    )
}

export default Dashboard