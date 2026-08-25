class ContractService {
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
