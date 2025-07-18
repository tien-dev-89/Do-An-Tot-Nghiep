import React from "react";
import { Trash } from "lucide-react";

interface DeleteRewardPenaltyButtonProps {
  id: string;
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteRewardPenaltyButton({
  id,
  onDelete,
}: DeleteRewardPenaltyButtonProps) {
  const handleClick = async () => {
    if (!confirm("Bạn có chắc muốn xóa thưởng/phạt này?")) return;
    await onDelete(id);
  };

  return (
    <button
      className="btn btn-sm btn-outline btn-square btn-error"
      onClick={handleClick}
    >
      <Trash size={16} />
    </button>
  );
}
