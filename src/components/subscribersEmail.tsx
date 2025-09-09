"use client";

import { db } from "@/app/api/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

// تعريف واجهة Subscriber
interface Subscriber {
  id: string;
  email: string;
  createdAt?: import('firebase/firestore').Timestamp;
}

export default function SubscribersList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]); // تحديد النوع صراحة
  const [visibleCount, setVisibleCount] = useState(5); // كم نعرض

  const fetchSubscribers = async () => {
    const querySnapshot = await getDocs(collection(db, "subscribers"));
    const subs: Subscriber[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email || "",
      createdAt: doc.data().createdAt,
    }));
    setSubscribers(subs);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // حذف مشترك
  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا البريد؟")) {
      try {
        await deleteDoc(doc(db, "subscribers", id));
        setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
      } catch (error) {
        console.error("خطأ في الحذف:", error);
      }
    }
  };

  // تصدير CSV
  const exportCSV = () => {
    const headers = ["Email", "Created At"];
    const rows = subscribers.map((sub) => [
      sub.email,
      sub.createdAt?.toDate().toLocaleString() || "",
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "subscribers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // تصدير Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      subscribers.map((sub) => ({
        Email: sub.email,
        "Created At": sub.createdAt?.toDate().toLocaleString() || "",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subscribers");
    XLSX.writeFile(wb, "subscribers.xlsx");
  };

  // عرض المزيد
  const loadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          تصدير CSV
        </button>
        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          تصدير Excel
        </button>
      </div>

      <ul className="space-y-2">
        {subscribers.slice(0, visibleCount).map((sub) => (
          <li
            key={sub.id}
            className="border p-2 rounded flex justify-between items-center"
          >
            <div>
              {sub.email} <br />
              <span className="text-sm text-gray-500">
                {sub.createdAt?.toDate().toLocaleString() || ""}
              </span>
            </div>
            <button
              onClick={() => handleDelete(sub.id)}
              className="bg-red-600 text-white px-2 py-1 rounded-xl hover:bg-red-500 transition flex justify-center items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </button>
          </li>
        ))}
      </ul>

      {visibleCount < subscribers.length && (
        <div className="mt-4">
          <button
            onClick={loadMore}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition"
          >
            عرض المزيد
          </button>
        </div>
      )}
    </div>
  );
}