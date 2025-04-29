import { Calendar, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  useAddEventByVenueMutation,
  useGetEventsByVenuesByIdQuery,
  useUpdateEventByVenueMutation,
} from "../../../apis/events";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type FormData = {
  eventName: string;
  eventHost: string;
  eventType: string;
  soundEquipment?: string;
  outdoorCoverings?: string;
  eventCategory?: string;
  eventTheme?: string;
  audienceType: string;
  equipmentResponsibility: string;
  startTime: string;
  endTime: string;
  hostsCount: string;
  performersCount: string;
  callTime: string;
  performerNumbers: string;
  dressingArea: string;
  musicDeadline: string;
  specialRequests?: string;
  logo: string;
};

const CreateEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  const [addEventByVenue, { isLoading: createEventLoading }] =
    useAddEventByVenueMutation();
  const [updateEventByVenue, { isLoading: updateEventLoading }] =
    useUpdateEventByVenueMutation();
  const { data: getEventsByVenuesById, isLoading: getEventLoading } =
    useGetEventsByVenuesByIdQuery(id, {
      skip: !id,
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const handleLogoUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/gif";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setLogoUploading(true);
          // First show preview
          const reader = new FileReader();
          reader.onload = () => {
            setLogoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);

          // Create timestamp for signature
          const timestamp = Math.round(new Date().getTime() / 1000).toString();

          // Create the string to sign
          const str_to_sign = `timestamp=${timestamp}${
            import.meta.env.VITE_CLOUDINARY_API_SECRET
          }`;

          // Generate SHA-1 signature
          const signature = await generateSHA1(str_to_sign);

          // Upload to Cloudinary using signed upload
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
          formData.append("timestamp", timestamp);
          formData.append("signature", signature);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${
              import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
            }/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Upload failed");
          }

          const data = await response.json();
          setLogoUrl(data.secure_url);
          toast.success("Logo uploaded successfully!");
        } catch (error) {
          console.error("Failed to upload logo:", error);
          toast.error("Failed to upload logo. Please try again.");
        } finally {
          setLogoUploading(false); // Upload complete
        }
      }
    };

    input.click();
  };

  const generateSHA1 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  useEffect(() => {
    if (id && getEventsByVenuesById?.event) {
      reset({
        eventName: getEventsByVenuesById.event.title || "",
        eventHost: getEventsByVenuesById.event.host || "",
        eventType: getEventsByVenuesById.event.type || "",
        eventTheme: getEventsByVenuesById.event.theme || "",
        audienceType: getEventsByVenuesById.event.audienceType,
        startTime: getEventsByVenuesById.event.startTime
          ? new Date(getEventsByVenuesById.event.startTime)
              .toISOString()
              .slice(0, 16)
          : undefined,
        endTime: getEventsByVenuesById.event.endTime
          ? new Date(getEventsByVenuesById.event.endTime)
              .toISOString()
              .slice(0, 16)
          : undefined,
        musicDeadline: getEventsByVenuesById.event.musicFormat || undefined,
        equipmentResponsibility:
          getEventsByVenuesById.event.isEquipmentProvidedByPerformer || "",
        hostsCount: getEventsByVenuesById.event.hosts || "",
        performersCount: getEventsByVenuesById.event.performers || "",
        callTime: getEventsByVenuesById.event.eventCallTime || "",
        dressingArea: getEventsByVenuesById.event.hasPrivateDressingArea || "",
        specialRequests: getEventsByVenuesById.event.specialRequirements || "",
        outdoorCoverings: getEventsByVenuesById.event.hasCoverings || "",
        soundEquipment:
          getEventsByVenuesById.event.isEquipmentProvidedByVenue || "",
        performerNumbers: getEventsByVenuesById.event.assignedPerformers || "",
        eventCategory: getEventsByVenuesById.event.eventCategory || "",
      });

      if (getEventsByVenuesById?.event?.image) {
        setLogoUrl(getEventsByVenuesById.event.image);
        setLogoPreview(getEventsByVenuesById.event.image);
      }
    }
  }, [id, getEventsByVenuesById, reset]);

  const onSubmit = async (data: FormData) => {
    console.log("abcd", data);

    const transformedData = {
      title: data.eventName,
      host: data.eventHost,
      type: data.eventType,
      theme: data.eventTheme,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      specialRequirements: data.specialRequests,
      audienceType: data.audienceType,
      hosts: data.hostsCount,
      eventCallTime: data.callTime,
      hasCoverings: data.outdoorCoverings,
      hasPrivateDressingArea: data.dressingArea,
      isEquipmentProvidedByVenue: data.soundEquipment,
      isEquipmentProvidedByPerformer: data.equipmentResponsibility,
      performers: data.performersCount,
      musicFormat: data.musicDeadline,
      assignedPerformers: data.performerNumbers,
      image: logoUrl,
      eventCategory: data.eventCategory,
    };

    try {
      if (id) {
        await updateEventByVenue({
          id,
          eventData: transformedData,
        }).unwrap();
        toast.success("Event updated successfully!");
      } else {
        await addEventByVenue(transformedData).unwrap();
        toast.success("Event created successfully!");
      }
      navigate("/events");
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(
        `Failed to ${id ? "update" : "create"} event. Please try again.`
      );
    }
  };

  const isSubmitting =
    createEventLoading || updateEventLoading || logoUploading;

  if (getEventLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-2 border-[#FF00A2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:px-8 py-16 bg-black">
      <div className="w-[100px] my-3 h-[4px] rounded-lg bg-[#FF00A2]"></div>
      <h1 className="text-white text-3xl font-space-grotesk mb-8">
        Event Creation Form
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Event Name and Host */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Name*
            </label>
            <input
              type="text"
              placeholder="Event Name"
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("eventName", { required: "Event name is required" })}
            />
            {errors.eventName && (
              <span className="text-red-500 text-sm">
                {errors.eventName.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Host*
            </label>
            <input
              type="text"
              placeholder="Event Host Name"
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("eventHost", { required: "Event host is required" })}
            />
            {errors.eventHost && (
              <span className="text-red-500 text-sm">
                {errors.eventHost.message}
              </span>
            )}
          </div>
        </div>

        {/* Event type dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-white font-space-grotesk text-sm md:text-base">
            Event type*
          </label>
          <div className="relative">
            <select
              required
              defaultValue=""
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none invalid:text-gray-500"
              {...register("eventType", { required: "Event type is required" })}
            >
              <option value="" disabled hidden>
                Select
              </option>
              <option value="drag-show" className="text-white">
                Drag Show
              </option>
              <option value="drag-brunch" className="text-white">
                Drag Brunch
              </option>
              <option value="drag-bingo" className="text-white">
                Drag Bingo
              </option>
              <option value="drag-trivia" className="text-white">
                Drag Trivia
              </option>
              <option value="comedy-show" className="text-white">
                Comedy Show
              </option>
              <option value="music-concert" className="text-white">
                Music Concert
              </option>
              <option value="dance-performance" className="text-white">
                Dance Performance
              </option>
              <option value="theater-show" className="text-white">
                Theater Show
              </option>
              <option value="other" className="text-white">
                Other
              </option>
            </select>
            <div className="absolute right-4 top-[13px] pointer-events-none">
              <ChevronDown color="white" size={16} />
            </div>
          </div>
          {errors.eventType && (
            <span className="text-red-500 text-sm">
              {errors.eventType.message}
            </span>
          )}
        </div>

        {/* Sound Equipment and Outdoor Venue Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 self-end">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Does the venue have sound equipment for music,microphone,DJ, etc?*
            </label>
            <input
              type="text"
              placeholder="Enter here"
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("soundEquipment", {
                required: "Equipment information is required",
              })}
            />
            {errors.soundEquipment && (
              <span className="text-red-500 text-sm">
                {errors.soundEquipment.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              If an Outdoor venue, are there awnings/coverings to account for
              inclement weather conditions?*
            </label>
            <input
              type="text"
              placeholder="Ener here"
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("outdoorCoverings", {
                required: "Outdoor information is required",
              })}
            />
            {errors.outdoorCoverings && (
              <span className="text-red-500 text-sm">
                {errors.outdoorCoverings.message}
              </span>
            )}
          </div>
        </div>
        {/* Event Type and Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Category*
            </label>
            <input
              type="text"
              placeholder="Event Category"
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("eventCategory", {
                required: "Event category information is required",
              })}
            />
            {errors.eventCategory && (
              <span className="text-red-500 text-sm">
                {errors.eventCategory.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Theme*
            </label>
            <input
              type="text"
              placeholder="Event Theme"
              className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
              {...register("eventTheme", {
                required: "Event theme information is required",
              })}
            />
            {errors.eventTheme && (
              <span className="text-red-500 text-sm">
                {errors.eventTheme.message}
              </span>
            )}
          </div>
        </div>

        {/* Equipment Responsibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 self-end">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Audience Type*
            </label>
            <div className="relative">
              <select
                required
                defaultValue=""
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none invalid:text-gray-500"
                {...register("audienceType", {
                  required: "Audience type is required",
                })}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="adults" className="text-white">
                  Adults
                </option>
                <option value="children" className="text-white">
                  Children
                </option>
                <option value="all" className="text-white">
                  All Ages
                </option>
              </select>
              <div className="absolute right-4 top-[13px] pointer-events-none">
                <ChevronDown color="white" size={16} />
              </div>
            </div>
            {errors.audienceType && (
              <span className="text-red-500 text-sm">
                {errors.audienceType.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base ">
              Is the Performer responsible for supplying any equipment (i.e.
              Audio/Visual, microphones, games, bingo cards/setup, etc.)?*
            </label>
            <div className="relative">
              <select
                required
                defaultValue=""
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none invalid:text-gray-500"
                {...register("equipmentResponsibility", {
                  required: "This field is required",
                })}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="yes" className="text-white">
                  Yes
                </option>
                <option value="no" className="text-white">
                  No
                </option>
              </select>
              <div className="absolute right-4 top-[13px] pointer-events-none">
                <ChevronDown color="white" size={16} />
              </div>
            </div>
            {errors.equipmentResponsibility && (
              <span className="text-red-500 text-sm">
                {errors.equipmentResponsibility.message}
              </span>
            )}
          </div>
        </div>

        {/* Event Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Start Time*
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500"
                {...register("startTime", {
                  required: "Start time is required",
                })}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Calendar color="white" size={20} />
              </div>
            </div>

            {errors.startTime && (
              <span className="text-red-500 text-sm">
                {errors.startTime.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event End Time*
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500"
                {...register("endTime", { required: "End time is required" })}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Calendar color="white" size={20} />
              </div>
            </div>

            {errors.endTime && (
              <span className="text-red-500 text-sm">
                {errors.endTime.message}
              </span>
            )}
          </div>
        </div>

        {/* Hosts and Performers Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              How many hosts/co-hosts?*
            </label>
            <div className="relative">
              <select
                required
                defaultValue=""
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none invalid:text-gray-500"
                {...register("hostsCount", {
                  required: "Host count is required",
                })}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="0" className="text-white">
                  0
                </option>
                <option value="1" className="text-white">
                  1
                </option>
                <option value="2" className="text-white">
                  2
                </option>
                <option value="3" className="text-white">
                  3
                </option>
                <option value="4" className="text-white">
                  4
                </option>
                <option value="5" className="text-white">
                  5
                </option>
              </select>
              <div className="absolute right-4 top-[13px] pointer-events-none">
                <ChevronDown color="white" size={16} />
              </div>
            </div>
            {errors.hostsCount && (
              <span className="text-red-500 text-sm">
                {errors.hostsCount.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              How many Performers (incl. host) will be part of the event?*
            </label>
            <div className="relative">
              <select
                required
                defaultValue=""
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none invalid:text-gray-500"
                {...register("performersCount", {
                  required: "Performers count is required",
                })}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="0" className="text-white">
                  0
                </option>
                <option value="1" className="text-white">
                  1
                </option>
                <option value="2" className="text-white">
                  2
                </option>
                <option value="3" className="text-white">
                  3
                </option>
                <option value="4" className="text-white">
                  4
                </option>
                <option value="5" className="text-white">
                  5
                </option>
              </select>
              <div className="absolute right-4 top-[13px] pointer-events-none">
                <ChevronDown color="white" size={16} />
              </div>
            </div>
            {errors.performersCount && (
              <span className="text-red-500 text-sm">
                {errors.performersCount.message}
              </span>
            )}
          </div>
        </div>

        {/* Equipment Responsibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 ">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Event Call Time*
            </label>
            <div className="relative">
              <select
                required
                defaultValue=""
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none invalid:text-gray-500"
                {...register("callTime", { required: "Call time is required" })}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="1-hour" className="text-white">
                  1 hour before
                </option>
                <option value="2-hours" className="text-white">
                  2 hours before
                </option>
                <option value="3-hours" className="text-white">
                  3 hours before
                </option>
                <option value="other" className="text-white">
                  Other
                </option>
              </select>
              <div className="absolute right-4 top-[13px] pointer-events-none">
                <ChevronDown color="white" size={16} />
              </div>
            </div>
            {errors.callTime && (
              <span className="text-red-500 text-sm">
                {errors.callTime.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              How Many numbers will the performer/each performer have?*
            </label>
            <div className="relative">
              <select
                required
                defaultValue=""
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none invalid:text-gray-500"
                {...register("performerNumbers", {
                  required: "This field is required",
                })}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="1" className="text-white">
                  1
                </option>
                <option value="2" className="text-white">
                  2
                </option>
                <option value="3" className="text-white">
                  3
                </option>
                <option value="4" className="text-white">
                  4
                </option>
                <option value="5" className="text-white">
                  5
                </option>
              </select>
              <div className="absolute right-4 top-[13px] pointer-events-none">
                <ChevronDown color="white" size={16} />
              </div>
            </div>
            {errors.performerNumbers && (
              <span className="text-red-500 text-sm">
                {errors.performerNumbers.message}
              </span>
            )}
          </div>
        </div>

        {/* Dressing Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              Is there a Private Dressing area to allow for the performers to
              change costumes?*
            </label>
            <div className="relative">
              <select
                required
                defaultValue=""
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none invalid:text-gray-500"
                {...register("dressingArea", {
                  required: "This field is required",
                })}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="yes" className="text-white">
                  Yes
                </option>
                <option value="no" className="text-white">
                  No
                </option>
              </select>
              <div className="absolute right-4 top-[13px] pointer-events-none">
                <ChevronDown color="white" size={16} />
              </div>
            </div>
            {errors.dressingArea && (
              <span className="text-red-500 text-sm">
                {errors.dressingArea.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white font-space-grotesk text-sm md:text-base">
              What format will the performer need to provide the music/and
              needed by date/time?*
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                className="w-full h-10 bg-[#0D0D0D] rounded-lg px-3 text-white font-space-grotesk text-base focus:outline-none focus:ring-1 focus:ring-pink-500"
                {...register("musicDeadline", {
                  required: "Deadline is required",
                })}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Calendar color="white" size={20} />
              </div>
            </div>
            {errors.musicDeadline && (
              <span className="text-red-500 text-sm">
                {errors.musicDeadline.message}
              </span>
            )}
          </div>
        </div>

        {/* Special Requests */}
        <div className="flex flex-col gap-2">
          <label className="text-white font-space-grotesk text-sm md:text-base">
            Any special Requests for the performer?
          </label>
          <textarea
            placeholder="Type..."
            rows={6}
            className="w-full bg-[#0D0D0D] rounded-lg p-3 text-white font-space-grotesk text-base placeholder:text-[#878787] focus:outline-none focus:ring-1 focus:ring-pink-500"
            {...register("specialRequests")}
          />
        </div>

        {/* Logo Upload */}
        <div className="w-full max-w-[782px] self-center bg-black p-4">
          <h2 className="font-['Space_Grotesk'] text-white text-[20px] leading-[100%] mb-4">
            Upload Logo
          </h2>

          <div
            className="bg-[#0D0D0D] rounded-[16px] px-8 py-3 text-center 
               cursor-pointer"
            onClick={handleLogoUpload}
          >
            {logoPreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={logoPreview}
                  alt="Venue Logo"
                  className="w-32 h-32 object-contain mb-4"
                />
                <p className="text-[#FF00A2]">Click to change logo</p>
              </div>
            ) : (
              <>
                <p className="text-[#3D3D3D] font-['Space_Grotesk'] text-[12px] leading-[100%] tracking-[0%] text-center capitalize mb-2">
                  Please Upload The Venue Logo In PNG Or JPG Format, With A
                  Recommended Size
                </p>
                <p className="text-[#3D3D3D] font-['Space_Grotesk'] text-[12px] leading-[100%] tracking-[0%] text-center capitalize mb-4">
                  Of [Specify Dimensions, E.G., 500x500px]
                </p>
                <div className="bg-[#FF00A2] text-black rounded-lg px-8 py-3 inline-block font-['Space_Grotesk'] text-[16px] leading-[100%] tracking-[0%] text-center capitalize">
                  Upload
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`mt-4 bg-[#FF00A2] text-white font-space-grotesk text-base py-2 px-12 rounded-full hover:bg-pink-600 transition-colors w-fit ml-auto 
            ${isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            `}
        >
          {isSubmitting ? (
            <div className="flex justify-center px-[17px]">
              <div className="w-6 h-6 border-2 border-[#eeeaed] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : id ? (
            "UPDATE"
          ) : (
            "SUBMIT"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
