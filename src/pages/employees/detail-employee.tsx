import { useState } from "react";
import Image from "next/image";

type Gender = "Nam" | "Nữ" | "Khác";
type EmploymentStatus = "Đang làm" | "Nghỉ việc" | "Nghỉ thai sản";

interface Employee {
  employee_id: string;
  avatar_url: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  gender: Gender;
  address: string;
  department_id: string;
  position_id: string;
  employment_status: EmploymentStatus;
  join_date: string;
  leave_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  item: Employee | null;
  drawerId: string;
  fetchTasks: (page: number) => Promise<void>;
}

export default function DetailEmployee({ item, drawerId }: Props) {
  // Các state để chỉnh sửa
  const [avatarUrl, setAvatarUrl] = useState<string>(
    item?.avatar_url || "https://i.pravatar.cc/300"
  );

  if (!item) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Không có dữ liệu nhân viên để hiển thị.</p>
      </div>
    );
  }

  // Image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-1 gap-4 overflow-y-auto"
        style={{ maxHeight: "calc(100dvh - 145px)" }}
      >
        <div className="flex flex-col items-center gap-2">
          <Image
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
            width={80}
            height={80}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered file-input-sm w-full max-w-xs"
          />
        </div>
        <div className="grid flex-col gap-4">
          <div className="grid items-center gap-2">
            <label>Họ và Tên</label>
            <input
              type="text"
              value={item.full_name}
              placeholder="Type here"
              className="input w-50"
            />
          </div>
          <div className="grid col-end-2">
            <label>Ngày sinh</label>
            <input type="date" value={item.birth_date} className="input w-50" />
          </div>
          <div className="grid">
            <label>Gender</label>
            <select value={item.gender} className="select w-50">
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </div>
          <div className="grid col-end-2">
            <label>Số điện thoại</label>
            <input
              type="text"
              value={item.phone_number}
              placeholder="Type here"
              className="input w-50"
            />
          </div>
          <div className="grid col-span-2 col-end-2">
            <label>Email</label>
            <input
              type="text"
              value={item.email}
              placeholder="Type here"
              className="input w-full"
            />
          </div>

          <div className="grid col-span-2 col-end-2">
            <label>Địa chỉ</label>
            <textarea
              className="textarea"
              value={item.address}
              placeholder="Address"
              style={{ width: "100%" }}
            ></textarea>
          </div>
          <div className="grid">
            <label>Ngày vào làm</label>
            <input type="date" value={item.join_date} className="input w-50" />
          </div>
          <div className="grid">
            <label>Status</label>
            <select value={item.employment_status} className="select w-50">
              <option>Đang làm</option>
              <option>Nghỉ việc</option>
              <option>Nghỉ thai sản</option>
            </select>
          </div>

          <div className="grid">
            <label>Phòng ban</label>
            <select value={item.department_id} className="select w-50">
              <option>Nhân sự</option>
              <option>Kế toán</option>
              <option>IT</option>
            </select>
          </div>
          <div className="grid">
            <label>Vị trí công việc</label>
            <input
              type="text"
              value={item.position_id}
              placeholder="Type here"
              className="input w-50"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-70">
        <label htmlFor={drawerId} className="btn btn-soft">
          Đóng
        </label>
        <label htmlFor={drawerId} className="btn btn-primary flex">
          Lưu
        </label>
      </div>
    </div>
  );
}
