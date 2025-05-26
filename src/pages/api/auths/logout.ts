import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface LogoutResponse {
  success: boolean;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LogoutResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Phương thức không được phép' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Xác minh token để đảm bảo người dùng đã đăng nhập
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Ở đây không cần xóa token ở server vì JWT là stateless
    // Frontend sẽ xóa token khỏi localStorage
    return res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}