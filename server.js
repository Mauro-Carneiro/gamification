const express = require("express");
const path = require("path");
const sessionManager = require("./sessionManager");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "./build")));

// saves page header, only works in production build
app.use("/(:sessionId)?", (req, res, next) => {
    const sessionId = req.query.sessionId;

    if (sessionId) {
        sessionManager.setReturnFromPretestHeaders(sessionId, req.headers)
        .finally(next);
    } else {
        next();
    }
});

app.get("/createSession", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    sessionManager.createSession(ip)
    .then(session => {
        res.status(200).send(session);
    })
    .catch(e => {
        console.error(e);
        res.status(401).send(e);
    });
});

app.get("/closeSession", (req, res) => {
    sessionManager.closeSession(req.query.sessionId)
    .then(() => {
        res.send(200).end();
    })
    .catch(e => {
        res.status(401).end();
    })
});

app.get("/validateSession", (req, res) => {
    const { sessionId, created, environmentName, redirectedToPretest } = req.query;

    sessionManager.getSession(sessionId)
    .then(session => {
        if (!session
            || session.created != created
            || !session.active
            || session.environmentName != environmentName
            || session.redirectedToPretest != JSON.parse(redirectedToPretest) // ayy
        ) {
            // doesn't match
            return res.status(401).end();
        }

        res.status(200).send({ success: true });
    })
    .catch(e => {
        // session does not exist
        res.status(401).end();
    });
});

app.get("/setUserSentToPretest", (req, res) => {
    const { sessionId, url } = req.query;

    if (!sessionId || !url)
        return res.status(401).end("invalid params");

    sessionManager.setUserSentToPretest(sessionId, url)
    .then(() => {
        res.status(200).end();
    })
    .catch(e => {
        console.error(e);
        res.status(401).end(e);
    });
});

app.get("/setReturnFromPretest", (req, res) => {
    const { sessionId, referrer, url } = req.query;

    if (!sessionId || !referrer || !url)
        return res.status(401).end("invalid params");
    
    sessionManager.setReturnFromPretest(sessionId, referrer, url)
    .then(() => {
        res.status(200).end();
    })
    .catch(e => {
        console.error(e);
        res.status(401).end(e);
    })
});

app.get("/setUserSentToPosttest", (req, res) => {
    const { sessionId, url } = req.query;

    if (!sessionId || !url)
        return res.status(401).end("invalid params");

    sessionManager.setUserSentToPosttest(sessionId, url)
    .then(() => {
        res.status(200).end();
    })
    .catch(e => {
        console.error(e);
        res.status(401).end(e);
    });
});

app.get("/notifyExpectedPerformance", (req, res) => {
    const { sessionId, expectedPerformance } = req.query;

    if (!sessionId || !expectedPerformance)
        return res.status(401).end("invalid params");

    sessionManager.notifyExpectedPerformance(sessionId, expectedPerformance)
    .then(() => {
        res.status(200).end();
    })
    .catch(e => {
        console.error(e);
        res.status(401).end(e);
    });
});

app.get("/notifyAnswer", (req, res) => {
    const { sessionId, questionId, answer } = req.query;

    if (!sessionId || !questionId || !answer)
        return res.status(401).end("invalid params");

    sessionManager.notifyAnswer(sessionId, questionId, answer)
    .then(() => {
        res.status(200).end();
    })
    .catch(e => {
        console.error(e);
        res.status(401).end(e);
    });
});

app.get("/notifyTrophyUnlock", (req, res) => {
    const { sessionId, trophyId } = req.query;

    if (!sessionId || !trophyId)
        return res.status(401).end("invalid params");

    sessionManager.notifyTrophyUnlock(sessionId, trophyId)
    .then(() => {
        res.status(200).end();
    })
    .catch(e => {
        console.error(e);
        res.status(401).end(e);
    });
});

app.post("/notifyGame", (req, res) => {
    sessionManager.notifyGame(req.body)
    .then(() => {
        res.status(200).end();
    })
    .catch(e => {
        console.error(e);
        res.status(401).end(e);
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/build/index.html'));
});

const port = process.env.SERVER_PORT || 5000;
app.listen(port, function() {
    console.log(`The server is listening to localhost:${port}`);

    if (process.env.pm_id === undefined) {
        console.warn("You are not running the server with PM2! If the server crashes it won't start again.");
    }
});
