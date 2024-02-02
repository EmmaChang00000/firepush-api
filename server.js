const { from } = require("rxjs");
const { mergeMap, toArray } = require("rxjs/operators");

const express = require("express");
const cors = require("cors");
const webPush = require("web-push");
const bodyParser = require("body-parser");
const app = express();
const users = [];

app.use(cors());
app.use(bodyParser.json());

const publicVapidKey = 'BJD7XKX8M2cXsZd7tNwR98X0z5TKGVeHg0J8HLlwRfxSw8dqoifUOm00EbtZYCSJxNIQ89fYYj83Rbpfy7TYvH8' || '';
const privateVapidKey =  'm4mWs-h8fDZDTeiwoGKObFOlQ64PxRiyNhm61Q91hEk' || '';

webPush.setVapidDetails(
  "mailto:test@example.com",
  publicVapidKey,
  privateVapidKey
);

/**
 * const pushSubscription = {
 *   endpoint: 'https://fcm.googleapis.com/fcm/send/ecBSQhaT1W4:APA91bF-xP4oGwSbC6ZsvT3Dq6-Briw07cbOCZnLHO8VuG3olPWO3pwKm89E6tvqseAa1vVHScJxn9A5VRDL7IVffJdX1t6W81UOiuDf2ptCM6V3BUJ7Ool__5WnXghV8gZsCXs1vU9G',
 *   expirationTime: null,
 *   keys: {
 *     p256dh: 'BCe9ENj5juAFNzRt91wEaByruhGxF9lMDSyRe9FTZHN6UAoFVA-ESIwx7LXaBUkDBuquueHQeQa4_W52Y8aycig',
 *     auth: 'OndvwybepBFjwmMfwAX9Lg'
 *   }
 * }
 */
app.post("/api/register", (req, res) => {
  if (!req.body.pushSubscription) {
    return res.status(200).json({
      result: "fail",
      detail: "Missing required fields: pushSubscription",
      timestamp: Date.now(),
    });
  }
  if (!req.body.group) {
    return res.status(200).json({
      result: "fail",
      detail: "Missing required fields: group",
      timestamp: Date.now(),
    });
  }

  users.push({
    id: users.length + 1,
    group: req.body.group,
    pushSubscription: req.body.pushSubscription,
  });

  res.status(200).json({
    result: "success",
    detail: "",
    timestamp: Date.now(),
  });
});

/**
 * const pushContent = JSON.stringify({
 *   notification: {
 *     title: "Notifications are cool",
 *     body: "Know how to send notifications through Angular with this article!",
 *     icon: "https://www.shareicon.net/data/256x256/2015/10/02/110808_blog_512x512.png",
 *     vibrate: [100, 50, 100],
 *     data: {
 *       url: "https://medium.com/@arjenbrandenburgh/angulars-pwa-swpush-and-swupdate-15a7e5c154ac",
 *     },
 *   },
 * });
 */
app.post("/api/push", (req, res) => {
  if (!req.body.group) {
    return res.status(200).json({
      result: "fail",
      detail: "Missing required fields: group",
      timestamp: Date.now(),
    });
  }
  if (!req.body.pushContent) {
    return res.status(200).json({
      result: "fail",
      detail: "Missing required fields: pushContent",
      timestamp: Date.now(),
    });
  }

  const receives = users.filter((user) => {
    return user.group === req.body.group;
  });

  from(receives)
    .pipe(
      mergeMap((receive) =>
        webPush
          .sendNotification(receive.pushSubscription, req.body.pushContent)
          .then((response) => {
            return "success";
          })
          .catch((error) => {
            return `${receive.id}`;
          })
      ),
      toArray()
    )
    .subscribe((results) => {
      const allSuccess = results.every((result) => result === "success");
      if (allSuccess) {
        res
          .status(200)
          .json({ result: "success", detail: "", timestamp: Date.now() });
      } else {
        const failed = results.find((id) => id !== "success");
        res.status(200).json({
          result: "fail",
          detail: `id=${failed}`,
          timestamp: Date.now(),
        });
      }
    });
});

app.get("/api/version", (req, res) => {
  res.status(200).json({
    version: "1.0.0",
    timestamp: Date.now(),
  });
});

app.set("port", 12345);

const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
