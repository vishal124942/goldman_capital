import "./db"; // Initialize MongoDB connection
import { randomUUID } from "node:crypto";
import {
  User,
  InvestorProfile,
  AdminUser,
  Portfolio,
  Transaction,
  Statement,
  Announcement,
  SupportRequest,
  LeadCapture,
  PerformanceHistory,
  NavHistory,
  ReturnsHistory,
  Notification,
  Allocation,
  ActivityLog,
  SystemSetting,
  type IUser,
  type IInvestorProfile,
  type IAdminUser,
  type IPortfolio,
  type ITransaction,
  type IStatement,
  type IAnnouncement,
  type ISupportRequest,
  type ILeadCapture,
  type IPerformanceHistory,
  type INavHistory,
  type IReturnsHistory,
  type INotification,
  type IAllocation,
  type IActivityLog,
  type ISystemSetting,
  type UpsertUser,
} from "../models/mongodb.js";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByPhone(phone: string): Promise<IUser | null>;
  upsertUser(user: UpsertUser): Promise<IUser>;
  createUser(user: Partial<IUser>): Promise<IUser>;
  updateUser(id: string, user: Partial<IUser>): Promise<IUser | null>;

  // Investor profile methods
  getInvestorProfile(userId: string): Promise<IInvestorProfile | null>;
  getInvestorProfileById(id: string): Promise<IInvestorProfile | null>;
  createInvestorProfile(profile: Partial<IInvestorProfile>): Promise<IInvestorProfile>;
  updateInvestorProfile(id: string, profile: Partial<IInvestorProfile>): Promise<IInvestorProfile | null>;
  deleteInvestorProfile(id: string): Promise<void>;
  getAllInvestors(): Promise<IInvestorProfile[]>;

  // Admin user methods
  getAdminUser(userId: string): Promise<IAdminUser | null>;
  getAdminUserById(id: string): Promise<IAdminUser | null>;
  createAdminUser(admin: Partial<IAdminUser>): Promise<IAdminUser>;
  updateAdminUser(id: string, admin: Partial<IAdminUser>): Promise<IAdminUser | null>;
  deleteAdminUser(id: string): Promise<void>;
  getAllAdminUsers(): Promise<IAdminUser[]>;

  // Portfolio methods
  getPortfolio(investorId: string): Promise<IPortfolio | null>;
  getPortfoliosByInvestorId(investorId: string): Promise<IPortfolio[]>;
  createPortfolio(portfolio: Partial<IPortfolio>): Promise<IPortfolio>;
  updatePortfolio(id: string, portfolio: Partial<IPortfolio>): Promise<IPortfolio | null>;

  // Transaction methods
  getTransactions(investorId: string): Promise<ITransaction[]>;
  getAllTransactions(): Promise<ITransaction[]>;
  getTransactionById(id: string): Promise<ITransaction | null>;
  createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction>;
  updateTransaction(id: string, transaction: Partial<ITransaction>): Promise<ITransaction | null>;

  // Statement methods
  getStatements(investorId: string): Promise<IStatement[]>;
  getAllStatements(): Promise<IStatement[]>;
  getStatementById(id: string): Promise<IStatement | null>;
  createStatement(statement: Partial<IStatement>): Promise<IStatement>;
  deleteStatement(id: string): Promise<void>;
  updateStatement(id: string, statement: Partial<IStatement>): Promise<IStatement | null>;

  // Announcement methods
  getActiveAnnouncements(): Promise<IAnnouncement[]>;
  getAllAnnouncements(): Promise<IAnnouncement[]>;
  getAnnouncementById(id: string): Promise<IAnnouncement | null>;
  createAnnouncement(announcement: Partial<IAnnouncement>): Promise<IAnnouncement>;
  updateAnnouncement(id: string, announcement: Partial<IAnnouncement>): Promise<IAnnouncement | null>;
  deleteAnnouncement(id: string): Promise<void>;
  markAnnouncementAsRead(announcementId: string, investorId: string): Promise<void>;
  getUnreadAnnouncementCount(investorId: string): Promise<number>;

  // Support request methods
  getSupportRequests(investorId: string): Promise<ISupportRequest[]>;
  getAllSupportRequests(): Promise<ISupportRequest[]>;
  getSupportRequestById(id: string): Promise<ISupportRequest | null>;
  createSupportRequest(request: Partial<ISupportRequest>): Promise<ISupportRequest>;
  updateSupportRequest(id: string, request: Partial<ISupportRequest>): Promise<ISupportRequest | null>;

  // Lead capture methods
  createLeadCapture(lead: Partial<ILeadCapture>): Promise<ILeadCapture>;
  getAllLeads(): Promise<ILeadCapture[]>;
  updateLeadStatus(id: string, status: string): Promise<ILeadCapture | null>;

  // Performance history methods
  getPerformanceHistory(portfolioId: string): Promise<IPerformanceHistory[]>;
  createPerformanceHistory(history: Partial<IPerformanceHistory>): Promise<IPerformanceHistory>;

  // NAV history methods
  getNavHistory(): Promise<INavHistory[]>;
  createNavHistory(nav: Partial<INavHistory>): Promise<INavHistory>;
  getLatestNav(): Promise<INavHistory | null>;

  // Returns history methods
  getReturnsHistory(): Promise<IReturnsHistory[]>;
  createReturnsHistory(returns: Partial<IReturnsHistory>): Promise<IReturnsHistory>;
  updateReturnsHistory(id: string, returns: Partial<IReturnsHistory>): Promise<IReturnsHistory | null>;

  // Notification methods
  getNotifications(investorId: string): Promise<INotification[]>;
  createNotification(notification: Partial<INotification>): Promise<INotification>;
  markNotificationRead(id: string): Promise<void>;

  // Allocation methods
  getAllocations(portfolioId: string): Promise<IAllocation[]>;
  createAllocation(allocation: Partial<IAllocation>): Promise<IAllocation>;
  updateAllocation(id: string, allocation: Partial<IAllocation>): Promise<IAllocation | null>;
  deleteAllocation(id: string): Promise<void>;

  // Activity log methods
  createActivityLog(log: Partial<IActivityLog>): Promise<IActivityLog>;
  getActivityLogs(limit?: number): Promise<IActivityLog[]>;

  // System settings methods
  getSystemSettingByKey(key: string): Promise<ISystemSetting | null>;
  upsertSystemSetting(setting: Partial<ISystemSetting>): Promise<ISystemSetting>;
}

