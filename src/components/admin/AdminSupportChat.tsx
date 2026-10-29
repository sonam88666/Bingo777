import React from 'react';
import { AdminTelegramSupport } from './AdminTelegramSupport';

interface AdminSupportChatProps {
  adminId: string;
}

export const AdminSupportChat: React.FC<AdminSupportChatProps> = ({ adminId }) => {
  return <AdminTelegramSupport adminId={adminId} />;
};
