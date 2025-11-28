import Notification from '../models/notification';

interface CreateNotificationParams {
  recipient: string;
  sender: string;
  type: 'post_like' | 'post_comment';
  title: string;
  message: string;
  link: string;
  relatedId?: string;
}

export const createNotification = async ({
  recipient,
  sender,
  type,
  title,
  message,
  link,
  relatedId
}: CreateNotificationParams) => {
  try {
    // Don't send notification if user is interacting with their own post
    if (recipient === sender) {
      return;
    }

    // Create notification
    await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      relatedId
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};