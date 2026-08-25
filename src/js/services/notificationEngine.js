class NotificationEngine {
  constructor() {
    this.notifications = [];
  }

  checkPayments(payments) {
    const now = new Date();
    // Limpiar hora para comparar solo fechas
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    this.notifications = [];

    payments.filter(p => p.status === 'pendiente' || p.status === 'atrasado').forEach(payment => {
      const dueDate = new Date(payment.dueDate);
      // Ajustar timezone local si es necesario para evitar desfases
      const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 1);
      
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let type, priority, message;

      if (diffDays < 0) {
        type = 'overdue';
        priority = 'high';
        message = `El pago está vencido hace ${Math.abs(diffDays)} días.`;
      } else if (diffDays <= 3) {
        type = 'due_soon';
        priority = 'medium';
        message = diffDays === 0 ? 'El pago vence HOY.' : `El pago vence en ${diffDays} días.`;
      } else if (diffDays <= 7) {
        type = 'upcoming';
        priority = 'low';
        message = `El pago vence la próxima semana (${diffDays} días).`;
      }

      if (type) {
        this.notifications.push({
          id: `notif-${payment.id}`,
          paymentId: payment.id,
          contractId: payment.contractId,
          type,
          priority,
          message,
          dueDate: payment.dueDate,
          amount: payment.amount
        });
      }
    });

    // Sort: high > medium > low
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    this.notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return this.notifications;
  }

  getNotificationCount() {
    return this.notifications.length;
  }

  getNotifications() {
    return this.notifications;
  }
}

export const notificationEngine = new NotificationEngine();
