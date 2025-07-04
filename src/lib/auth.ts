import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export const authenticateToken = async (req: NextApiRequest, res: NextApiResponse, allowedRoles: string[]) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, error: 'Không có token' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      user_id: unknown; roles: string[]; employee_id?: string; username?: string; email?: string
    };
    console.log('Decoded token:', decoded); // Log để gỡ lỗi
    const userRoles = decoded.roles || [];
    console.log('User roles:', userRoles); // Log roles
    // Ánh xạ vai trò 'Admin' thành 'role_admin' để khớp với cơ sở dữ liệu
    const mappedRoles = userRoles.map(role => role === 'Admin' ? 'role_admin' : role);
    console.log('Mapped roles:', mappedRoles); // Log roles đã ánh xạ
    const hasPermission = mappedRoles.some(role => allowedRoles.includes(role));
    console.log('Has permission:', hasPermission, 'Allowed roles:', allowedRoles); // Log kết quả kiểm tra quyền

    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Không có quyền truy cập. Yêu cầu vai trò admin.' });
      return null;
    }

    return { userId: decoded.user_id, roles: mappedRoles };
  } catch (error: unknown) {
    console.error('Lỗi xác minh token:', error);
    res.status(401).json({ success: false, error: 'Token không hợp lệ' });
    return null;
  }
};