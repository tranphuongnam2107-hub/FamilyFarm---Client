import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import instance from "../../Axios/axiosConfig";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import formatTime from "../../utils/formatTime";

const ListReaction = () => {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReactions = async () => {
    try {
      const response = await instance.get("/api/category-reaction/all");
      setReactions(response.data.data);
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("Can not load reaction list.")
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete?",
      text: "This reaction will be marked as deleted.!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await instance.delete(`/api/category-reaction/delete/${id}`);
        if (response.data.isSuccess) {
          setReactions(
            reactions.map((reaction) =>
              reaction.categoryReactionId === id
                ? {
                  ...reaction, isDeleted: true,
                  lastModified: new Date().toISOString(),
                }
                : reaction
            )
          );
          toast.success(response.data.message || "Reaction successfully deleted!");
        } else {
          toast.error(response.data.message || "Cannot delete reaction.");
        }
      } catch (err) {
        console.error("Error while deleting:", err);
        toast.error("Cannot delete reaction.");
      }
    }
  };

  const handleRestore = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure you want to restore?",
      text: "This reaction will be restored.!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Restore",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await instance.put(`/api/category-reaction/restore/${id}`);
        if (response.data.isSuccess) {
          setReactions(
            reactions.map((reaction) =>
              reaction.categoryReactionId === id
                ? {
                  ...reaction, isDeleted: false,
                  lastModified: new Date().toISOString(),
                }
                : reaction
            )
          );
          toast.success(response.data.message || "Reaction was successfully restored!");
        } else {
          toast.error(response.data.message || "Can not restore reaction.");
        }
      } catch (err) {
        console.error("Error while restoring:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Can not restore reaction.",
        });
      }
    }
  };

  useEffect(() => {
    fetchReactions();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Destroy existing DataTable instance to prevent conflicts
      if ($.fn.DataTable.isDataTable('#reactionTable')) {
        $('#reactionTable').DataTable().destroy();
      }
      $('#reactionTable').DataTable({
        destroy: true, // Ensure table can be reinitialized
      });
    }
  }, [loading, reactions]); // Reinitialize DataTable when reactions change

  return (
    <div className="w-full bg-[#3DB3FB]/5">
      <div className="flex justify-between items-center mb-4 p-4">
        <Link to="/CreateReaction">
          <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 text-sm">
            New Reaction
          </button>
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-600 p-4">Loading data...</p>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <table id="reactionTable" className="display w-full">
            <thead>
              <tr className="bg-[#3DB3FB]/25">
                <th>ID</th>
                <th>Reaction Name</th>
                <th>Last Modified</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reactions.map((reaction) => (
                <tr key={reaction.categoryReactionId} className="py-0.5">
                  <td className="text-left truncate max-w-[150px]">
                    {reaction.categoryReactionId}
                  </td>
                  <td className="text-left truncate max-w-[150px]">
                    {reaction.reactionName}
                  </td>
                  <td className="text-left truncate max-w-[150px]">
                    {formatTime(reaction.lastModified)}
                  </td>
                  <td className="text-left items-center">
                    <img
                      src={reaction.iconUrl}
                      alt="reaction icon"
                      className="w-10 h-10 object-cover rounded"
                    />
                  </td>
                  <td className="text-left space-x-5">
                    <button
                      onClick={() =>
                        reaction.isDeleted
                          ? handleRestore(reaction.categoryReactionId)
                          : handleDelete(reaction.categoryReactionId)
                      }
                      className={
                        reaction.isDeleted
                          ? "text-green-500 hover:text-green-700 text-lg"
                          : "text-red-500 hover:text-red-700 text-lg"
                      }
                    >
                      {reaction.isDeleted ? (
                        <i className="fa-solid fa-rotate-left"></i>
                      ) : (
                        <i className="fa-solid fa-trash"></i>
                      )}
                    </button>
                    {!reaction.isDeleted && (
                      <Link to={`/UpdateReaction/${reaction.categoryReactionId}`}>
                        <button>
                          <i className="fa-solid fa-pen text-gray-400 hover:text-gray-500"></i>
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListReaction;