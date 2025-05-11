"use client";

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

export default function AddEmployee({ drawerId }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://i.pravatar.cc/300"
  );
  const [fullName, setFullName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<Gender>("Nam");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [joinDate, setJoinDate] = useState<string>("");
  const [status, setStatus] = useState<EmploymentStatus>("Đang làm");
  const [department, setDepartment] = useState<string>("");
  const [position, setPosition] = useState<string>("");

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
    <div className="">
      <div
        style={{ maxHeight: "calc(100dvh - 143px)" }}
        className="overflow-y-auto"
      >
        <div className="flex flex-col items-center gap-2 p-6">
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
        <div className="grid gap-4 p-6">
          <div>
            <label>Họ và Tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label>Ngày sinh</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label>Giới tính</label>
            <select
              value={gender}
              defaultValue="Gender"
              onChange={(e) => setGender(e.target.value as Gender)}
              className="select select-bordered w-full"
            >
              <option disabled={true}>Gender</option>
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </div>
          <div>
            <label>Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label>Địa chỉ</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>
          <div>
            <label>Ngày vào làm</label>
            <input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label>Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
              className="select select-bordered w-full"
            >
              <option>Đang làm</option>
              <option>Nghỉ việc</option>
              <option>Nghỉ thai sản</option>
            </select>
          </div>
          <div>
            <label>Phòng ban</label>
            <select
              value={department}
              defaultValue="Phòng ban"
              onChange={(e) =>
                setDepartment(e.target.value as EmploymentStatus)
              }
              className="select select-bordered w-full"
            >
              <option disabled={true}>Phòng ban</option>
              <option>Nhân sự</option>
              <option>Kế toán</option>
              <option>IT</option>
            </select>
          </div>
          <div>
            <label>Vị trí công việc</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 px-6 py-4">
        <label htmlFor={drawerId} className="btn btn-soft">
          Đóng
        </label>
        <button className="btn btn-outline btn-primary">Reset</button>
        <button
          className="btn btn-primary"
          onClick={() => alert("Chưa xử lý lưu")}
        >
          Thêm
        </button>
      </div>
    </div>
  );
}
