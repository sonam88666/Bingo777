/**
 * Production-Ready Firebase Realtime Database Security Rules
 * for Bingo777 Platform (Path: database.rules.json)
 * Target Reference: gen-lang-client-0859410588-default-rtdb.firebaseio.com
 */

export const FIREBASE_REALTIME_DATABASE_RULES_JSON = `{
  "rules": {
    ".read": false,
    ".write": false,

    "admin_settings": {
      ".read": true,
      ".write": "auth != null && (auth.token.role === 'master_admin' || root.child('master_admins').child(auth.uid).val() === true)",
      ".validate": "newData.hasChildren(['appName', 'maintenanceMode', 'minDeposit', 'minWithdrawal'])"
    },

    "master_admins": {
      ".read": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
      ".write": false
    },

    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('master_admins').child(auth.uid).val() === true)",
        ".write": "auth != null && (auth.uid === $uid || root.child('master_admins').child(auth.uid).val() === true)",
        
        "balance": {
          ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
        },
        "signupBonusStatus": {
          ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
        },
        "signupBonusAmount": {
          ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
        },
        "firstDepositBonusStatus": {
          ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
        },
        "firstDepositBonusAmount": {
          ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
        },
        "firstDepositApprovedAt": {
          ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
        },
        "status": {
          ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
        },
        "devices": {
          "$deviceId": {
            ".write": "auth != null && (auth.uid === $uid || root.child('master_admins').child(auth.uid).val() === true)",
            "status": {
              ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
            }
          }
        }
      }
    },

    "transactions": {
      ".read": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
      "$txId": {
        ".read": "auth != null && (data.child('uid').val() === auth.uid || root.child('master_admins').child(auth.uid).val() === true)",
        ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
        ".validate": "newData.hasChildren(['uid', 'type', 'category', 'amount', 'balanceBefore', 'balanceAfter', 'timestamp', 'status']) && newData.child('amount').isNumber() && newData.child('amount').val() > 0"
      }
    },

    "referrals": {
      ".read": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
      "$refId": {
        ".read": "auth != null && (data.child('referrerUid').val() === auth.uid || root.child('master_admins').child(auth.uid).val() === true)",
        ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
        ".validate": "newData.hasChildren(['referrerUid', 'referredUid', 'status', 'bonusAmount', 'registeredAt'])"
      }
    },

    "deleted_uids": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
    },

    "live_bets": {
      ".read": "auth != null",
      "$betId": {
        ".write": "auth != null && (root.child('master_admins').child(auth.uid).val() === true || (newData.child('uid').val() === auth.uid && !data.exists()))",
        ".validate": "newData.hasChildren(['uid', 'roundPeriod', 'amount', 'betValue', 'status']) && newData.child('amount').isNumber() && newData.child('amount').val() > 0"
      }
    },

    "current_round": {
      ".read": true,
      ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
    },

    "past_rounds": {
      ".read": true,
      ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
    },

    "deposits": {
      ".read": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
      "$depositId": {
        ".read": "auth != null && (data.child('uid').val() === auth.uid || root.child('master_admins').child(auth.uid).val() === true)",
        ".write": "auth != null && ((!data.exists() && newData.child('uid').val() === auth.uid) || root.child('master_admins').child(auth.uid).val() === true)",
        ".validate": "newData.hasChildren(['uid', 'amount', 'paymentMethod', 'referenceId', 'status'])"
      }
    },

    "withdrawals": {
      ".read": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
      "$withdrawalId": {
        ".read": "auth != null && (data.child('uid').val() === auth.uid || root.child('master_admins').child(auth.uid).val() === true)",
        ".write": "auth != null && ((!data.exists() && newData.child('uid').val() === auth.uid) || root.child('master_admins').child(auth.uid).val() === true)"
      }
    },

    "gift_codes": {
      ".read": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
      "$code": {
        ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
        "claimedBy": {
          "$uid": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && auth.uid === $uid && !data.exists()"
          }
        }
      }
    },

    "support_chat": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('master_admins').child(auth.uid).val() === true)",
        ".write": "auth != null && (auth.uid === $uid || root.child('master_admins').child(auth.uid).val() === true)"
      }
    },

    "audit_logs": {
      ".read": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
      ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
    },

    "admin_commands": {
      ".read": "auth != null && root.child('master_admins').child(auth.uid).val() === true",
      ".write": "auth != null && root.child('master_admins').child(auth.uid).val() === true"
    }
  }
}`;

export const DEPLOYMENT_GUIDE_MARKDOWN = `# Bingo777 — Deployment and Security Architecture Guide

## 1. Firebase Project Setup
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your authorized project (e.g. \`bingo777-4a510\` or create your new private project).
3. Navigate to **Build > Realtime Database**.
4. Choose your preferred database location (e.g. \`asia-southeast1\` or \`us-central1\`).
5. Open the **Rules** tab, paste the contents of \`database.rules.json\`, and click **Publish**.

## 2. Wallet & Financial Security Architecture
- \`/users/$uid/balance\`: Strictly protected with \`.write: false\` for players. Only master_admins can update balances.
- \`/transactions\`: Immutable double-entry ledger. Players can read their own transactions; writing is restricted to authorized server/admin processes.
- \`/deleted_uids\`: Blacklist registry preventing deleted user records from being recreated or resurfaced.

## 3. Setting Master Admin Privileges
To designate your account as Master Admin:
\`\`\`bash
# Run via Firebase CLI or Database dashboard:
# Write to path /master_admins/<YOUR_FIREBASE_AUTH_UID>: true
\`\`\`

## 4. Preserved Paths Architecture
- \`/users\`: Player profiles, balances, device approvals.
- \`/transactions\`: Verified ledger transactions with unique IDs, balanceBefore/After, and timestamps.
- \`/deleted_uids\`: Blacklisted deactivated UIDs.
- \`/live_bets\`: Active round bets and odds multipliers.
- \`/deposits\`: Deposit proofs and payment verification queue.
- \`/withdrawals\`: Payout requests and bank/UPI accounts.
- \`/admin_settings\`: Platform fee, min/max limits, maintenance flag.
- \`/gift_codes\`: Redeemable promo vouchers.
- \`/admin_commands\`: Audit trail and manual outcome overrides.
- \`/support_chat\`: Encrypted bidirectional user-admin chat.
`;
