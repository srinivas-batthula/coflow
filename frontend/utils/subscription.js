'use client';

//Method for public vapid key conversion...
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default async function askNotificationPermission(token) {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications.');
        return;
    }
    // Check the current permission status
    if (Notification.permission === 'granted') {
        console.log('User has already granted permission for notifications.');
        return;
    }
    // Request permission from the user
    Notification.requestPermission()
        .then(async (permission) => {
            if (permission === 'granted') {
                console.log('User granted permission for notifications.');
                // You can also subscribe the user to push notifications here
                await subscribeToNotifications(token);
            } else {
                console.log('User denied permission for notifications.');
            }
        })
        .catch((error) => {
            console.error('Error occurred while requesting permission:', error);
        });
}

async function subscribeToNotifications(token) {
    // console.log("Registering Push...")

    const publicVapidKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY + '');
    // console.log("PublicKey converted to Uint8Array...")

    let subscription;
    try {
        let registration = await navigator.serviceWorker.ready;
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicVapidKey, // Replace with your VAPID public key
        });
        console.log('Push Registered...');
    } catch (err) {
        console.log('Error while registering Push : ' + err);
    }

    try {
        let r = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/update?q=subscription`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscription }),
            }
        );
        r = await r.json();

        if (r.success) {
            console.log('User is subscribed to notifications...');
        } else {
            console.log('An error occurred while Sending Notification');
        }
    } catch (err) {
        console.log('Error : ' + err);
    }
}
