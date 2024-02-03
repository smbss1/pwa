import React, { useEffect, useState } from "react";
import "./NotificationModal.css";
import { getApi, postApi, urlBase64ToUint8Array } from "../Util/apiControleur";

interface NotificationModalProps {
  onClose: () => void;
}

async function requestNotifPermission() {
    // Vérification de la disponibilité du service worker et des notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Demande de permission pour envoyer des notifications
      let permission;
      try {
        permission = await Notification.requestPermission();
      }
      catch (e) {
        console.error('Erreur lors de la demande de permission pour les notifications', e);
        return;
      }
      if (permission === 'granted') {
        // L'utilisateur a donné la permission pour les notifications
        // Enregistrement du service worker
        const registration = await navigator.serviceWorker.ready;
        // Récupération du token de l'API Push Notification
        registration.pushManager.getSubscription()
          .then(async (subscription) => {
              if (subscription) {
                return subscription;
              }
              const response = await getApi('notification/vapidPublicKey');
              const vapidPublicKey = await response.text();
              const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
              return registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
              });
            })
          .then(function(subscription) {
              // Send subscription to the backend
              if (subscription) {
                postApi('notification/subscribe', subscription)
              } else {
                console.error('Erreur lors de l\'abonnement aux notifications');
              }
          });
      } else {
        console.warn('L\'utilisateur a refusé la permission pour les notifications.');
      }
    } else {
      console.warn('Le navigateur ne prend pas en charge les notifications push.');
    }
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleEnableClick = async () => {
    if (Notification.permission === "default") {
      await requestNotifPermission();
    }
    setIsModalOpen(false);
    onClose();
  };

  const handleCloseClick = () => {
    setIsModalOpen(false);
    onClose();
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  if (!isModalOpen) {
    return null;
  }

  return (
    <>
        <div className="modal-backdrop" />
        <div className="notification-modal">
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
        <h2>Notifications</h2>
        <p>
            Voulez-vous êtres alertés lorsque les personnes que vous suivez postent
            du nouveau contenu ?
        </p>
        <div className="enableNotification">
            <button onClick={handleEnableClick}>Accepter</button>
        </div>
        <div className="delayNotification">
            <button onClick={handleCloseClick}>Pas maintenant</button>
        </div>
        </div>
    </>
  );
};

export default NotificationModal;
