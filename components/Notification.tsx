
import React from 'react';
import { WarningIcon, CloseIcon, InformationCircleIcon, CheckCircleIcon } from './Icons';

type NotificationType = 'warning' | 'info' | 'success';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const notificationStyles: { [key in NotificationType]: { [key: string]: string } } = {
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800/50',
    iconBg: 'bg-yellow-100 dark:bg-yellow-800',
    iconText: 'text-yellow-500 dark:text-yellow-300',
    messageText: 'text-yellow-800 dark:text-yellow-200',
    closeButton: 'text-yellow-500 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-800',
    closeFocusRing: 'focus:ring-yellow-600 dark:focus:ring-offset-slate-800',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800/50',
    iconBg: 'bg-green-100 dark:bg-green-800',
    iconText: 'text-green-500 dark:text-green-300',
    messageText: 'text-green-800 dark:text-green-200',
    closeButton: 'text-green-500 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800',
    closeFocusRing: 'focus:ring-green-600 dark:focus:ring-offset-slate-800',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50',
    iconBg: 'bg-blue-100 dark:bg-blue-800',
    iconText: 'text-blue-500 dark:text-blue-300',
    messageText: 'text-blue-800 dark:text-blue-200',
    closeButton: 'text-blue-500 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800',
    closeFocusRing: 'focus:ring-blue-600 dark:focus:ring-offset-slate-800',
  },
};

const renderIcon = (type: NotificationType, className: string) => {
    switch (type) {
        case 'info':
            return <InformationCircleIcon className={className} aria-hidden="true" />;
        case 'success':
            return <CheckCircleIcon className={className} aria-hidden="true" />;
        case 'warning':
        default:
            return <WarningIcon className={className} aria-hidden="true" />;
    }
};

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const styles = notificationStyles[type];

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm w-full">
      <div className={`rounded-lg shadow-lg p-4 ${styles.bg}`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 p-2 rounded-full ${styles.iconBg}`}>
            {renderIcon(type, `w-6 h-6 ${styles.iconText}`)}
          </div>
          <div className="ml-3 w-0 flex-1 pt-1">
            <p className={`text-sm font-medium ${styles.messageText}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.closeButton} ${styles.closeFocusRing}`}
            >
              <span className="sr-only">Close</span>
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
