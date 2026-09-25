'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Organization, User, Lead, Contact, Account, Deal, Task, 
  CallLog, Meeting, Product, Quote, Invoice, Payment, CustomField, AuditLog 
} from '../types/crm';
import { 
  initialOrganization, initialUsers, initialLeads, initialAccounts, 
  initialContacts, initialDeals, initialTasks, initialCalls, 
  initialMeetings, initialProducts, initialQuotes, initialInvoices, 
  initialPayments, initialCustomFields, initialAuditLogs 
} from '../lib/initialData';
import { api } from '../lib/api';

interface CRMContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  showQuickCreate: boolean;
  setShowQuickCreate: (show: boolean) => void;

  organization: Organization;
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;

  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'organization_id' | 'created_date' | 'updated_date'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLead: (leadId: string, options: { createDeal: boolean; dealValue?: number; dealTitle?: string }) => void;

  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'organization_id' | 'created_date'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;

  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'organization_id' | 'created_date'>) => void;

  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'organization_id' | 'created_date'>) => void;
  updateDealStage: (dealId: string, newStage: Deal['stage'], lostReason?: string) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;

  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'organization_id' | 'created_date'>) => void;
  toggleTaskStatus: (taskId: string) => void;

  calls: CallLog[];
  addCall: (call: Omit<CallLog, 'id' | 'organization_id'>) => void;

  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'organization_id'>) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'organization_id'>) => void;

  quotes: Quote[];
  addQuote: (quote: Omit<Quote, 'id' | 'organization_id' | 'created_date'>) => void;

  invoices: Invoice[];
  addPayment: (invoiceId: string, amount: number, method: Payment['method'], notes: string) => void;
  payments: Payment[];

  customFields: CustomField[];
  addCustomField: (field: Omit<CustomField, 'id' | 'organization_id'>) => void;

  auditLogs: AuditLog[];
  logAction: (action: string, entity_type: string, entity_id: string, previous_value: string, new_value: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;

  refreshData: () => Promise<void>;
  isSyncing: boolean;
  reportsData: any;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const [organization] = useState<Organization>(initialOrganization);
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [calls, setCalls] = useState<CallLog[]>(initialCalls);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [customFields, setCustomFields] = useState<CustomField[]>(initialCustomFields);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModule, setActiveModule] = useState<string>('dashboard');

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [reportsData, setReportsData] = useState<any>(null);

  const syncDataWithBackend = async () => {
    setIsSyncing(true);
    try {
      const [
        apiLeads, apiContacts, apiAccounts, apiDeals, 
        apiTasks, apiInvoices, apiProducts, apiCustomFields,
        apiReports
      ] = await Promise.all([
        api.getLeads(),
        api.getContacts(),
        api.getAccounts(),
        api.getDeals(),
        api.getTasks(),
        api.getInvoices(),
        api.getProducts(),
        api.getCustomFields(),
        api.getDashboardReports(),
      ]);

      if (apiLeads && Array.isArray(apiLeads) && apiLeads.length > 0) setLeads(apiLeads);
      if (apiContacts && Array.isArray(apiContacts) && apiContacts.length > 0) setContacts(apiContacts);
      if (apiAccounts && Array.isArray(apiAccounts) && apiAccounts.length > 0) setAccounts(apiAccounts);
      if (apiDeals && Array.isArray(apiDeals) && apiDeals.length > 0) setDeals(apiDeals);
      if (apiTasks && Array.isArray(apiTasks) && apiTasks.length > 0) setTasks(apiTasks);
      if (apiInvoices && Array.isArray(apiInvoices) && apiInvoices.length > 0) setInvoices(apiInvoices);
      if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) setProducts(apiProducts);
      if (apiCustomFields && Array.isArray(apiCustomFields) && apiCustomFields.length > 0) setCustomFields(apiCustomFields);
      if (apiReports) setReportsData(apiReports);
    } catch (err) {
      console.warn('Backend API sync notice: Using state', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncDataWithBackend();
  }, []);

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const logAction = (action: string, entity_type: string, entity_id: string, previous_value: string, new_value: string) => {
    const newLog: AuditLog = {
      id: `LOG${Date.now()}`,
      organization_id: organization.id,
      user_name: currentUser.name,
      action,
      entity_type,
      entity_id,
      previous_value,
      new_value,
      timestamp: new Date().toLocaleString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'organization_id' | 'created_date' | 'updated_date'>) => {
    const id = `LED${String(leads.length + 1).padStart(3, '0')}`;
    const dateStr = new Date().toISOString().split('T')[0];
    const newLead: Lead = {
      ...leadData,
      id,
      organization_id: organization.id,
      created_date: dateStr,
      updated_date: dateStr
    };
    setLeads(prev => [newLead, ...prev]);
    logAction('Created Lead', 'Lead', id, '', leadData.company || (leadData as any).name || 'New Lead');

    // Send Real REST API request to NestJS backend
    api.createLead({
      name: (leadData as any).name || leadData.company,
      company: leadData.company,
      email: leadData.email,
      phone: leadData.phone,
      status: leadData.status || 'New',
      source: leadData.source || 'Website',
      assigned_to: (leadData as any).assigned_to || 'Sales Manager',
      expected_value: leadData.expected_value || 0,
      notes: leadData.notes || '',
    });
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const updated = { ...l, ...updates, updated_date: new Date().toISOString().split('T')[0] };
        logAction('Updated Lead', 'Lead', id, JSON.stringify(l), JSON.stringify(updated));
        return updated;
      }
      return l;
    }));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    logAction('Deleted Lead', 'Lead', id, 'Existing', 'Deleted');
  };

  const convertLead = (leadId: string, options: { createDeal: boolean; dealValue?: number; dealTitle?: string }) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    let targetAccount = accounts.find(a => a.name.toLowerCase() === lead.company.toLowerCase());
    let accountId = targetAccount ? targetAccount.id : `ACC${String(accounts.length + 1).padStart(3, '0')}`;

    if (!targetAccount) {
      targetAccount = {
        id: accountId,
        organization_id: organization.id,
        name: lead.company || `${lead.first_name} ${lead.last_name}`,
        industry: lead.industry || 'General',
        phone: lead.phone,
        email: lead.email,
        website: lead.website || '',
        annual_revenue: lead.expected_value || 0,
        employee_count: 10,
        owner_id: lead.owner_id,
        owner_name: lead.owner_name,
        created_date: new Date().toISOString().split('T')[0]
      };
      setAccounts(prev => [...prev, targetAccount!]);
    }

    const contactId = `CON${String(contacts.length + 1).padStart(3, '0')}`;
    const newContact: Contact = {
      id: contactId,
      organization_id: organization.id,
      name: `${lead.first_name} ${lead.last_name}`,
      phone: lead.phone,
      email: lead.email,
      account_id: accountId,
      account_name: targetAccount.name,
      job_title: 'Decision Maker',
      address: lead.location,
      owner_id: lead.owner_id,
      owner_name: lead.owner_name,
      tags: lead.tags,
      notes: lead.notes,
      created_date: new Date().toISOString().split('T')[0]
    };
    setContacts(prev => [...prev, newContact]);

    if (options.createDeal) {
      const dealId = `DL${String(deals.length + 1).padStart(3, '0')}`;
      const newDeal: Deal = {
        id: dealId,
        organization_id: organization.id,
        title: options.dealTitle || `${targetAccount.name} Deal`,
        account_id: accountId,
        account_name: targetAccount.name,
        contact_id: contactId,
        contact_name: newContact.name,
        value: options.dealValue || lead.expected_value || 50000,
        stage: 'New',
        expected_close: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        owner_id: lead.owner_id,
        owner_name: lead.owner_name,
        next_followup_date: lead.next_followup_date,
        created_date: new Date().toISOString().split('T')[0]
      };
      setDeals(prev => [...prev, newDeal]);
    }

    updateLead(leadId, { status: 'Converted' });
    logAction('Converted Lead to Contact/Account/Deal', 'Lead', leadId, 'Unconverted', `Account: ${targetAccount.name}`);
  };

  const addContact = (data: Omit<Contact, 'id' | 'organization_id' | 'created_date'>) => {
    const id = `CON${String(contacts.length + 1).padStart(3, '0')}`;
    const newContact: Contact = {
      ...data,
      id,
      organization_id: organization.id,
      created_date: new Date().toISOString().split('T')[0]
    };
    setContacts(prev => [newContact, ...prev]);
    logAction('Created Contact', 'Contact', id, '', data.name);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addAccount = (data: Omit<Account, 'id' | 'organization_id' | 'created_date'>) => {
    const id = `ACC${String(accounts.length + 1).padStart(3, '0')}`;
    const newAccount: Account = {
      ...data,
      id,
      organization_id: organization.id,
      created_date: new Date().toISOString().split('T')[0]
    };
    setAccounts(prev => [newAccount, ...prev]);
    logAction('Created Account', 'Account', id, '', data.name);
  };

  const addDeal = (data: Omit<Deal, 'id' | 'organization_id' | 'created_date'>) => {
    const id = `DL${String(deals.length + 1).padStart(3, '0')}`;
    const newDeal: Deal = {
      ...data,
      id,
      organization_id: organization.id,
      created_date: new Date().toISOString().split('T')[0]
    };
    setDeals(prev => [newDeal, ...prev]);
    logAction('Created Deal', 'Deal', id, '', data.title);
  };

  const updateDealStage = (dealId: string, newStage: Deal['stage'], lostReason?: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        logAction('Changed Deal Stage', 'Deal', dealId, d.stage, newStage);
        let prob = d.probability;
        if (newStage === 'Closed Won') prob = 100;
        else if (newStage === 'Closed Lost') prob = 0;
        else if (newStage === 'Qualification') prob = 20;
        else if (newStage === 'Value Proposition') prob = 40;
        else if (newStage === 'Proposal Sent') prob = 60;
        else if (newStage === 'Negotiation') prob = 80;

        return {
          ...d,
          stage: newStage,
          probability: prob,
          lost_reason: newStage === 'Closed Lost' ? (lostReason || d.lost_reason) : undefined,
        };
      }
      return d;
    }));
    // Sync with NestJS REST API
    api.updateDealStage(dealId, newStage, lostReason);
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const addTask = (data: Omit<Task, 'id' | 'organization_id' | 'created_date'>) => {
    const id = `TSK${String(tasks.length + 1).padStart(3, '0')}`;
    const newTask: Task = {
      ...data,
      id,
      organization_id: organization.id,
      created_date: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    // Sync with NestJS REST API
    api.toggleTaskStatus(taskId);
  };

  const addCall = (data: Omit<CallLog, 'id' | 'organization_id'>) => {
    const id = `CAL${String(calls.length + 1).padStart(3, '0')}`;
    setCalls(prev => [{ ...data, id, organization_id: organization.id }, ...prev]);
  };

  const addMeeting = (data: Omit<Meeting, 'id' | 'organization_id'>) => {
    const id = `MTG${String(meetings.length + 1).padStart(3, '0')}`;
    setMeetings(prev => [{ ...data, id, organization_id: organization.id }, ...prev]);
  };

  const addProduct = (data: Omit<Product, 'id' | 'organization_id'>) => {
    const id = `PRD${String(products.length + 1).padStart(3, '0')}`;
    setProducts(prev => [{ ...data, id, organization_id: organization.id }, ...prev]);
  };

  const addQuote = (data: Omit<Quote, 'id' | 'organization_id' | 'created_date'>) => {
    const id = `QTE${String(quotes.length + 1001)}`;
    const newQuote: Quote = {
      ...data,
      id,
      organization_id: organization.id,
      created_date: new Date().toISOString().split('T')[0]
    };
    setQuotes(prev => [newQuote, ...prev]);
  };

  const addPayment = (invoiceId: string, amount: number, method: Payment['method'], notes: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const newPaid = inv.paid_amount + amount;
    const newDue = Math.max(0, inv.total_amount - newPaid);
    const newStatus = newDue === 0 ? 'Paid' : 'Partially Paid';

    setInvoices(prev => prev.map(i => i.id === invoiceId ? {
      ...i,
      paid_amount: newPaid,
      due_amount: newDue,
      status: newStatus
    } : i));

    const newPay: Payment = {
      id: `PAY${String(payments.length + 1).padStart(3, '0')}`,
      organization_id: organization.id,
      invoice_number: inv.invoice_number,
      amount,
      method,
      transaction_date: new Date().toLocaleString(),
      notes
    };
    setPayments(prev => [newPay, ...prev]);
    logAction('Recorded Payment', 'Invoice', invoiceId, `Paid: ₹${inv.paid_amount}`, `Paid: ₹${newPaid}`);

    // Sync with NestJS REST API
    api.recordPayment({ invoiceId, amount, method, notes });
  };

  const addCustomField = (data: Omit<CustomField, 'id' | 'organization_id'>) => {
    const id = `CF${String(customFields.length + 1).padStart(3, '0')}`;
    setCustomFields(prev => [...prev, { ...data, id, organization_id: organization.id }]);

    // Sync with NestJS REST API
    api.addCustomField(data);
  };

  return (
    <CRMContext.Provider value={{
      theme, setTheme, toggleTheme,
      showQuickCreate, setShowQuickCreate,
      organization, users, currentUser, setCurrentUser,
      leads, addLead, updateLead, deleteLead, convertLead,
      contacts, addContact, updateContact,
      accounts, addAccount,
      deals, addDeal, updateDealStage, updateDeal,
      tasks, addTask, toggleTaskStatus,
      calls, addCall,
      meetings, addMeeting,
      products, addProduct,
      quotes, addQuote,
      invoices, addPayment, payments,
      customFields, addCustomField,
      auditLogs, logAction,
      searchQuery, setSearchQuery,
      activeModule, setActiveModule,
      refreshData: syncDataWithBackend,
      isSyncing,
      reportsData
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
