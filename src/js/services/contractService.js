class ContractService {
  getPaymentFrequencyLabel(frequency) {
    const labels = {
      unico: 'Único pago',
      diario: 'Diario',
      semanal: 'Semanal',
      quincenal: 'Quincenal',
      mensual: 'Mensual',
      trimestral: 'Trimestral',
      semestral: 'Semestral',
      anual: 'Anual',
      personalizado: 'Personalizado'
    };
    return labels[frequency] || 'Sin calendario';
  }

  generatePaymentSchedule(contract) {
    const frequency = contract.paymentFrequency;
    if (!frequency) return [];

    const isSinglePayment = frequency === 'unico';
    const startDate = isSinglePayment ? (contract.paymentDate || contract.startDate) : contract.startDate;
    const endDate = isSinglePayment ? (contract.paymentDate || contract.endDate || contract.startDate) : contract.endDate;

    if (!startDate || (!isSinglePayment && !endDate)) return [];

    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    const amount = Number(contract.installmentValue || contract.amount || 0);
    const schedule = [];
    let current = start;
    let index = 1;

    while (current <= end && index <= 500) {
      schedule.push({
        id: `${contract.id}-payment-${index}`,
        contractId: contract.id,
        concept: frequency === 'unico' ? 'Pago único' : `Cuota ${index}`,
        amount: index === 1 && frequency !== 'unico' && contract.firstInstallmentValue
          ? Number(contract.firstInstallmentValue)
          : amount,
        dueDate: this.toDateString(current),
        status: 'pendiente',
        paidDate: null,
        notes: ''
      });

      if (frequency === 'unico') break;
      current = this.addFrequency(current, frequency, Number(contract.customDays) || 1, contract.paymentDay);
      index += 1;
    }

    return schedule;
  }

  getNextPayment(payments) {
    return [...payments]
      .filter(payment => payment.status !== 'pagado')
      .sort((a, b) => this.parseDate(a.dueDate) - this.parseDate(b.dueDate))[0] || null;
  }

  parseDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  toDateString(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  addFrequency(date, frequency, customDays, paymentDay) {
    if (frequency === 'diario') return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    if (frequency === 'semanal') return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
    if (frequency === 'quincenal') return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 15);
    if (frequency === 'personalizado') return new Date(date.getFullYear(), date.getMonth(), date.getDate() + customDays);

    const months = { mensual: 1, trimestral: 3, semestral: 6, anual: 12 }[frequency] || 1;
    const targetDay = Number(paymentDay) || date.getDate();
    const nextMonth = date.getMonth() + months;
    const lastDay = new Date(date.getFullYear(), nextMonth + 1, 0).getDate();
    return new Date(date.getFullYear(), nextMonth, Math.min(targetDay, lastDay));
  }

  getContractBalance(contract, payments) {
    const contractPayments = payments.filter(p => p.contractId === contract.id);
    const paidAmount = contractPayments
      .filter(p => p.status === 'pagado')
      .reduce((sum, p) => sum + p.amount, 0);
      
    return contract.amount - paidAmount;
  }

  getContractPaymentProgress(contract, payments) {
    const contractPayments = payments.filter(p => p.contractId === contract.id);
    const total = contract.amount;
    const paid = contractPayments
      .filter(p => p.status === 'pagado')
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = total - paid;
    const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;
    
    return { total, paid, pending, percentage };
  }

  getActiveContracts(contracts) {
    return contracts.filter(c => ['firmado', 'en_ejecucion'].includes(c.status));
  }

  getContractsByStatus(contracts, status) {
    if (!status || status === 'todos') return contracts;
    return contracts.filter(c => c.status === status);
  }

  getContractsByType(contracts, type) {
    if (!type || type === 'todos') return contracts;
    return contracts.filter(c => c.type === type);
  }

  getOverdueContracts(contracts, payments) {
    const overdueContractIds = new Set(
      payments
        .filter(p => p.status === 'atrasado')
        .map(p => p.contractId)
    );
    return contracts.filter(c => overdueContractIds.has(c.id));
  }

  generateContractCode() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LM-${year}-${random}`;
  }
}

export const contractService = new ContractService();
