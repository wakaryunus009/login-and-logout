const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser"); // Import body-parser middleware
const cors = require("cors");

const app = express();

// Configure body-parser middleware
app.use(bodyParser.json());

// Configure session middleware
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Add CORS middleware
app.use(cors());

const checkAndInvalidateSession = async (req, res, next) => {
  try {
    const { username, deviceId } = req.body;
    console.log("Checking and invalidating session for:", username);
    if (!username || !deviceId) {
      console.log("Missing required fields in the request body");
      return res
        .status(400)
        .send({ message: "Missing required fields in the request body" });
    }
    const activeSessions = req.sessionStore.sessions;
    console.log("Active sessions:", activeSessions);
    for (let sessionID in activeSessions) {
      const sessionData = JSON.parse(activeSessions[sessionID]);
      console.log("Session data:", sessionData);
      if (
        sessionData.user &&
        sessionData.user.username === username &&
        sessionData.user.deviceId !== deviceId
      ) {
        console.log("Invalidating previous session:", sessionID);
        req.sessionStore.destroy(sessionID, (err) => {
          if (err) {
            console.error("Error destroying session:", err);
          } else {
            console.log("Previous session invalidated for user:", username);
          }
        });
      }
    }
    next();
  } catch (error) {
    console.error("Error checking and invalidating session:", error);
    next();
  }
};

app.post("/login", checkAndInvalidateSession, async (req, res) => {
  const { username, password, deviceId } = req.body;
  console.log(
    "Received login request for username:",
    username,
    "and deviceId:",
    deviceId
  );
  if (!username || !password || !deviceId) {
    console.log("Missing required fields in the request body");
    return res
      .status(400)
      .send({ message: "Missing required fields in the request body" });
  }
  const hardcodedUsername = "raj";
  const hardcodedPassword = "123";
  const hardcodedDeviceId = "null";
  if (username === hardcodedUsername && password === hardcodedPassword) {
    console.log("Login successful for username:", username);
    req.session.user = { username, deviceId: hardcodedDeviceId };
    res.status(200).send({ message: "Login successful" });
  } else {
    console.log("Invalid credentials for username:", username);
    res.status(401).send({ message: "Invalid credentials" });
  }
});

app.post("/logout", (req, res) => {
  const { username } = req.session.user || {}; // Get username from session, if available
  if (username) {
    console.log("Received logout request for username:", username);
  } else {
    console.log("Received logout request");
  }
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send({ message: "Logout failed" });
    } else {
      console.log("Logout successful");
      res.status(200).send({ message: "Logout successful" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