class MongoStorage implements IStorage {
  // ==================== USER METHODS ====================

  async getUser(id: string): Promise<IUser | null> {
    return User.findById(id).lean();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).lean();
  }

  async getUserByPhone(phone: string): Promise<IUser | null> {
    return User.findOne({ phone }).lean();
  }

  async upsertUser(user: UpsertUser): Promise<IUser> {
    const id = user.id || randomUUID();
    const result = await User.findByIdAndUpdate(
      id,
      { $set: { ...user, _id: id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return result!;
  }

  async createUser(user: Partial<IUser>): Promise<IUser> {
    const id = randomUUID();
    return User.create({ ...user, _id: id });
  }

  async updateUser(id: string, user: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: user }, { new: true }).lean();
  }

  // ==================== INVESTOR PROFILE METHODS ====================

  async getInvestorProfile(userId: string): Promise<IInvestorProfile | null> {
    // First try to find by userId (for logged-in user context)
    let profile = await InvestorProfile.findOne({ userId }).lean();
    // Fallback to finding by _id (for direct investor ID lookups)
    if (!profile) {
      profile = await InvestorProfile.findById(userId).lean();
    }
    return profile ? { ...profile, id: profile._id } as any : null;
  }

  async getInvestorProfileById(id: string): Promise<IInvestorProfile | null> {
    const profile = await InvestorProfile.findById(id).lean();
    return profile ? { ...profile, id: profile._id } as any : null;
  }

  async createInvestorProfile(profile: Partial<IInvestorProfile>): Promise<IInvestorProfile> {
    const id = randomUUID();
    const result = await InvestorProfile.create({ ...profile, _id: id });
    return { ...result.toObject(), id: result._id } as any;
  }

  async updateInvestorProfile(id: string, profile: Partial<IInvestorProfile>): Promise<IInvestorProfile | null> {
    return InvestorProfile.findByIdAndUpdate(id, { $set: profile }, { new: true }).lean();
  }

  async deleteInvestorProfile(id: string): Promise<void> {
    await InvestorProfile.findByIdAndDelete(id);
  }

  async getAllInvestors(): Promise<IInvestorProfile[]> {
    const profiles = await InvestorProfile.find().sort({ createdAt: -1 }).lean();
    return profiles.map(p => ({ ...p, id: p._id })) as any;
  }

  // ==================== ADMIN USER METHODS ====================

  async getAdminUser(userId: string): Promise<IAdminUser | null> {
    return AdminUser.findOne({ userId }).lean();
  }

  async getAdminUserById(id: string): Promise<IAdminUser | null> {
    return AdminUser.findById(id).lean();
  }

  async createAdminUser(admin: Partial<IAdminUser>): Promise<IAdminUser> {
    const id = randomUUID();
    return AdminUser.create({ ...admin, _id: id });
  }

  async updateAdminUser(id: string, admin: Partial<IAdminUser>): Promise<IAdminUser | null> {
    return AdminUser.findByIdAndUpdate(id, { $set: admin }, { new: true }).lean();
  }

  async deleteAdminUser(id: string): Promise<void> {
    const admin = await AdminUser.findById(id);
    if (admin && admin.userId) {
      await User.findByIdAndDelete(admin.userId);
    }
    await AdminUser.findByIdAndDelete(id);
  }

  async getAllAdminUsers(): Promise<IAdminUser[]> {
    return AdminUser.find().sort({ createdAt: -1 }).lean();
  }

  // ==================== PORTFOLIO METHODS ====================

  async getPortfolio(investorId: string): Promise<IPortfolio | null> {
    return Portfolio.findOne({ investorId }).lean();
  }

  async getPortfoliosByInvestorId(investorId: string): Promise<IPortfolio[]> {
    return Portfolio.find({ investorId }).lean();
  }

  async createPortfolio(portfolio: Partial<IPortfolio>): Promise<IPortfolio> {
    const id = randomUUID();
    return Portfolio.create({ ...portfolio, _id: id });
  }

  async updatePortfolio(id: string, portfolio: Partial<IPortfolio>): Promise<IPortfolio | null> {
    return Portfolio.findByIdAndUpdate(id, { $set: portfolio }, { new: true }).lean();
  }

  // ==================== TRANSACTION METHODS ====================

  async getTransactions(investorId: string): Promise<ITransaction[]> {
    return Transaction.find({ investorId }).sort({ createdAt: -1 }).lean();
  }

  async getAllTransactions(): Promise<ITransaction[]> {
    return Transaction.find().sort({ createdAt: -1 }).lean();
  }

  async getTransactionById(id: string): Promise<ITransaction | null> {
    return Transaction.findById(id).lean();
  }

  async createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction> {
    const id = randomUUID();
    return Transaction.create({ ...transaction, _id: id });
  }

  async updateTransaction(id: string, transaction: Partial<ITransaction>): Promise<ITransaction | null> {
    return Transaction.findByIdAndUpdate(id, { $set: transaction }, { new: true }).lean();
  }

  // ==================== STATEMENT METHODS ====================

  async getStatements(investorId: string): Promise<IStatement[]> {
    const docs = await Statement.find({ investorId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => ({ ...d, id: d._id })) as unknown as IStatement[];
  }

  async getAllStatements(): Promise<IStatement[]> {
    const docs = await Statement.find().sort({ createdAt: -1 }).lean();
    return docs.map(d => ({ ...d, id: d._id })) as unknown as IStatement[];
  }

  async getStatementById(id: string): Promise<IStatement | null> {
    return Statement.findById(id);
  }

  async createStatement(statement: Partial<IStatement>): Promise<IStatement> {
    const id = randomUUID();
    return Statement.create({ ...statement, _id: id });
  }

  async deleteStatement(id: string): Promise<void> {
    await Statement.findByIdAndDelete(id);
  }

  async updateStatement(id: string, statement: Partial<IStatement>): Promise<IStatement | null> {
    return Statement.findByIdAndUpdate(id, { $set: statement }, { new: true }).lean();
  }

  // ==================== ANNOUNCEMENT METHODS ====================

  async getActiveAnnouncements(): Promise<IAnnouncement[]> {
    const now = new Date();
    return Announcement.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    }).sort({ createdAt: -1 }).lean();
  }

  async getAllAnnouncements(): Promise<IAnnouncement[]> {
    return Announcement.find().sort({ createdAt: -1 }).lean();
  }

  async getAnnouncementById(id: string): Promise<IAnnouncement | null> {
    return Announcement.findById(id).lean();
  }

  async createAnnouncement(announcement: Partial<IAnnouncement>): Promise<IAnnouncement> {
    const id = randomUUID();
    return Announcement.create({ ...announcement, _id: id });
  }

  async updateAnnouncement(id: string, announcement: Partial<IAnnouncement>): Promise<IAnnouncement | null> {
    return Announcement.findByIdAndUpdate(id, { $set: announcement }, { new: true }).lean();
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await Announcement.findByIdAndDelete(id);
  }

  async markAnnouncementAsRead(announcementId: string, investorId: string): Promise<void> {
    await Announcement.findByIdAndUpdate(
      announcementId,
      { $addToSet: { readBy: investorId } }, // Add investorId to readBy array if not already present
      { new: true }
    );
  }

  async getUnreadAnnouncementCount(investorId: string): Promise<number> {
    const now = new Date();
    return Announcement.countDocuments({
      isActive: true,
      readBy: { $ne: investorId }, // Not in readBy array
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    });
  }

  // ==================== SUPPORT REQUEST METHODS ====================

  async getSupportRequests(investorId: string): Promise<ISupportRequest[]> {
    return SupportRequest.find({ investorId }).sort({ createdAt: -1 }).lean();
  }

  async getAllSupportRequests(): Promise<ISupportRequest[]> {
    return SupportRequest.find().sort({ createdAt: -1 }).lean();
  }

  async getSupportRequestById(id: string): Promise<ISupportRequest | null> {
    return SupportRequest.findById(id).lean();
  }

  async createSupportRequest(request: Partial<ISupportRequest>): Promise<ISupportRequest> {
    const id = randomUUID();
    return SupportRequest.create({ ...request, _id: id });
  }

  async updateSupportRequest(id: string, request: Partial<ISupportRequest>): Promise<ISupportRequest | null> {
    return SupportRequest.findByIdAndUpdate(id, { $set: request }, { new: true }).lean();
  }

  // ==================== LEAD CAPTURE METHODS ====================

  async createLeadCapture(lead: Partial<ILeadCapture>): Promise<ILeadCapture> {
    const id = randomUUID();
    return LeadCapture.create({ ...lead, _id: id });
  }

  async getAllLeads(): Promise<ILeadCapture[]> {
    return LeadCapture.find().sort({ createdAt: -1 }).lean();
  }

  async updateLeadStatus(id: string, status: string): Promise<ILeadCapture | null> {
    return LeadCapture.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
  }

  // ==================== PERFORMANCE HISTORY METHODS ====================

  async getPerformanceHistory(portfolioId: string): Promise<IPerformanceHistory[]> {
    return PerformanceHistory.find({ portfolioId }).sort({ date: -1 }).lean();
  }

  async createPerformanceHistory(history: Partial<IPerformanceHistory>): Promise<IPerformanceHistory> {
    const id = randomUUID();
    return PerformanceHistory.create({ ...history, _id: id });
  }

  // ==================== NAV HISTORY METHODS ====================

  async getNavHistory(): Promise<INavHistory[]> {
    return NavHistory.find().sort({ date: -1 }).lean();
  }

  async createNavHistory(nav: Partial<INavHistory>): Promise<INavHistory> {
    const id = randomUUID();
    return NavHistory.create({ ...nav, _id: id });
  }

  async getLatestNav(): Promise<INavHistory | null> {
    return NavHistory.findOne().sort({ date: -1 }).lean();
  }

  async updateNavHistory(id: string, nav: Partial<INavHistory>): Promise<INavHistory | null> {
    return NavHistory.findByIdAndUpdate(id, { $set: nav }, { new: true }).lean();
  }

  // ==================== RETURNS HISTORY METHODS ====================

  async getReturnsHistory(): Promise<IReturnsHistory[]> {
    return ReturnsHistory.find().sort({ year: -1, quarter: -1, month: -1 }).lean();
  }

  async createReturnsHistory(returns: Partial<IReturnsHistory>): Promise<IReturnsHistory> {
    const id = randomUUID();
    return ReturnsHistory.create({ ...returns, _id: id });
  }

  async updateReturnsHistory(id: string, returns: Partial<IReturnsHistory>): Promise<IReturnsHistory | null> {
    return ReturnsHistory.findByIdAndUpdate(id, { $set: returns }, { new: true }).lean();
  }

  // ==================== NOTIFICATION METHODS ====================

  async getNotifications(investorId: string): Promise<INotification[]> {
    return Notification.find({ investorId }).sort({ createdAt: -1 }).lean();
  }

  async createNotification(notification: Partial<INotification>): Promise<INotification> {
    const id = randomUUID();
    return Notification.create({ ...notification, _id: id });
  }

  async markNotificationRead(id: string): Promise<void> {
    await Notification.findByIdAndUpdate(id, { $set: { isRead: true } });
  }

  // ==================== ALLOCATION METHODS ====================

  async getAllocations(portfolioId: string): Promise<IAllocation[]> {
    return Allocation.find({ portfolioId }).lean();
  }

  async createAllocation(allocation: Partial<IAllocation>): Promise<IAllocation> {
    const id = randomUUID();
    return Allocation.create({ ...allocation, _id: id });
  }

  async updateAllocation(id: string, allocation: Partial<IAllocation>): Promise<IAllocation | null> {
    return Allocation.findByIdAndUpdate(id, { $set: allocation }, { new: true }).lean();
  }

  async deleteAllocation(id: string): Promise<void> {
    await Allocation.findByIdAndDelete(id);
  }

  // ==================== ACTIVITY LOG METHODS ====================

  async createActivityLog(log: Partial<IActivityLog>): Promise<IActivityLog> {
    const id = randomUUID();
    return ActivityLog.create({ ...log, _id: id });
  }

  async getActivityLogs(limit: number = 100): Promise<IActivityLog[]> {
    return ActivityLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  }

  // ==================== SYSTEM SETTINGS METHODS ====================

  async getSystemSettings(): Promise<ISystemSetting[]> {
    return SystemSetting.find().sort({ category: 1, key: 1 }).lean();
  }

  async getSystemSettingByKey(key: string): Promise<ISystemSetting | null> {
    return SystemSetting.findOne({ key }).lean();
  }

  async upsertSystemSetting(setting: Partial<ISystemSetting>): Promise<ISystemSetting> {
    const id = setting.key ? (await SystemSetting.findOne({ key: setting.key }))?._id || randomUUID() : randomUUID();
    const result = await SystemSetting.findByIdAndUpdate(
      id,
      { $set: { ...setting, _id: id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return result!;
  }
  async getOpenSupportRequestsCount(): Promise<number> {
    return SupportRequest.countDocuments({ status: "open" });
  }

  async getActiveAdminAnnouncementsCount(): Promise<number> {
    const now = new Date();
    return Announcement.countDocuments({
      targetAudience: "admin",
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    });
  }

  async getUnreadInvestorNotificationsCount(investorId: string): Promise<number> {
    return Notification.countDocuments({ investorId, isRead: false });
  }
}

export const storage = new MongoStorage();
