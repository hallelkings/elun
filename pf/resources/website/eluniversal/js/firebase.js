// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMTu2Y7x0seQ95pjapsuWFC6Puz9m1U2s",
  authDomain: "el-universal-55f2c.firebaseapp.com",
  databaseURL: "https://el-universal-55f2c.firebaseio.com",
  projectId: "el-universal-55f2c",
  storageBucket: "el-universal-55f2c.appspot.com",
  messagingSenderId: "921528145867",
  appId: "1:921528145867:web:546cf7564e67020d45c84e"
};






const subscribeToNotification = function (token) {
  const request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      const response = JSON.parse(request.response);
      if (response.response) {
        localStorage.setItem("notificationEnabled", true);
        localStorage.setItem("firToken", token);
      } else {
        localStorage.setItem("notificationEnabled", false);
      }
    }
  };

  request.open(
    "POST",
    "https://notificaciones.eluniversal.com.mx/v1/push/subscribe",
  );
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(
    JSON.stringify({
      token: token,
      topic: "web",
      appId: 6,
    }),
  );
};

const unsubscribeNotification = function (token) {
  const request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      const response = JSON.parse(request.response);
      if (response.response) {
        localStorage.setItem("notificationEnabled", false);
        localStorage.setItem("firToken", null);
      } else {
        localStorage.setItem("notificationEnabled", true);
      }
    }
  };

  request.open(
    "POST",
    "https://notificaciones.eluniversal.com.mx/v1/push/unsubscribe",
  );
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(
    JSON.stringify({
      token: token,
      topic: "web",
      appId: 6,
    }),
  );
};
// Adding service worker
if ("serviceWorker" in navigator && "Notification" in window) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register(
        "/pf/resources/website/eluniversalpuebla/js/firebase-messaging-sw-puebla.js?d=317",
      )

      .then((registration) => {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        var messaging = firebase.messaging();
        messaging.usePublicVapidKey(
          "BI9xEScWEXKJgAl1eeGQixJ4W3-ZASmEmQv-UGg-0yayej7ZMWkGoKB3R8Z-SefzzrIUpLn7CKlrNIsI4ZVBiNI",
        );
        messaging.useServiceWorker(registration);

        Notification.requestPermission(function (permission) {
          const notificationEnabled = localStorage.getItem(
            "notificationEnabled",
          );

          if (
            permission === "granted" &&
            notificationEnabled !== "true" &&
            typeof Storage !== "undefined"
          ) {
            messaging
              .getToken()
              .then(function (currentToken) {
                if (currentToken) {
                  subscribeToNotification(currentToken);
                }
              })
              .catch(function (err) {
                console.log("An error occurred while retrieving token. ", err);
              });
          } else if (permission === "granted" && notificationEnabled === null) {
            messaging
              .getToken()
              .then(function (currentToken) {
                if (currentToken) {
                  subscribeToNotification(currentToken);
                }
              })
              .catch(function (err) {
                console.log("An error occurred while retrieving token. ", err);
              });
          } else if (
            permission === "denied" &&
            notificationEnabled === "true"
          ) {
            messaging
              .getToken()
              .then(function () {
                unsubscribeNotification(localStorage.getItem("firToken"));
              })
              .catch(function (err) {
                console.log("An error occurred while retrieving token. ", err);
                unsubscribeNotification(localStorage.getItem("firToken"));
              });
          }

          // Callback fired if Instance ID token is updated.
          messaging.onTokenRefresh(function (currentToken) {
            unsubscribeNotification(currentToken);
            messaging
              .getToken()
              .then(function (refreshedToken) {
                subscribeToNotification(refreshedToken);
              })
              .catch(function (err) {
                console.log("Unable to retrieve refreshed token ", err);
              });
          });
        });

        messaging.onMessage(function (payload) {
          registration.showNotification(payload.data.title, {
            body: payload.data.body,
            icon: payload.data.note_image,
            data: payload.fcmOptions.link,
            badge:
              "https://www.eluniversalpuebla.com.mx/pf/resources/website/eluniversalpuebla/favicon.ico?d=312",
          });
        });
      });
  });
}