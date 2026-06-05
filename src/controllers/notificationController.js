const { Notification } = require('../models');

async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        recipientId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.update({ read: true });
    res.json(notification);
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await Notification.update(
      { read: true },
      { where: { recipientId: req.user.id, read: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
}

async function getSettings(req, res) {
  const notificationsEnabled = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  res.json({ notificationsEnabled });
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getSettings,
};