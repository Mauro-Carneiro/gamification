import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createSession, validateSession } from "./sessionManager";
import { BrowserRouter, Route, Link } from "react-router-dom";

(function() {
    const storage = window.localStorage;

    var pjson = require('../package.json');
    const basename = pjson.basename ?? '/';

    Promise.resolve()
        .then(validateSession)
            .catch(createSession)
        .then(() => console.table(storage))
        .finally(renderWebpage);

    function renderWebpage() {
        ReactDOM.render(
            <React.StrictMode>
                <BrowserRouter basename={basename} forceRefresh={true} >
                    <App />
                </BrowserRouter>
            </React.StrictMode>,
            document.getElementById('root')
        );
    }
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
