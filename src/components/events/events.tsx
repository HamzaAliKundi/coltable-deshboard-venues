import { useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../common/Pagination";
import {
  useDeleteEventByVenueMutation,
  useGetAllEventsByVenuesQuery,
} from "../../apis/events";
import toast from "react-hot-toast";

const Events = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;
  const [activeTab, setActiveTab] = useState<"upcoming" | "pending" | "past">(
    "pending"
  );
  const [expandedTitle, setExpandedTitle] = useState<number | null>(null);

  const {
    data: eventsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllEventsByVenuesQuery({
    page: currentPage,
    limit: eventsPerPage,
    status: activeTab,
  });

  const [deleteEventByVenue, { isLoading: isDeleteLoading }] =
    useDeleteEventByVenueMutation();

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Helper function to handle timezone adjustments
  const getLocalDateSafe = (dateString: string) => {
    const date = new Date(dateString);
    if (
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0
    ) {
      const localDate = new Date(date);
      const localDay = localDate.getDate();
      const utcDay = date.getUTCDate();
      if (localDay < utcDay) {
        localDate.setDate(localDate.getDate() + 1);
        return localDate;
      }
    }
    return date;
  };

  const formatDate = (dateString: string) => {
    const date = getLocalDateSafe(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const extractTime = (dateString: string) => {
    const date = getLocalDateSafe(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();

    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteEventByVenue(id).unwrap();
      toast.success("Event deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete event.");
      console.error(error);
    }
  };

  const showLoader = isLoading || isFetching;

  return (
    <div className="bg-black p-4 md:p-8 w-full mb-32">
      {/* Tab Navigation */}
      <div className="flex relative flex-col md:flex-row md:gap-8 mb-6 md:mb-8">
        <div className="grid grid-cols-2 md:flex md:flex-row gap-2 md:gap-4 w-full md:w-auto">
          <button
            className={`px-3 md:px-6 py-2 md:py-4 font-bold text-sm md:text-base transition-all duration-300 relative whitespace-nowrap ${
              activeTab === "upcoming" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => {
              setActiveTab("upcoming");
              setCurrentPage(1);
            }}
          >
            Upcoming Events
            {activeTab === "upcoming" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF00A2]"></div>
            )}
          </button>
          <button
            className={`px-3 md:px-6 py-2 md:py-4 font-bold text-sm md:text-base transition-all duration-300 relative whitespace-nowrap ${
              activeTab === "pending" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => {
              setActiveTab("pending");
              setCurrentPage(1);
            }}
          >
            Pending Events
            {activeTab === "pending" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF00A2]"></div>
            )}
          </button>
          <button
            className={`px-3 md:px-6 py-2 md:py-4 font-bold text-sm md:text-base transition-all duration-300 relative whitespace-nowrap ${
              activeTab === "past" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => {
              setActiveTab("past");
              setCurrentPage(1);
            }}
          >
            Past Events
            {activeTab === "past" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF00A2]"></div>
            )}
          </button>
        </div>
        <div className="absolute md:-right-4 right-0 top-20 md:top-16 flex items-center gap-3 text-white lg:top-0">
          <Link to="/event/create-event" className="font-['Space_Grotesk']">
            Create event
          </Link>
        </div>
      </div>

      {/* Conditional Rendering */}
      {showLoader ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-[#FF00A2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : eventsData?.docs?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white text-xl">No {activeTab} events found!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center md:justify-start">
            {eventsData?.docs?.map((event: any, index: number) => (
              <div
                key={`${event._id}-${index}`}
                className="bg-[#212121] mt-7 rounded-[8px] overflow-hidden w-full max-w-[300px] flex flex-col mx-auto md:mx-0"
              >
                <div className="p-2 relative">
                  <img
                    src={event?.image}
                    alt="Event"
                    className="w-full h-[220px] rounded-[8px] object-cover"
                  />
                  <div className="absolute top-3 left-3 w-[70px] h-[70px] bg-gradient-to-b from-[#FF00A2] to-[#D876B5] rounded-full flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#e3d4de] leading-none">
                      {formatDate(event.startDate)
                        ?.replace(",", "")
                        .slice(3, 6)}
                    </span>
                    <span className="text-lg font-semibold text-[#ebd4e3] uppercase leading-none">
                      {formatDate(event.startDate)?.slice(0, 3)}
                    </span>
                  </div>
                </div>

                <div className="p-3 flex flex-col">
                  <h2
                    className="text-white font-['Space_Grotesk'] font-bold text-base capitalize mb-3 cursor-pointer"
                    onClick={() =>
                      setExpandedTitle(expandedTitle === index ? null : index)
                    }
                  >
                    {expandedTitle === index
                      ? event.title
                      : event.title.length > 20
                      ? `${event.title.substring(0, 20)}...`
                      : event.title}
                  </h2>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src="/events/time.svg"
                        alt="Time"
                        className="w-4 h-4"
                      />
                      <p className="font-['Space_Grotesk'] font-normal text-sm leading-none text-white">
                        Starts: {extractTime(event.startTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src="/events/location.svg"
                        alt="Location"
                        className="w-4 h-4"
                      />
                      <p className="font-['Space_Grotesk'] font-normal text-sm leading-none text-white">
                        {event.host || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Link to={`/events/event-preview/${event._id}`}>
                      <button className="w-full h-[35px] bg-[#FF00A2] text-white text-xs font-medium rounded-[30px]">
                        VIEW DETAILS
                      </button>
                    </Link>
                    <div className="flex gap-2">
                      <button
                        className={`w-1/2 h-[35px] bg-[#212121] border-[1px] border-[#FFFFFF] text-white text-xs font-normal rounded-[82px] ${
                          isDeleteLoading
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                        onClick={() => handleDeleteClick(event?._id)}
                      >
                        {isDeleteLoading ? (
                          <div className="flex justify-center px-[17px]">
                            <div className="w-4 h-4 border-2 border-[#d6a7c4] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          "Delete Event"
                        )}
                      </button>
                      <Link
                        to={`/event/create-event/${event._id}`}
                        className="w-1/2 h-[35px] bg-[#212121] border-[1px] border-[#FFFFFF] text-white text-xs font-normal rounded-[82px] flex items-center justify-center"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {eventsData?.totalPages > 1 && (
            <div className="flex mt-10 justify-center items-center">
              <Pagination
                currentPage={currentPage}
                totalPages={eventsData?.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Events;
