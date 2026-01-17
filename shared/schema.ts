// Re-export MongoDB models as the schema
export * from "./models/mongodb";

// Type aliases for backward compatibility with existing code
export type User = import("./models/mongodb").IUser;
export type InvestorProfile = import("./models/mongodb").IInvestorProfile;
export type AdminUser = import("./models/mongodb").IAdminUser;
export type Portfolio = import("./models/mongodb").IPortfolio;
export type Transaction = import("./models/mongodb").ITransaction;
export type Statement = import("./models/mongodb").IStatement;
export type Announcement = import("./models/mongodb").IAnnouncement;
export type SupportRequest = import("./models/mongodb").ISupportRequest;
export type LeadCapture = import("./models/mongodb").ILeadCapture;
export type PerformanceHistory = import("./models/mongodb").IPerformanceHistory;
export type NavHistory = import("./models/mongodb").INavHistory;
export type ReturnsHistory = import("./models/mongodb").IReturnsHistory;
export type Notification = import("./models/mongodb").INotification;
export type Allocation = import("./models/mongodb").IAllocation;
export type ActivityLog = import("./models/mongodb").IActivityLog;
export type SystemSetting = import("./models/mongodb").ISystemSetting;

// Insert type aliases
export type InsertInvestorProfile = Partial<InvestorProfile>;
export type InsertAdminUser = Partial<AdminUser>;
export type InsertPortfolio = Partial<Portfolio>;
export type InsertTransaction = Partial<Transaction>;
export type InsertStatement = Partial<Statement>;
export type InsertAnnouncement = Partial<Announcement>;
export type InsertSupportRequest = Partial<SupportRequest>;
export type InsertLeadCapture = Partial<LeadCapture>;
export type InsertPerformanceHistory = Partial<PerformanceHistory>;
export type InsertNavHistory = Partial<NavHistory>;
export type InsertReturnsHistory = Partial<ReturnsHistory>;
export type InsertNotification = Partial<Notification>;
export type InsertAllocation = Partial<Allocation>;
export type InsertActivityLog = Partial<ActivityLog>;
export type InsertSystemSetting = Partial<SystemSetting>;
