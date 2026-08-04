import API from "./api";

// Get notifications
export const getNotifications = (userId) => {
  return API.get(`/notifications/${userId}`);
};

// Mark notification as read
export const markAsRead = (notificationId) => {
  return API.put(`/notifications/${notificationId}/read`);
};

// Delete notification
export const deleteNotification = (notificationId) => {
  return API.delete(`/notifications/${notificationId}`);
};