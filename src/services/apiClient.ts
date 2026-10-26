/**
 * Authoritative Backend Financial & Admin API Client
 * Communicates with server.ts endpoints to ensure strict server-side Master Admin
 * authorization, atomic ledger credits/debits, and duplicate protection.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  code?: string;
  data?: T;
  [key: string]: unknown;
}

export class FinancialApiClient {
  private baseUrl = '';

  constructor() {
    if (typeof window !== 'undefined') {
      const isMobileNative =
        Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })?.Capacitor?.isNativePlatform?.()) ||
        window.location.protocol === 'capacitor:' ||
        (window.location.hostname === 'localhost' && !window.location.port);
      if (isMobileNative) {
        this.baseUrl = 'https://ais-dev-pmwrs5h3t3yeonukogyqv6-957762447213.asia-southeast1.run.app';
      }
    }
  }

  private getAuthHeaders(masterToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token =
      masterToken ||
      sessionStorage.getItem('bingo777_master_admin_token') ||
      localStorage.getItem('bingo777_master_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-master-admin-key'] = token;
    }
    return headers;
  }

  // 0. Permanent User Registration, Login & Sync (Backend Disk Persistence)
  public async registerUser(payload: {
    user?: unknown;
    phone: string;
    username: string;
    password?: string;
    referralCode?: string;
    referredBy?: string;
    uid?: string;
    device?: unknown;
  }): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error registering user' };
    }
  }

  public async loginUser(phone: string, password?: string, device?: unknown): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, device })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error logging in user' };
    }
  }

  public async syncUsers(users: Record<string, unknown>, transactions?: unknown[]): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/sync-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users, transactions })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error syncing users' };
    }
  }

  // 1. Verify Master Admin Authentication
  public async verifyMasterAdmin(token: string): Promise<ApiResponse<{ actor: string; permissions: string[] }>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/master-admin-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-master-admin-key': token
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('bingo777_master_admin_token', token);
      }
      return data;
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error communicating with auth server' };
    }
  }

  // 2. Authoritative Deposit Approval (Master Admin Only)
  public async approveDeposit(
    depositId: string,
    adminId: string,
    masterToken?: string,
    depositRecord?: unknown,
    customInrAmount?: number
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/financials/deposit/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ depositId, adminId, masterAdminToken: masterToken, depositRecord, customInrAmount })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure approving deposit' };
    }
  }

  // 3. Authoritative Deposit Rejection (Master Admin Only)
  public async rejectDeposit(
    depositId: string,
    adminId: string,
    reason: string,
    masterToken?: string,
    depositRecord?: unknown
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/financials/deposit/reject`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ depositId, adminId, reason, masterAdminToken: masterToken, depositRecord })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure rejecting deposit' };
    }
  }

  // 4. Authoritative Withdrawal Settlement (Master Admin Only)
  public async approveWithdrawal(
    withdrawalId: string,
    adminId: string,
    masterToken?: string,
    withdrawalRecord?: unknown
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/financials/withdrawal/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ withdrawalId, adminId, masterAdminToken: masterToken, withdrawalRecord })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure approving withdrawal' };
    }
  }

  // 5. Authoritative Withdrawal Rejection & Safe Ledger Refund (Master Admin Only)
  public async rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
    reason: string,
    masterToken?: string,
    withdrawalRecord?: unknown
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/financials/withdrawal/reject`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ withdrawalId, adminId, reason, masterAdminToken: masterToken, withdrawalRecord })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure rejecting withdrawal' };
    }
  }

  // 6. User Deposit Request (Never adds balance directly)
  public async requestDeposit(
    uid: string,
    amount: number,
    paymentMethod: string,
    referenceId: string,
    username?: string,
    phone?: string,
    usdtAmount?: number
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/user/deposit/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, amount, paymentMethod, referenceId, username, phone, usdtAmount })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure requesting deposit' };
    }
  }

  // 7. User Withdrawal Request (Atomically reserves balance)
  public async requestWithdrawal(
    uid: string,
    amount: number,
    payoutMethod: string,
    accountDetails: Record<string, unknown>,
    username?: string,
    phone?: string,
    usdtAmount?: number
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/user/withdrawal/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, amount, payoutMethod, accountDetails, username, phone, usdtAmount })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure requesting withdrawal' };
    }
  }

  // 8. Server-Side Reconciliation Check & Correction
  public async reconcile(
    uid?: string,
    forceReconcile?: boolean,
    adminId?: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/financials/reconcile`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ uid, forceReconcile, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure during reconciliation' };
    }
  }

  // 9. Server-Side User Deletion (Master Admin Only)
  public async deleteUser(
    uid: string,
    adminId: string,
    reason: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/user/delete`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ uid, adminId, reason, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure deleting user' };
    }
  }

  // 10. Server-Side Balance Adjustment (Master Admin Only)
  public async adjustBalance(
    uid: string,
    delta: number,
    reason: string,
    adminId: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/user/adjust-balance`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ uid, delta, reason, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure adjusting balance' };
    }
  }

  // 11. Claim Referral Bonus (Verified 10-day qualifying activity)
  public async claimReferral(referralId: string, callerUid?: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/referral/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralId, callerUid })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure claiming referral bonus' };
    }
  }

  // 12. Fetch Referrals
  public async getReferrals(referrerUid?: string): Promise<ApiResponse> {
    try {
      const url = referrerUid ? `${this.baseUrl}/api/referrals?referrerUid=${encodeURIComponent(referrerUid)}` : `${this.baseUrl}/api/referrals`;
      const res = await fetch(url);
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure loading referrals' };
    }
  }

  // 13. Update Admin Settings
  public async updateSettings(settings: Record<string, unknown>, adminId: string, masterToken?: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/settings/update`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ settings, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure updating settings' };
    }
  }

  public async updateBonusSettings(settings: Record<string, unknown>, adminId: string, masterToken?: string): Promise<ApiResponse> {
    return this.updateSettings(settings, adminId, masterToken);
  }

  // Master Admin Maintenance Mode Toggle
  public async toggleMaintenanceMode(
    enabled: boolean,
    message?: string,
    estimatedResumeTime?: string,
    adminId: string = 'MasterAdmin_01',
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/maintenance/toggle`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({
          enabled,
          message,
          estimatedResumeTime,
          adminId,
          masterAdminToken: masterToken
        })
      });
      return await res.json();
    } catch {
      // Fallback to updating settings
      return this.updateSettings(
        { maintenanceMode: enabled, maintenanceMessage: message, maintenanceEstimatedResumeTime: estimatedResumeTime },
        adminId,
        masterToken
      );
    }
  }

  // 14. Master Admin Referral Review (Approve or Reject)
  public async reviewReferral(
    referralId: string,
    action: 'approve' | 'reject',
    reason: string,
    adminId: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/referral/review`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ referralId, action, reason, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure during referral review' };
    }
  }

  // 15. Master Admin User Status Control (Activate, Suspend, Ban, Deactivate)
  public async updateUserStatus(
    uid: string,
    status: 'active' | 'suspended' | 'banned' | 'deactivated',
    reason: string,
    adminId: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/user/status`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ uid, status, reason, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure updating user status' };
    }
  }

  // 16. Master Admin Feature Module Toggle
  public async toggleFeature(
    featureId: string,
    enabled: boolean,
    visibleInUserApp: boolean,
    reason: string,
    adminId: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/features/toggle`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ featureId, enabled, visibleInUserApp, reason, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure toggling feature' };
    }
  }

  public async toggleAllGames(
    enabled: boolean,
    adminId: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/features/toggle-all-games`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ enabled, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure toggling all games' };
    }
  }

  // 17. Master Admin Gift Code Create / Update / Delete & User Claim
  public async createGiftCode(
    code: string,
    amount: number,
    maxUses: number,
    expiryDays: number,
    minVipLevel: number,
    adminId: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/gift-code/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ code, amount, maxUses, expiryDays, minVipLevel, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure creating gift code' };
    }
  }

  public async updateGiftCode(
    code: string,
    updates: { amount?: number; maxUses?: number; expiryDays?: number; isActive?: boolean; minVipLevel?: number; reason?: string },
    adminId: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/gift-code/update`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ code, ...updates, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure updating gift code' };
    }
  }

  public async deleteGiftCode(
    code: string,
    reason: string,
    adminId: string,
    masterToken?: string
  ): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/gift-code/delete`, {
        method: 'POST',
        headers: this.getAuthHeaders(masterToken),
        body: JSON.stringify({ code, reason, adminId, masterAdminToken: masterToken })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure deleting gift code' };
    }
  }

  public async claimGiftCode(uid: string, code: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/user/gift-code/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, code })
      });
      return await res.json();
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network failure claiming gift code' };
    }
  }
}

export const apiClient = new FinancialApiClient();

